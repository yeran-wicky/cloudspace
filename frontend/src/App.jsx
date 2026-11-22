import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from './api';

const INITIAL_INVENTORY = [
  { id: 1, item_name: 'Arduino Uno R3', category: 'Microcontrollers', unit_price: 2850.00, qty: 180, reorder_level: 20, part_number: 'MCU-ARD-UNO' },
  { id: 2, item_name: 'ESP32-WROOM-32', category: 'Microcontrollers', unit_price: 1750.00, qty: 95, reorder_level: 30, part_number: 'MCU-ESP32-W' },
  { id: 3, item_name: 'Raspberry Pi Pico', category: 'Microcontrollers', unit_price: 1950.00, qty: 320, reorder_level: 50, part_number: 'MCU-RPI-PICO' },
  { id: 4, item_name: '10K Ohm Resistor Pack (x100)', category: 'Resistors', unit_price: 180.00, qty: 1200, reorder_level: 200, part_number: 'RES-10K-100' },
  { id: 5, item_name: '220 Ohm Resistor Pack (x100)', category: 'Resistors', unit_price: 180.00, qty: 800, reorder_level: 200, part_number: 'RES-220-100' },
  { id: 6, item_name: '100uF Electrolytic Capacitor', category: 'Capacitors', unit_price: 35.00, qty: 2500, reorder_level: 500, part_number: 'CAP-100UF-EL' },
  { id: 7, item_name: '10nF Ceramic Capacitor (x50)', category: 'Capacitors', unit_price: 220.00, qty: 1800, reorder_level: 300, part_number: 'CAP-10NF-CER' },
  { id: 8, item_name: 'HC-SR04 Ultrasonic Sensor', category: 'Sensors', unit_price: 550.00, qty: 450, reorder_level: 50, part_number: 'SEN-ULTRA-04' },
  { id: 9, item_name: 'DHT22 Temp & Humidity Sensor', category: 'Sensors', unit_price: 1450.00, qty: 15, reorder_level: 25, part_number: 'SEN-DHT22' },
  { id: 10, item_name: 'LM7805 Voltage Regulator', category: 'ICs', unit_price: 85.00, qty: 3000, reorder_level: 500, part_number: 'IC-LM7805' },
  { id: 11, item_name: 'NE555 Timer IC', category: 'ICs', unit_price: 65.00, qty: 5000, reorder_level: 500, part_number: 'IC-NE555' },
  { id: 12, item_name: 'ATmega328P Microchip', category: 'ICs', unit_price: 980.00, qty: 8, reorder_level: 20, part_number: 'IC-ATMEGA328' },
  { id: 13, item_name: 'USB Type-C Connector', category: 'Connectors', unit_price: 120.00, qty: 600, reorder_level: 100, part_number: 'CON-USB-C' },
  { id: 14, item_name: '40-Pin Male Header Strip', category: 'Connectors', unit_price: 60.00, qty: 3500, reorder_level: 500, part_number: 'CON-HDR-40M' },
  { id: 15, item_name: '16x2 LCD Display Module', category: 'Displays', unit_price: 850.00, qty: 75, reorder_level: 30, part_number: 'DIS-LCD-1602' },
  { id: 16, item_name: '0.96in OLED Display (I2C)', category: 'Displays', unit_price: 1150.00, qty: 12, reorder_level: 20, part_number: 'DIS-OLED-096' },
  { id: 17, item_name: '5V 4-Channel Relay Board', category: 'Power Modules', unit_price: 750.00, qty: 220, reorder_level: 40, part_number: 'PWR-REL-5V4' },
  { id: 18, item_name: 'LM2596 Step-Down Converter', category: 'Power Modules', unit_price: 420.00, qty: 5, reorder_level: 15, part_number: 'PWR-LM2596' },
  { id: 19, item_name: 'nRF24L01+ Wireless Module', category: 'Communication', unit_price: 480.00, qty: 350, reorder_level: 50, part_number: 'COM-NRF24' },
  { id: 20, item_name: 'HC-05 Bluetooth Module', category: 'Communication', unit_price: 1350.00, qty: 180, reorder_level: 30, part_number: 'COM-BT-HC05' },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  const [syncStatus, setSyncStatus] = useState('connecting');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncErrorMsg, setSyncErrorMsg] = useState('');

  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [lowStockItems, setLowStockItems] = useState(() =>
    INITIAL_INVENTORY.filter((item) => item.qty <= item.reorder_level)
  );

  const [stats, setStats] = useState({
    totalRevenue: 2478500,
    activeOrders: 8,
    lowStockCount: INITIAL_INVENTORY.filter((item) => item.qty <= item.reorder_level).length,
    inventoryValue: INITIAL_INVENTORY.reduce((sum, item) => sum + item.unit_price * item.qty, 0),
    pendingOrders: 3,
  });

  const [orderCounts, setOrderCounts] = useState({
    All: 12,
    Pending: 3,
    Approved: 5,
    Completed: 4,
    Canceled: 0,
    Returned: 0,
  });

  const [salesTrends, setSalesTrends] = useState([
    { month_label: 'Aug 2026', orders_count: 32, revenue: 384000 },
    { month_label: 'Sep 2026', orders_count: 45, revenue: 540000 },
    { month_label: 'Oct 2026', orders_count: 58, revenue: 696000 },
    { month_label: 'Nov 2026', orders_count: 72, revenue: 858500 },
  ]);

  const [orders, setOrders] = useState([
    { id: 1, order_id: 'ORD-2026-001', customer_name: 'Apex Robotics Labs', item_id: 1, item_name: 'Arduino Uno R3', part_number: 'MCU-ARD-UNO', req_qty: 25, status: 'Pending', due_date: '2026-11-28' },
    { id: 2, order_id: 'ORD-2026-002', customer_name: 'CircuitWorks Industries', item_id: 2, item_name: 'ESP32-WROOM-32', part_number: 'MCU-ESP32-W', req_qty: 15, status: 'Approved', due_date: '2026-11-25' },
    { id: 3, order_id: 'ORD-2026-003', customer_name: 'NextGen Avionics', item_id: 8, item_name: 'HC-SR04 Ultrasonic Sensor', part_number: 'SEN-ULTRA-04', req_qty: 50, status: 'Completed', due_date: '2026-11-20' },
  ]);

  const [orderPagination, setOrderPagination] = useState({ page: 1, limit: 10, total: 3, totalPages: 1 });
  const [orderFilterStatus, setOrderFilterStatus] = useState('All');

  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('All');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [newOrderForm, setNewOrderForm] = useState({
    customer_name: '',
    item_id: '',
    req_qty: 1,
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const syncWithBackend = useCallback(async (silent = false) => {
    if (!silent) setSyncStatus('syncing');

    try {
      const [statsRes, countsRes, trendsRes, invRes, lowStockRes, ordersRes] = await Promise.allSettled([
        api.getDashboardStats(),
        api.getOrderCounts(),
        api.getMonthlySalesTrends(),
        api.getInventory(),
        api.getLowStockItems(),
        api.getOrders(orderFilterStatus, orderPagination.page, orderPagination.limit),
      ]);

      let hasSuccess = false;

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value);
        hasSuccess = true;
      }
      if (countsRes.status === 'fulfilled' && countsRes.value) {
        setOrderCounts((prev) => ({ ...prev, ...countsRes.value }));
        hasSuccess = true;
      }
      if (trendsRes.status === 'fulfilled' && Array.isArray(trendsRes.value)) {
        setSalesTrends(trendsRes.value);
      }
      if (invRes.status === 'fulfilled' && Array.isArray(invRes.value) && invRes.value.length > 0) {
        setInventory(invRes.value);
        hasSuccess = true;
      }
      if (lowStockRes.status === 'fulfilled' && Array.isArray(lowStockRes.value)) {
        setLowStockItems(lowStockRes.value);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value) {
        setOrders(ordersRes.value.orders || []);
        if (ordersRes.value.pagination) {
          setOrderPagination((prev) => ({
            ...prev,
            total: ordersRes.value.pagination.total,
            totalPages: ordersRes.value.pagination.totalPages || 1,
          }));
        }
        hasSuccess = true;
      }

      if (hasSuccess) {
        setSyncStatus('synced');
        setLastSyncTime(new Date());
        setSyncErrorMsg('');
      } else {
        setSyncStatus('error');
        setSyncErrorMsg('Connecting to Backend :5000...');
      }
    } catch (err) {
      setSyncStatus('error');
      setSyncErrorMsg(err.message || 'Connecting to Backend :5000...');
    }
  }, [orderFilterStatus, orderPagination.page, orderPagination.limit]);

  useEffect(() => {
    syncWithBackend(false);
    const interval = setInterval(() => {
      syncWithBackend(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [syncWithBackend]);

  const handleApproveOrder = async (orderId) => {
    try {
      const res = await api.approveOrder(orderId);
      showToast(res.message || `Order ${orderId} approved successfully.`);
      syncWithBackend(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      const res = await api.completeOrder(orderId);
      showToast(res.message || `Order ${orderId} marked completed.`);
      syncWithBackend(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await api.cancelOrder(orderId);
      showToast(res.message || `Order ${orderId} canceled.`);
      syncWithBackend(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReturnOrder = async (orderId) => {
    try {
      const res = await api.returnOrder(orderId);
      showToast(res.message || `Order ${orderId} returned and stock replenished.`);
      syncWithBackend(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateOrderSubmit = async (e) => {
    e.preventDefault();
    if (!newOrderForm.customer_name || !newOrderForm.item_id || !newOrderForm.req_qty || !newOrderForm.due_date) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const res = await api.createOrder({
        customer_name: newOrderForm.customer_name.trim(),
        item_id: parseInt(newOrderForm.item_id, 10),
        req_qty: parseInt(newOrderForm.req_qty, 10),
        due_date: newOrderForm.due_date,
      });

      showToast(res.message || 'Order created successfully!');
      setIsNewOrderModalOpen(false);
      setNewOrderForm({
        customer_name: '',
        item_id: '',
        req_qty: 1,
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      });
      syncWithBackend(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesCategory = inventoryCategoryFilter === 'All' || item.category === inventoryCategoryFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        item.item_name.toLowerCase().includes(q) ||
        item.part_number.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [inventory, inventoryCategoryFilter, searchQuery]);

  const categories = useMemo(() => {
    const set = new Set(inventory.map((i) => i.category));
    return ['All', ...Array.from(set)];
  }, [inventory]);

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (orderFilterStatus !== 'All') {
      list = list.filter((o) => o.status === orderFilterStatus);
    }
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (o) =>
        o.order_id.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        (o.part_number && o.part_number.toLowerCase().includes(q)) ||
        (o.item_name && o.item_name.toLowerCase().includes(q))
    );
  }, [orders, orderFilterStatus, searchQuery]);

  return (
    <div className="flex w-full h-full overflow-hidden bg-[#fcfcfd]">
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-semibold fade-in pointer-events-auto border ${
              t.type === 'success'
                ? 'bg-gray-900 text-white border-gray-700/50'
                : 'bg-rose-600 text-white border-rose-700'
            }`}
          >
            <i className={`fa-solid ${t.type === 'success' ? 'fa-circle-check text-emerald-400' : 'fa-circle-xmark text-white'}`} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between shrink-0 select-none">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-gray-100 gap-3">
            <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              V
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-gray-900 block leading-none">VOLTEX</span>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Parts Distribution</span>
            </div>
          </div>

          <div className="px-4 py-6">
            <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-3 mb-3">Main Menu</p>
            <nav className="space-y-1">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  currentTab === 'dashboard' ? 'bg-gray-100 text-gray-900 shadow-xs' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <i className={`fa-solid fa-chart-pie w-5 ${currentTab === 'dashboard' ? 'text-gray-900' : 'text-gray-400'}`} />
                Dashboard
              </button>

              <button
                onClick={() => setCurrentTab('orders')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'orders' ? 'bg-gray-100 text-gray-900 font-semibold shadow-xs' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className={`fa-solid fa-cart-shopping w-5 ${currentTab === 'orders' ? 'text-gray-900' : 'text-gray-400'}`} />
                  Customer Orders
                </div>
                {stats.pendingOrders > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                    {stats.pendingOrders}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentTab('inventory')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'inventory' ? 'bg-gray-100 text-gray-900 font-semibold shadow-xs' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className={`fa-solid fa-warehouse w-5 ${currentTab === 'inventory' ? 'text-gray-900' : 'text-gray-400'}`} />
                  Stock Catalog
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">
                  {inventory.length}
                </span>
              </button>

              <button
                onClick={() => setCurrentTab('lowstock')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'lowstock' ? 'bg-gray-100 text-gray-900 font-semibold shadow-xs' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-triangle-exclamation w-5 text-rose-500" />
                  Reorder Alerts
                </div>
                {lowStockItems.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                    {lowStockItems.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentTab('requests')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'requests' ? 'bg-gray-100 text-gray-900 font-semibold shadow-xs' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <i className={`fa-solid fa-file-lines w-5 ${currentTab === 'requests' ? 'text-gray-900' : 'text-gray-400'}`} />
                Supplier Requests
              </button>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Backend Sync</span>
              <button
                onClick={() => syncWithBackend(false)}
                className="text-[11px] text-gray-700 hover:text-black font-semibold flex items-center gap-1 cursor-pointer"
                title="Sync with backend database"
              >
                <i className={`fa-solid fa-arrows-rotate text-[10px] ${syncStatus === 'syncing' ? 'spinner' : ''}`} />
                Sync
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-400'
                    : syncStatus === 'syncing'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-xs font-medium text-gray-700 truncate">
                {syncStatus === 'synced' && 'Synced (:5000)'}
                {syncStatus === 'syncing' && 'Syncing data...'}
                {syncStatus === 'error' && (syncErrorMsg || 'Backend Offline')}
                {syncStatus === 'connecting' && 'Connecting (:5000)...'}
              </span>
            </div>
            {lastSyncTime && (
              <p className="text-[10px] text-gray-400 mt-1">
                Last updated: {lastSyncTime.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
              DE
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-gray-900 leading-tight">DevOps Arena</p>
              <p className="text-[10px] text-gray-400 truncate">deploy@voltex.corp</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900 capitalize">
              {currentTab === 'dashboard' && 'Dashboard Overview'}
              {currentTab === 'orders' && 'Customer Orders'}
              {currentTab === 'inventory' && 'Stock Catalog'}
              {currentTab === 'lowstock' && 'Reorder Alerts'}
              {currentTab === 'requests' && 'Supplier Requests'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-gray-400" />
              <input
                type="text"
                placeholder="Search components, orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 w-64 transition-all"
              />
            </div>

            <div
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                syncStatus === 'synced'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  syncStatus === 'synced' ? 'bg-emerald-500' : syncStatus === 'syncing' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              {syncStatus === 'synced' ? 'Live Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Local Catalog'}
            </div>

            <button
              onClick={() => setIsNewOrderModalOpen(true)}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <i className="fa-solid fa-plus" /> New Order
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {currentTab === 'dashboard' && (
            <div className="space-y-6 fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
                      <i className="fa-solid fa-dollar-sign" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums">
                    Rs. {Number(stats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Confirmed & completed sales</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Orders</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                      <i className="fa-solid fa-cart-shopping" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums">
                    {stats.activeOrders || 0}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Pending or approved in pipeline</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Low Stock Alerts</span>
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-sm">
                      <i className="fa-solid fa-triangle-exclamation" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-rose-600 tracking-tight tabular-nums">
                    {stats.lowStockCount || lowStockItems.length || 0}
                  </div>
                  <p className="text-[11px] text-rose-500/80 mt-1">Below minimum threshold</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventory Value</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
                      <i className="fa-solid fa-warehouse" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums">
                    Rs. {Number(stats.inventoryValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Estimated stock valuation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Monthly Fulfillment Trends</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Aggregated dispatch orders across distribution cycles</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-gray-50 rounded-lg text-gray-600 font-semibold border border-gray-100">
                      Live PostgreSQL View
                    </span>
                  </div>

                  {salesTrends.length > 0 ? (
                    <div className="space-y-4">
                      {salesTrends.map((t, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold text-gray-700">
                            <span>{t.month_label || `Period ${idx + 1}`}</span>
                            <span className="tabular-nums">Rs. {Number(t.revenue || 0).toLocaleString()} ({t.orders_count || 0} orders)</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gray-900 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(15, ((t.orders_count || 1) / 10) * 100))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-400 text-xs">
                      Connecting and aggregating live sales metrics...
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-bold text-gray-900">Safety Thresholds</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        {lowStockItems.length} Breached
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Components that have fallen below safety inventory targets.</p>

                    <div className="space-y-2.5 max-h-72 overflow-y-auto">
                      {lowStockItems.length > 0 ? (
                        lowStockItems.slice(0, 5).map((item) => (
                          <div key={item.id} className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold text-gray-900">{item.item_name}</p>
                              <p className="text-[10px] font-mono text-gray-500">{item.part_number}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-rose-600 tabular-nums">{item.qty} in stock</span>
                              <p className="text-[10px] text-gray-400">Target: {item.reorder_level}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 text-xs py-8">
                          All components are currently above reorder levels.
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentTab('inventory')}
                    className="w-full mt-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-warehouse" /> Open Full Stock Catalog
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'orders' && (
            <div className="space-y-6 fade-in">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Customer Orders</h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Live database order lifecycle management with atomic stock reservation.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Pending', 'Approved', 'Completed', 'Canceled', 'Returned'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setOrderFilterStatus(status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        orderFilterStatus === status
                          ? 'bg-gray-900 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status} ({orderCounts[status] || 0})
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50/80 text-[11px] font-semibold uppercase text-gray-400 tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="py-3.5 px-5">Order ID</th>
                        <th className="py-3.5 px-5">Customer</th>
                        <th className="py-3.5 px-5">Item / Part</th>
                        <th className="py-3.5 px-5 text-center">Req Qty</th>
                        <th className="py-3.5 px-5">Due Date</th>
                        <th className="py-3.5 px-5 text-center">Status</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="py-3.5 px-5 font-mono font-semibold text-gray-900">{o.order_id}</td>
                            <td className="py-3.5 px-5 font-medium text-gray-900">{o.customer_name}</td>
                            <td className="py-3.5 px-5">
                              <p className="font-medium text-gray-900">{o.item_name || 'Component'}</p>
                              <p className="text-[10px] font-mono text-gray-400">{o.part_number}</p>
                            </td>
                            <td className="py-3.5 px-5 text-center font-bold tabular-nums">{o.req_qty}</td>
                            <td className="py-3.5 px-5 text-gray-500 tabular-nums">
                              {o.due_date ? new Date(o.due_date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-3.5 px-5 text-center">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  o.status === 'Completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : o.status === 'Approved'
                                    ? 'bg-blue-100 text-blue-800'
                                    : o.status === 'Pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : o.status === 'Canceled'
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {o.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {o.status === 'Pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveOrder(o.id)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                                      title="Approve & reserve stock"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleCancelOrder(o.id)}
                                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-semibold cursor-pointer"
                                      title="Cancel order"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                                {o.status === 'Approved' && (
                                  <button
                                    onClick={() => handleCompleteOrder(o.id)}
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                                    title="Complete dispatch"
                                  >
                                    Complete
                                  </button>
                                )}
                                {o.status === 'Completed' && (
                                  <button
                                    onClick={() => handleReturnOrder(o.id)}
                                    className="px-2.5 py-1 bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-gray-600 rounded-lg text-[11px] font-semibold cursor-pointer"
                                    title="Process return & replenish inventory"
                                  >
                                    Return
                                  </button>
                                )}
                                {(o.status === 'Canceled' || o.status === 'Returned') && (
                                  <span className="text-[11px] text-gray-400 italic">Archived</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                            No orders found matching the selected status or query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'inventory' && (
            <div className="space-y-6 fade-in">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Stock Catalog</h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Centralized electronic component inventory ({filteredInventory.length} components available).
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-500">Category:</span>
                  <select
                    value={inventoryCategoryFilter}
                    onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50/80 text-[11px] font-semibold uppercase text-gray-400 tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="py-3.5 px-5">Part Number</th>
                        <th className="py-3.5 px-5">Component Name</th>
                        <th className="py-3.5 px-5">Category</th>
                        <th className="py-3.5 px-5 text-right">Unit Price</th>
                        <th className="py-3.5 px-5 text-center">In Stock</th>
                        <th className="py-3.5 px-5 text-center">Safety Target</th>
                        <th className="py-3.5 px-5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {filteredInventory.length > 0 ? (
                        filteredInventory.map((item) => {
                          const isLowStock = item.qty <= item.reorder_level;
                          return (
                            <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                              <td className="py-3.5 px-5 font-mono font-semibold text-gray-900">{item.part_number}</td>
                              <td className="py-3.5 px-5 font-medium text-gray-900">{item.item_name}</td>
                              <td className="py-3.5 px-5">
                                <span className="px-2 py-0.5 rounded bg-gray-100 text-[11px] text-gray-600">
                                  {item.category}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-right font-semibold tabular-nums">
                                Rs. {Number(item.unit_price).toFixed(2)}
                              </td>
                              <td
                                className={`py-3.5 px-5 text-center font-bold tabular-nums ${
                                  isLowStock ? 'text-rose-600' : 'text-gray-900'
                                }`}
                              >
                                {item.qty}
                              </td>
                              <td className="py-3.5 px-5 text-center text-gray-500 tabular-nums">{item.reorder_level}</td>
                              <td className="py-3.5 px-5 text-center">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    isLowStock ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {isLowStock ? 'Reorder Needed' : 'Healthy'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                            No inventory items found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'lowstock' && (
            <div className="space-y-6 fade-in">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <h1 className="text-xl font-bold text-gray-900">Reorder Alerts & Deficits</h1>
                <p className="text-xs text-gray-500 mt-1">
                  Electronic components that have fallen below safety reorder thresholds.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50/80 text-[11px] font-semibold uppercase text-gray-400 tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="py-3.5 px-5">Part Number</th>
                        <th className="py-3.5 px-5">Component Name</th>
                        <th className="py-3.5 px-5">Category</th>
                        <th className="py-3.5 px-5 text-center">Current Qty</th>
                        <th className="py-3.5 px-5 text-center">Safety Target</th>
                        <th className="py-3.5 px-5 text-center">Deficit</th>
                        <th className="py-3.5 px-5 text-right">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {lowStockItems.length > 0 ? (
                        lowStockItems.map((item) => {
                          const deficit = Math.max(0, item.reorder_level - item.qty);
                          const isCritical = item.qty <= 5;
                          return (
                            <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                              <td className="py-3.5 px-5 font-mono font-semibold text-gray-900">{item.part_number}</td>
                              <td className="py-3.5 px-5 font-medium text-gray-900">{item.item_name}</td>
                              <td className="py-3.5 px-5">
                                <span className="px-2 py-0.5 rounded bg-gray-100 text-[11px] text-gray-600">
                                  {item.category}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-center font-bold text-rose-600 tabular-nums">{item.qty}</td>
                              <td className="py-3.5 px-5 text-center text-gray-500 tabular-nums">{item.reorder_level}</td>
                              <td className="py-3.5 px-5 text-center font-bold text-rose-700 tabular-nums">
                                -{deficit} units
                              </td>
                              <td className="py-3.5 px-5 text-right">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    isCritical ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {isCritical ? 'Critical' : 'Elevated'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-emerald-600 text-xs">
                            All component stocks are currently within healthy limits.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'requests' && (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs text-center space-y-3 fade-in">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-500 text-xl">
                <i className="fa-solid fa-file-lines" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Supplier Procurement Module</h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Requisitions are automatically triggered when low-stock items breach threshold limits. Connected to
                the active PostgreSQL inventory tier.
              </p>
            </div>
          )}
        </div>
      </main>

      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-100 p-6 fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Create Customer Order</h3>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base" />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Dynamics Ltd"
                  value={newOrderForm.customer_name}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, customer_name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Electronic Component</label>
                <select
                  required
                  value={newOrderForm.item_id}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, item_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  <option value="">Select Electronic Component...</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.part_number}] {item.item_name} (Stock: {item.qty} @ Rs. {Number(item.unit_price).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Required Qty</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newOrderForm.req_qty}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, req_qty: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newOrderForm.due_date}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingOrder ? <i className="fa-solid fa-spinner spinner" /> : <i className="fa-solid fa-check" />}
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
