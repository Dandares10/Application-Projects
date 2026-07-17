import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Trash2, X, ShoppingBag, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { Product } from '../types.ts';

// ==========================================
// DRAWER CONTRACT CONTRACTS & DATA CORES
// ==========================================

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductClick: (product: Product) => void;
}

// ==========================================
// WIDGET EXPORT: SLIDING WISHLIST DRAWER
// ==========================================

export default function WishlistModal({ isOpen, onClose, onProductClick }: WishlistModalProps) {
  // 1. Gather global data actions from our central React Context store.
  const { wishlist, removeFromWishlist, addToCart } = useStore();

  // 2. Select Product Callback
  // Redirects focus to the primary hero catalog stage and shuts the slider drawer cleanly.
  const handleProductSelect = (product: Product) => {
    onProductClick(product);
    onClose();
  };

  // 3. Event Stop Propagation
  // Critical for nested clickable widgets! We call `e.stopPropagation()` to prevent 
  // the outer card click handler from triggering, which would otherwise accidentally open the product details page.
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleRemove = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    removeFromWishlist(productId);
  };

  return (
    // AnimatePresence allows React to animate mounting and unmounting of sliding elements
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          
          {/* BACKDROP BLUR OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
          />

          {/* SLIDING DRAWER CONTAINER */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              // Slide in from 100% (right margin) to 0 (resting position)
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              // Spring physics create a satisfying bouncy responsive slide-out drawer
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-white border-l border-brand-200 flex flex-col h-full shadow-xl relative"
            >
              {/* Premium color accent strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />

              {/* DRAWER HEADER */}
              <div className="p-6 border-b border-brand-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100 text-rose-500">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-serif text-brand-900 leading-none">Your Wishlist</h3>
                    <p className="text-xs text-stone-400 mt-1">{wishlist.length} {wishlist.length === 1 ? 'masterpiece' : 'masterpieces'} saved</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-stone-400 hover:text-brand-500 hover:bg-brand-100 border border-transparent hover:border-brand-200 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* DRAWERS BODY AND LIST VIEW */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {wishlist.length === 0 ? (
                  /* EMPTY WISHLIST STATE: humble guides help direct back to commerce activities */
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400">
                      <Heart className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-brand-900">Your wishlist is empty</h4>
                      <p className="text-xs text-stone-400 mt-1 max-w-[240px]">Save premium designs from our curated catalog to view and review them later.</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full border border-brand-200 text-stone-700 hover:bg-brand-100 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Explore Catalog</span>
                    </button>
                  </div>
                ) : (
                  /* RENDER SAVED ITEMS LIST */
                  wishlist.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="flex items-center gap-4 p-3.5 border border-brand-200 rounded-2xl bg-brand-50/30 hover:bg-brand-100/40 cursor-pointer transition-colors group"
                    >
                      {/* Product Thumbnail Frame */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-100 border border-brand-200 flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Content details Column */}
                      <div className="flex-grow min-w-0">
                        <h4 className="text-sm font-bold text-brand-900 truncate leading-none group-hover:text-brand-500 transition-colors">
                          {product.name}
                        </h4>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mt-1">
                          {product.category}
                        </span>
                        
                        <div className="flex items-center justify-between mt-2.5">
                          {/* Fine Currency Formatting */}
                          <div className="text-sm font-bold font-serif text-brand-900">
                            ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>

                          {/* Quick Add to Cart Button */}
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={product.stock <= 0}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                              product.stock <= 0
                                ? 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed'
                                : 'bg-brand-500 hover:bg-brand-600 border-brand-500 text-white shadow-xs'
                            }`}
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>{product.stock <= 0 ? 'Sold Out' : 'Add to Bag'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Remove Button (Reveals elegantly on parent item hover) */}
                      <button
                        onClick={(e) => handleRemove(e, product.id)}
                        className="p-2 text-stone-400 hover:text-rose-500 rounded-full border border-transparent hover:border-rose-100 hover:bg-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
