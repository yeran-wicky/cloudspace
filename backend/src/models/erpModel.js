const pool = require('../config/db');

class ERPModel {

    async getAllOrders(status = 'All', page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        let query, countQuery, params, countParams;

        if (status === 'All') {
            countQuery = 'SELECT COUNT(*)::int AS count FROM orders';
            countParams = [];
            query = `SELECT o.*, i.item_name
                     FROM orders o JOIN inventory i ON o.item_id = i.id
                     ORDER BY o.created_at DESC LIMIT $1 OFFSET $2`;
            params = [limit, offset];
        } else {
            countQuery = 'SELECT COUNT(*)::int AS count FROM orders WHERE status = $1';
            countParams = [status];
            query = `SELECT o.*, i.item_name
                     FROM orders o JOIN inventory i ON o.item_id = i.id
                     WHERE o.status = $1
                     ORDER BY o.created_at DESC LIMIT $2 OFFSET $3`;
            params = [status, limit, offset];
        }

        const [countRes, dataRes] = await Promise.all([
            pool.query(countQuery, countParams),
            pool.query(query, params)
        ]);

        const total = countRes.rows[0].count;
        const totalPages = Math.ceil(total / limit);
        return {
            orders: dataRes.rows,
            pagination: {
                total,
                page,
                limit,
                totalPages
            },
            total,
            page,
            limit,
            totalPages
        };
    }

    async getOrderCounts() {
        const { rows } = await pool.query(
            `SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status`
        );
        const counts = { All: 0, Pending: 0, Approved: 0, Completed: 0, Canceled: 0, Returned: 0 };
        rows.forEach(r => { counts[r.status] = r.count; counts.All += r.count; });
        return counts;
    }

    async getOrderById(id) {
        const { rows } = await pool.query(
            `SELECT o.*, i.item_name FROM orders o JOIN inventory i ON o.item_id = i.id WHERE o.id = $1`,
            [id]
        );
        return rows[0] || null;
    }

    async createOrder(data) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const orderId = `ORD-${String(Math.floor(10000 + Math.random() * 90000))}`;

            const itemRes = await client.query('SELECT * FROM inventory WHERE id = $1', [data.item_id]);
            if (itemRes.rows.length === 0) throw new Error('Inventory item not found');
            const item = itemRes.rows[0];

            const { rows } = await client.query(
                `INSERT INTO orders (order_id, customer_name, status, item_id, req_qty, part_number, due_date)
                 VALUES ($1, $2, 'Pending', $3, $4, $5, $6) RETURNING *`,
                [orderId, data.customer_name, data.item_id, data.req_qty, item.part_number, data.due_date]
            );

