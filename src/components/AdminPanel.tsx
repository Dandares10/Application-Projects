import React, { useState } from 'react';
import { Package, Receipt, Plus, DollarSign, Edit, Trash2, ArrowUpRight, TrendingUp, AlertTriangle, Check, RefreshCw, X, Eye } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { Product, Order } from '../types.ts';

export default function AdminPanel() {
  const { products, orders, addProduct, updateProduct, deleteProduct, updateOrderStatus, addToast } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Product form inputs
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pImage, setPImage] = useState('');
  const [pCategory, setPCategory] = useState('Accessories');
  const [pStock, setPStock] = useState('');
  const [pIsFeatured, setPIsFeatured] = useState(false);

  // Selected Order Detail View
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Statistics calculations
  const totalSales = orders
    .filter(o => o.paymentStatus === 'paid' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const lowStockItems = products.filter(p => p.stock <= 5);

  const openCreateForm = () => {
    setFormMode('create');
    setSelectedProductId(null);
    setPName('');
    setPDesc('');
    setPPrice('');
    setPImage('');
    setPCategory('Accessories');
    setPStock('');
    setPIsFeatured(false);
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setFormMode('edit');
    setSelectedProductId(product.id);
    setPName(product.name);
    setPDesc(product.description);
    setPPrice(product.price.toString());
    setPImage(product.image);
    setPCategory(product.category);
    setPStock(product.stock.toString());
    setPIsFeatured(!!product.isFeatured);
    setIsFormOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice || !pStock) {
      addToast('Please fill in Name, Price, and Stock level.', 'info');
      return;
    }

    const payload = {
      name: pName,
      description: pDesc,
      price: Number(pPrice),
      image: pImage || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80',
      category: pCategory,
      stock: Number(pStock),
      isFeatured: pIsFeatured
    };

    let result;
    if (formMode === 'create') {
      result = await addProduct(payload);
    } else if (selectedProductId) {
      result = await updateProduct(selectedProductId, payload);
    }

    if (result) {
      setIsFormOpen(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      await deleteProduct(id);
    }
  };

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    await updateOrderStatus(orderId, status);
    // Refresh selected order detail if open
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status } : null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif tracking-tight text-brand-900">Admin Control Suite</h2>
          <p className="text-xs text-stone-500 mt-1">Supervise inventory, products catalogs, and incoming sales transactions.</p>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-1 bg-brand-100 p-1.5 rounded-full border border-brand-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-stone-500 hover:text-brand-500'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-stone-500 hover:text-brand-500'
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-stone-500 hover:text-brand-500'
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* OVERVIEW DASHBOARD TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Bento Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-brand-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Gross Revenue</span>
                <span className="text-2xl font-bold font-serif text-brand-900 mt-1 block">
                  ${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-2 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +12.4% vs last week
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-brand-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Cumulative Orders</span>
                <span className="text-2xl font-bold font-serif text-brand-900 mt-1 block">{orders.length}</span>
                <span className="text-[10px] text-stone-500 block mt-2 font-medium">98.5% fulfillment rate</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-500 flex items-center justify-center border border-brand-200">
                <Receipt className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-brand-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Active Products</span>
                <span className="text-2xl font-bold font-serif text-brand-900 mt-1 block">{products.length}</span>
                <span className="text-[10px] text-stone-500 block mt-2 font-medium">Categorized in 4 tags</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-500 flex items-center justify-center border border-brand-200">
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-brand-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Stock Warnings</span>
                <span className={`text-2xl font-bold font-serif mt-1 block ${lowStockItems.length > 0 ? 'text-brand-700' : 'text-brand-900'}`}>
                  {lowStockItems.length}
                </span>
                <span className="text-[10px] text-stone-400 block mt-2 font-medium">Requires rapid restock</span>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                lowStockItems.length > 0
                  ? 'bg-brand-50 text-brand-700 border-brand-200'
                  : 'bg-brand-100 text-brand-500 border-brand-200'
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Low stock indicators list */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm lg:col-span-1 flex flex-col h-full">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700 mb-4 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Restock alerts ({lowStockItems.length})</span>
              </h3>

              <div className="space-y-3 overflow-y-auto max-h-[300px] flex-1">
                {lowStockItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <Check className="w-8 h-8 text-emerald-500 mb-2" />
                    <p className="text-xs font-semibold text-neutral-800">All inventory fully stocked</p>
                  </div>
                ) : (
                  lowStockItems.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="flex items-center gap-3">
                        <img src={p.image} className="w-10 h-10 object-cover rounded-lg border border-neutral-100" referrerPolicy="no-referrer" />
                        <div>
                          <div className="text-xs font-semibold text-neutral-800 line-clamp-1">{p.name}</div>
                          <div className="text-[10px] text-neutral-400">Stock level: <strong className="text-rose-600">{p.stock} units</strong></div>
                        </div>
                      </div>
                      <button
                        onClick={() => openEditForm(p)}
                        className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-brand-600 hover:bg-white transition-colors"
                        title="Restock now"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Orders log */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm lg:col-span-2 flex flex-col h-full">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700 mb-4 flex items-center justify-between">
                <span>Recent transactions</span>
                <button onClick={() => setActiveTab('orders')} className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-0.5">
                  <span>See all orders</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-2">Order ID</th>
                      <th className="py-3 px-2">Customer</th>
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2">Total Amount</th>
                      <th className="py-3 px-2">Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="border-b border-neutral-50 hover:bg-neutral-50/40 transition-colors">
                        <td className="py-3 px-2 font-mono font-bold text-neutral-800">{order.id}</td>
                        <td className="py-3 px-2 truncate max-w-[120px]">{order.customerName}</td>
                        <td className="py-3 px-2 text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-2 font-bold">${order.totalAmount.toFixed(2)}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] capitalize ${
                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                            order.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                            order.status === 'processing' ? 'bg-amber-50 text-amber-700' : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY CATALOG CRUD TAB */}
      {activeTab === 'products' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Action Header */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">{products.length} Products registered</span>
            <button
              onClick={openCreateForm}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-950 text-white hover:bg-brand-600 font-semibold text-xs transition-colors active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Product grid table */}
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50/50 border-b border-neutral-100 text-neutral-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Pricing</th>
                    <th className="py-4 px-4">Current Stock</th>
                    <th className="py-4 px-4">Rating</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-neutral-50/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img src={p.image} className="w-10 h-10 object-cover rounded-xl border border-neutral-100" referrerPolicy="no-referrer" />
                          <div>
                            <span className="font-semibold text-neutral-900 block">{p.name}</span>
                            <span className="text-[10px] text-neutral-400 truncate max-w-[200px] block mt-0.5">{p.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200/40">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-neutral-900">${p.price.toFixed(2)}</td>
                      <td className="py-4 px-4">
                        <span className={`font-semibold font-mono ${p.stock <= 5 ? 'text-rose-600 font-bold' : 'text-neutral-700'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-neutral-700">{p.rating.toFixed(1)} ★</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditForm(p)}
                            className="p-1.5 rounded-lg border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 text-neutral-600 hover:text-brand-600 transition-all"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INCOMING ORDERS FULFILLMENT TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50/50 border-b border-neutral-100 text-neutral-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-4">Customer Name</th>
                    <th className="py-4 px-4">Placed Date</th>
                    <th className="py-4 px-4">Payment</th>
                    <th className="py-4 px-4">Fulfillment Status</th>
                    <th className="py-4 px-4">Total Amount</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-neutral-50/30 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-neutral-900">{o.id}</td>
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-semibold block">{o.customerName}</span>
                          <span className="text-[10px] text-neutral-400 font-mono mt-0.5 block">{o.customerEmail}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-neutral-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[10px] capitalize ${
                          o.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={o.status}
                          onChange={e => handleStatusChange(o.id, e.target.value as Order['status'])}
                          className="px-2.5 py-1 rounded-lg border border-neutral-200 text-xs font-semibold bg-white focus:outline-none focus:border-brand-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 px-4 font-bold text-neutral-900">${o.totalAmount.toFixed(2)}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="flex items-center gap-1.5 ml-auto px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-[11px] font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EDIT/CREATE INVENTORY SLIDE-IN DIALOG */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsFormOpen(false)} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" />
          <div className="bg-white border border-neutral-100 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10 relative animate-scaleUp">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-amber-500" />
            <div className="p-6 pb-4 border-b border-neutral-100 flex justify-between items-center">
              <h3 className="text-lg font-bold font-display text-neutral-900">
                {formMode === 'create' ? 'Register New Product' : 'Modify Product Credentials'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-100 text-neutral-400 hover:text-neutral-600 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={e => setPName(e.target.value)}
                    placeholder="e.g. AuraPods Max"
                    className="w-full px-4 py-2.5 border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-brand-500 text-neutral-800 transition-colors"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1 uppercase tracking-wider">Product Description</label>
                  <textarea
                    value={pDesc}
                    onChange={e => setPDesc(e.target.value)}
                    placeholder="Short description of technical capabilities, battery life, noise cancellation specifications, etc."
                    rows={2}
                    className="w-full px-4 py-2.5 border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-brand-500 text-neutral-800 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1 uppercase tracking-wider">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pPrice}
                    onChange={e => setPPrice(e.target.value)}
                    placeholder="99.99"
                    className="w-full px-4 py-2.5 border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-brand-500 text-neutral-800 transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1 uppercase tracking-wider">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={pStock}
                    onChange={e => setPStock(e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-2.5 border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-brand-500 text-neutral-800 transition-colors font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-neutral-500 mb-1 uppercase tracking-wider">Image URL</label>
                  <input
                    type="url"
                    value={pImage}
                    onChange={e => setPImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-2.5 border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-brand-500 text-neutral-800 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1 uppercase tracking-wider">Category Tag</label>
                  <select
                    value={pCategory}
                    onChange={e => setPCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-brand-500 text-neutral-800 bg-white"
                  >
                    <option value="Audio">Audio</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6 pl-4">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={pIsFeatured}
                    onChange={e => setPIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500"
                  />
                  <label htmlFor="isFeatured" className="text-xs font-semibold text-neutral-600 select-none">Mark as Featured</label>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold rounded-xl text-neutral-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-neutral-950 text-white hover:bg-brand-600 text-xs font-semibold transition-all"
                >
                  {formMode === 'create' ? 'Register Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT ORDER DETAIL OVERLAY DIALOG */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" />
          <div className="bg-white border border-neutral-100 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10 relative">
            <div className="p-6 pb-4 border-b border-neutral-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold font-display text-neutral-900 leading-none">Order Invoice</h3>
                <span className="text-[10px] font-mono text-neutral-400 mt-1 block">ID: {selectedOrder.id}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-100 text-neutral-400 hover:text-neutral-600 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[450px] overflow-y-auto">
              {/* Customer Coordinates */}
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Recipient Details</span>
                <div className="text-xs text-neutral-700 mt-1.5 space-y-1">
                  <div>Name: <strong className="text-neutral-900">{selectedOrder.customerName}</strong></div>
                  <div>Email: <strong className="text-neutral-900">{selectedOrder.customerEmail}</strong></div>
                  <div>Shipment Location: <strong className="text-neutral-900">{selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</strong></div>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-3">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5">Purchased Cart ({selectedOrder.items.length})</span>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-100 text-xs">
                      <div className="flex items-center gap-2">
                        <img src={item.image} className="w-8 h-8 object-cover rounded-md" referrerPolicy="no-referrer" />
                        <span className="font-semibold text-neutral-800 truncate max-w-[150px]">{item.name}</span>
                        <span className="text-neutral-400 font-mono">x{item.quantity}</span>
                      </div>
                      <span className="font-bold text-neutral-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-3 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Transaction Gate</span>
                  <span className="font-semibold text-neutral-700 capitalize mt-1 block">{selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Grand Total</span>
                  <span className="text-lg font-bold text-brand-600 mt-1 block">${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
