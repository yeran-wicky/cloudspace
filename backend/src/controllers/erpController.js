const erpModel = require('../models/erpModel');

class ERPController {

    async getOrders(req, res) {
        try {
            const { status = 'All', page = 1, limit = 10 } = req.query;
            const result = await erpModel.getAllOrders(status, parseInt(page), parseInt(limit));
            res.status(200).json(result);
        } catch (error) {
            console.error('[getOrders]', error.message);
            res.status(500).json({ success: false, message: 'Failed to fetch orders' });
        }
    }

    async getOrderCounts(req, res) {
        try {
            const counts = await erpModel.getOrderCounts();
            res.status(200).json(counts);
        } catch (error) {
            console.error('[getOrderCounts]', error.message);
            res.status(500).json({ success: false, message: 'Failed to fetch order counts' });
        }
    }

    async getOrderById(req, res) {
        try {
            const order = await erpModel.getOrderById(req.params.id);
            if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
            res.status(200).json(order);
        } catch (error) {
            console.error('[getOrderById]', error.message);
            res.status(500).json({ success: false, message: 'Failed to fetch order' });
        }
    }

    async createOrder(req, res) {
        try {
            const { customer_name, item_id, req_qty, due_date } = req.body;
            if (!customer_name || !item_id || !req_qty || !due_date) {
                return res.status(400).json({ success: false, message: 'Missing required fields: customer_name, item_id, req_qty, due_date' });
            }
            const order = await erpModel.createOrder({ customer_name, item_id: parseInt(item_id), req_qty: parseInt(req_qty), due_date });
            res.status(201).json({ success: true, message: `Order ${order.order_id} created successfully.`, order });
        } catch (error) {
            console.error('[createOrder]', error.message);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async approveOrder(req, res) {
        try {
            const result = await erpModel.approveOrderTransaction(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            console.error('[approveOrder]', error.message);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async completeOrder(req, res) {
        try {
            const result = await erpModel.completeOrder(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            console.error('[completeOrder]', error.message);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async cancelOrder(req, res) {
        try {
            const result = await erpModel.cancelOrder(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            console.error('[cancelOrder]', error.message);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async returnOrder(req, res) {
        try {
            const result = await erpModel.returnOrder(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            console.error('[returnOrder]', error.message);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getInventory(req, res) {
        try {
            const inventory = await erpModel.getAllInventory();
            res.status(200).json(inventory);
        } catch (error) {
            console.error('[getInventory]', error.message);
            res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
        }
    }

    async getLowStockItems(req, res) {
        try {
            const items = await erpModel.getLowStockItems();
            res.status(200).json(items);
        } catch (error) {
            console.error('[getLowStockItems]', error.message);
            res.status(500).json({ success: false, message: 'Failed to fetch low-stock items' });
        }
    }

    async getDashboardStats(req, res) {
        try {
            const stats = await erpModel.getDashboardMetrics();
            res.status(200).json(stats);
        } catch (error) {
            console.error('[getDashboardStats]', error.message);
            res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
        }
    }

    async getMonthlySalesTrends(req, res) {
        try {
            const trends = await erpModel.getMonthlySalesTrends();
            res.status(200).json(trends);
        } catch (error) {
            console.error('[getMonthlySalesTrends]', error.message);
            res.status(500).json({ success: false, message: 'Failed to fetch sales trends' });
        }
    }
}

module.exports = new ERPController();
