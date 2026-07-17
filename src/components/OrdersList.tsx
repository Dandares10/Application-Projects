import React, { useState } from 'react';
import { ClipboardList, Calendar, Check, Truck, Package, PackageOpen, RefreshCw, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { Order } from '../types.ts';

export default function OrdersList() {
  const { orders, fetchOrders } = useStore();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
  };

  // Helper to determine active index for tracker timeline
  const getStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-serif tracking-tight text-brand-900">Your Orders</h2>
          <p className="text-xs text-stone-500 mt-1">Monitor shipment statuses, print invoices, and view purchase history.</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-4 py-2 border border-brand-200 hover:bg-brand-100 text-brand-500 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-brand-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-500 mx-auto">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-900">No orders logged yet</h3>
            <p className="text-xs text-stone-500 mt-1">Once you complete a secure checkout, your tracking history and invoices will populate here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isExpanded = expandedOrderId === order.id;
            const currentStep = getStatusStep(order.status);

            return (
              <div
                key={order.id}
                className="bg-white border border-brand-200 rounded-3xl shadow-sm hover:shadow transition-all overflow-hidden"
              >
                {/* Main Summary Panel */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-brand-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-500 border border-brand-200 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold font-mono text-brand-900 block">{order.id}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-brand-200">•</span>
                        <span className="text-xs text-stone-500 font-semibold">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t border-brand-100 sm:border-0 pt-3 sm:pt-0">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block text-left sm:text-right">Charged Amount</span>
                      <strong className="text-base font-bold font-serif text-brand-900 block mt-0.5">${order.totalAmount.toFixed(2)}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider capitalize border ${
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        order.status === 'shipped' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                        order.status === 'processing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-brand-50 text-brand-500 border-brand-200'
                      }`}>
                        {order.status}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details section */}
                {isExpanded && (
                  <div className="border-t border-brand-200 p-5 bg-brand-50/30 space-y-6 animate-slideDown">
                    {/* Interactive STEP TIMELINE */}
                    {order.status === 'cancelled' ? (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-xs text-rose-700">
                        <XCircle className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <strong>This order has been cancelled.</strong> If funds were deducted, a complete refund has been credited back to your payment method.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Delivery Timeline Tracker</span>
                        <div className="grid grid-cols-4 gap-2 relative pt-2">
                          {/* Connection pipeline bars */}
                          <div className="absolute top-[21px] left-[12.5%] right-[12.5%] h-0.5 bg-brand-200 z-0">
                            <div 
                              className="h-full bg-brand-500 transition-all duration-500" 
                              style={{ width: `${Math.max(0, (currentStep - 1) * 33.3)}%` }}
                            />
                          </div>

                          {/* Step 1 */}
                          <div className="flex flex-col items-center text-center z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-colors ${
                              currentStep >= 1 ? 'bg-brand-500 text-white border-brand-500 shadow-sm' : 'bg-white text-stone-400 border-brand-200'
                            }`}>
                              {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                            </div>
                            <span className="text-[10px] font-semibold text-stone-700 mt-2 block">Placed</span>
                          </div>

                          {/* Step 2 */}
                          <div className="flex flex-col items-center text-center z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-colors ${
                              currentStep >= 2 ? 'bg-brand-500 text-white border-brand-500 shadow-sm' : 'bg-white text-stone-400 border-brand-200'
                            }`}>
                              {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
                            </div>
                            <span className="text-[10px] font-semibold text-stone-700 mt-2 block">Processing</span>
                          </div>

                          {/* Step 3 */}
                          <div className="flex flex-col items-center text-center z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-colors ${
                              currentStep >= 3 ? 'bg-brand-500 text-white border-brand-500 shadow-sm' : 'bg-white text-stone-400 border-brand-200'
                            }`}>
                              {currentStep > 3 ? <Check className="w-4 h-4" /> : '3'}
                            </div>
                            <span className="text-[10px] font-semibold text-stone-700 mt-2 block">In Transit</span>
                          </div>

                          {/* Step 4 */}
                          <div className="flex flex-col items-center text-center z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-colors ${
                              currentStep >= 4 ? 'bg-brand-500 text-white border-brand-500 shadow-sm' : 'bg-white text-stone-400 border-brand-200'
                            }`}>
                              {currentStep >= 4 ? <Check className="w-4 h-4" /> : '4'}
                            </div>
                            <span className="text-[10px] font-semibold text-stone-700 mt-2 block">Delivered</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order contents log */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Cart Summary</span>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-white border border-brand-200 text-xs">
                              <div className="flex items-center gap-2.5">
                                <img src={item.image} className="w-8 h-8 object-cover rounded-md border border-brand-100" referrerPolicy="no-referrer" />
                                <span className="font-semibold text-brand-900 truncate max-w-[150px]">{item.name}</span>
                                <span className="text-stone-400 font-mono">x{item.quantity}</span>
                              </div>
                              <span className="font-bold text-brand-900">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Fulfillment Coordinates</span>
                        <div className="bg-white border border-brand-200 p-4 rounded-xl text-xs text-stone-600 space-y-1">
                          <div>Recipient Name: <strong className="text-brand-900">{order.customerName}</strong></div>
                          <div>Address: <strong className="text-brand-900">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</strong></div>
                          <div className="pt-2 border-t border-brand-100 mt-2 text-stone-400">
                            Gateway: <span className="capitalize font-semibold text-brand-700">{order.paymentMethod}</span> ({order.paymentStatus})
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
