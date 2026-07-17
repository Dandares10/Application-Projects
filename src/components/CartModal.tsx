import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Plus, Minus, Trash2, X, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckoutClick: () => void;
  onLoginClick: () => void;
}

export default function CartModal({ isOpen, onClose, onCheckoutClick, onLoginClick }: CartModalProps) {
  const { cart, updateCartQty, removeFromCart, currentUser } = useStore();

  const subtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const handleCheckoutInit = () => {
    if (!currentUser) {
      onLoginClick();
    } else {
      onCheckoutClick();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
          />

          {/* Sliding Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-white border-l border-brand-200 flex flex-col h-full shadow-xl relative"
            >
              {/* Top border design */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-brand-700" />

              {/* Drawer Header */}
              <div className="p-6 border-b border-brand-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center border border-brand-200 text-brand-500">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-serif text-brand-900 leading-none">Your Cart</h3>
                    <p className="text-xs text-stone-400 mt-1">{totalItems} {totalItems === 1 ? 'item' : 'items'} ready</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-stone-400 hover:text-brand-500 hover:bg-brand-100 border border-transparent hover:border-brand-200 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-500">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-brand-900">Your shopping cart is empty</h4>
                      <p className="text-xs text-stone-400 mt-1 max-w-[240px]">Add premium items from our curated tech catalog to get started.</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full border border-brand-200 text-stone-700 hover:bg-brand-100 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Shop</span>
                    </button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-4 p-3.5 border border-brand-200 rounded-2xl bg-brand-50/30 hover:bg-brand-100/40 transition-colors group"
                    >
                      {/* Product thumb */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-100 border border-brand-200 flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Content details */}
                      <div className="flex-grow min-w-0">
                        <h4 className="text-sm font-bold text-brand-900 truncate leading-none">
                          {item.product.name}
                        </h4>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mt-1">
                          {item.product.category}
                        </span>
                        
                        <div className="flex items-center justify-between mt-2.5">
                          {/* Qty controls */}
                          <div className="flex items-center border border-brand-200 rounded-xl bg-white p-0.5">
                            <button
                              onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                              className="p-1 rounded-lg hover:bg-brand-100 text-stone-500 hover:text-brand-900 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-brand-900 font-mono">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="p-1 rounded-lg hover:bg-brand-100 text-stone-500 hover:text-brand-900 transition-colors disabled:opacity-30"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Line price */}
                          <div className="text-sm font-bold font-serif text-brand-900">
                            ${(item.product.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-stone-400 hover:text-brand-700 rounded-full border border-transparent hover:border-brand-200 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Footing */}
              {cart.length > 0 && (
                <div className="border-t border-brand-200 p-6 bg-brand-100/40 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-stone-500">
                      <span>Subtotal</span>
                      <span className="font-semibold text-brand-900">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-xs text-stone-500">
                      <span>Estimated Shipping</span>
                      <span className="font-bold text-brand-700">FREE</span>
                    </div>
                    <div className="border-t border-brand-200/60 my-2"></div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-semibold text-brand-900">Total</span>
                      <span className="text-xl font-bold font-serif text-brand-900">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Auth reminder warning if not signed in */}
                  {!currentUser && (
                    <div className="text-[11px] text-brand-700 bg-brand-50 border border-brand-200 p-2.5 rounded-xl leading-relaxed">
                      You are checking out as a Guest. We will create a secure, persistent account for you using your email during checkout.
                    </div>
                  )}

                  <button
                    onClick={handleCheckoutInit}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full bg-brand-500 text-white hover:bg-brand-600 font-bold uppercase tracking-wider text-xs active:scale-98 shadow-sm transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Proceed to Secure Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