            await client.query('COMMIT');
            return rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async approveOrderTransaction(orderId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const orderRes = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
            if (orderRes.rows.length === 0) throw new Error('Order not found');
            const order = orderRes.rows[0];

            if (order.status !== 'Pending')
                throw new Error(`Cannot approve order with status "${order.status}"`);

            const itemRes = await client.query('SELECT * FROM inventory WHERE id = $1 FOR UPDATE', [order.item_id]);
            if (itemRes.rows.length === 0) throw new Error('Inventory item not found');
            const item = itemRes.rows[0];

            if (item.qty < order.req_qty)
                throw new Error(`Insufficient stock. Required: ${order.req_qty}, Available: ${item.qty}`);

            await client.query('UPDATE inventory SET qty = qty - $1 WHERE id = $2', [order.req_qty, order.item_id]);
            await client.query("UPDATE orders SET status = 'Approved' WHERE id = $1", [orderId]);

            await client.query('COMMIT');
            return { success: true, message: `Order ${order.order_id} approved. Stock deducted: ${order.req_qty} units.` };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async completeOrder(orderId) {
        const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
        if (rows.length === 0) throw new Error('Order not found');
        if (rows[0].status !== 'Approved')
            throw new Error(`Cannot complete order with status "${rows[0].status}"`);

        await pool.query("UPDATE orders SET status = 'Completed' WHERE id = $1", [orderId]);
        return { success: true, message: `Order ${rows[0].order_id} marked as completed.` };
    }

    async cancelOrder(orderId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const orderRes = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
            if (orderRes.rows.length === 0) throw new Error('Order not found');
            const order = orderRes.rows[0];

            if (!['Pending', 'Approved'].includes(order.status))
                throw new Error(`Cannot cancel order with status "${order.status}"`);

            if (order.status === 'Approved') {
                await client.query('UPDATE inventory SET qty = qty + $1 WHERE id = $2', [order.req_qty, order.item_id]);
            }

            await client.query("UPDATE orders SET status = 'Canceled' WHERE id = $1", [orderId]);
            await client.query('COMMIT');

            const extra = order.status === 'Approved' ? ` Stock restored: ${order.req_qty} units.` : '';
            return { success: true, message: `Order ${order.order_id} canceled.${extra}` };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async returnOrder(orderId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const orderRes = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
            if (orderRes.rows.length === 0) throw new Error('Order not found');
            const order = orderRes.rows[0];

            if (order.status !== 'Completed')
                throw new Error(`Cannot return order with status "${order.status}"`);

            await client.query('UPDATE inventory SET qty = qty + $1 WHERE id = $2', [order.req_qty, order.item_id]);
            await client.query("UPDATE orders SET status = 'Returned' WHERE id = $1", [orderId]);

            await client.query('COMMIT');
            return { success: true, message: `Order ${order.order_id} returned. Stock restored: ${order.req_qty} units.` };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async getAllInventory() {
        const { rows } = await pool.query(
            'SELECT * FROM inventory ORDER BY category ASC, item_name ASC'
        );
        return rows;
    }

    async getLowStockItems() {
        const { rows } = await pool.query(
            'SELECT * FROM inventory WHERE qty < reorder_level ORDER BY (qty::float / NULLIF(reorder_level,0)) ASC'
        );
        return rows;
    }

    async getDashboardMetrics() {
        const client = await pool.connect();
        try {
            const [revRes, activeRes, lowRes, invRes, pendRes] = await Promise.all([
                client.query(`SELECT COALESCE(SUM(o.req_qty * i.unit_price), 0)::float AS total_revenue
                              FROM orders o JOIN inventory i ON o.item_id = i.id
                              WHERE o.status IN ('Approved','Completed')`),
                client.query(`SELECT COUNT(*)::int AS active_orders FROM orders WHERE status IN ('Pending','Approved')`),
                client.query(`SELECT COUNT(*)::int AS low_stock_count FROM inventory WHERE qty < reorder_level`),
                client.query(`SELECT COALESCE(SUM(qty * unit_price), 0)::float AS inventory_value FROM inventory`),
                client.query(`SELECT COUNT(*)::int AS pending_orders FROM orders WHERE status = 'Pending'`)
            ]);

            return {
                totalRevenue:   revRes.rows[0].total_revenue,
                activeOrders:   activeRes.rows[0].active_orders,
                lowStockCount:  lowRes.rows[0].low_stock_count,
                inventoryValue: invRes.rows[0].inventory_value,
                pendingOrders:  pendRes.rows[0].pending_orders
            };
        } finally {
            client.release();
        }
    }

    async getMonthlySalesTrends() {
        const { rows } = await pool.query(`
            SELECT TO_CHAR(o.created_at, 'Mon')          AS month,
                   EXTRACT(MONTH FROM o.created_at)::int  AS month_num,
                   COUNT(*)::int                          AS order_count,
                   COALESCE(SUM(o.req_qty * i.unit_price), 0)::float AS revenue
            FROM orders o
            JOIN inventory i ON o.item_id = i.id
            WHERE o.status IN ('Approved','Completed')
              AND o.created_at >= NOW() - INTERVAL '6 months'
            GROUP BY 1, 2
            ORDER BY month_num
        `);
        return rows;
    }
}

module.exports = new ERPModel();
