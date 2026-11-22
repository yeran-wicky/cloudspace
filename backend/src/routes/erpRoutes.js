const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/erpController');

router.get('/orders/counts', ctrl.getOrderCounts);
router.get('/orders', ctrl.getOrders);
router.get('/orders/:id', ctrl.getOrderById);
router.post('/orders', ctrl.createOrder);
router.post('/orders/:id/approve', ctrl.approveOrder);
router.post('/orders/:id/complete', ctrl.completeOrder);
router.post('/orders/:id/cancel', ctrl.cancelOrder);
router.post('/orders/:id/return', ctrl.returnOrder);

router.get('/inventory', ctrl.getInventory);
router.get('/inventory/low-stock', ctrl.getLowStockItems);

router.get('/dashboard/stats', ctrl.getDashboardStats);
router.get('/dashboard/trends', ctrl.getMonthlySalesTrends);

module.exports = router;
