import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, LogOut, ShieldCheck, ShoppingCart, Heart, Package } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext.tsx';
import AuthModal from './AuthModal.tsx';

interface NavbarProps {
  onCartToggle: () => void;
  onWishlistToggle: () => void;
  activeView: 'catalog' | 'admin' | 'orders';
  onViewChange: (view: 'catalog' | 'admin' | 'orders') => void;
}

export default function Navbar({ onCartToggle, onWishlistToggle, activeView, onViewChange }: NavbarProps) {
  const { currentUser, logout, cart, wishlist } = useStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show at the top of the page
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down (page content moves up) -> Hide bar
        setIsVisible(false);
      } else {
        // Scrolling up (page content moves down) -> Show bar
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/50 backdrop-blur-md border-b border-brand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo / Branding */}
            <div 
              onClick={() => onViewChange('catalog')} 
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-4.5 h-4.5" />
              </div>
              <span className="text-2xl font-bold font-serif tracking-tight text-brand-500">
                AURA.
              </span>
            </div>

            {/* Navigation links (Desktop only) */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => onViewChange('catalog')}
                className={`text-sm font-semibold tracking-widest uppercase transition-all pb-1 cursor-pointer ${
                  activeView === 'catalog'
                    ? 'text-brand-500 border-b-2 border-brand-500'
                    : 'text-stone-500 hover:text-brand-500'
                }`}
              >
                Catalog
              </button>
              {currentUser && (
                <button
                  onClick={() => onViewChange('orders')}
                  className={`text-sm font-semibold tracking-widest uppercase transition-all pb-1 cursor-pointer ${
                    activeView === 'orders'
                      ? 'text-brand-500 border-b-2 border-brand-500'
                      : 'text-stone-500 hover:text-brand-500'
                  }`}
                >
                  My Orders
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => onViewChange('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeView === 'admin'
                      ? 'bg-brand-100 text-brand-500 border border-brand-200'
                      : 'text-brand-500 hover:text-brand-600 hover:bg-brand-100 border border-transparent'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
              )}
            </nav>

            {/* User Controls / Right actions (Logout and profile stay at the top) */}
            <div className="flex items-center gap-3">
              {/* Admin toggle for mobile */}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => onViewChange('admin')}
                  className="md:hidden p-2 rounded-full border border-brand-200 text-brand-500 hover:bg-brand-100 transition-colors cursor-pointer"
                  title="Admin Panel"
                >
                  <ShieldCheck className="w-4.5 h-4.5" />
                </button>
              )}

              {/* Desktop Only Wishlist and Cart (kept for redundancy on wide screens, hidden on mobile) */}
              <button
                onClick={onWishlistToggle}
                className="hidden md:flex relative p-2.5 rounded-full border border-brand-200 hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-colors group cursor-pointer"
                title="View Wishlist"
              >
                <Heart className={`w-5 h-5 group-hover:scale-105 transition-transform ${wishlist.length > 0 ? 'fill-current' : ''}`} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={onCartToggle}
                className="hidden md:flex relative p-2.5 rounded-full border border-brand-200 hover:bg-brand-100 text-brand-500 transition-colors group cursor-pointer"
                title="View Cart"
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-105 transition-transform" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-brand-700 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {/* Authentication avatar/initials and log out (Permanently at the top) */}
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-brand-200 rounded-full bg-brand-100/50">
                    <div className="w-6.5 h-6.5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-bold font-serif">
                      {getInitials(currentUser.name)}
                    </div>
                    <div className="hidden sm:block text-left max-w-[80px] truncate">
                      <div className="text-[10px] font-bold text-brand-900 leading-none truncate">{currentUser.name}</div>
                      <div className="text-[8px] text-stone-400 font-mono capitalize leading-none mt-0.5 truncate">{currentUser.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign out"
                    className="p-2.5 rounded-full text-stone-400 hover:text-rose-500 hover:bg-rose-50 border border-brand-200 hover:border-rose-100 transition-all active:scale-95 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm active:scale-98 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 
        =========================================================
        SMART SLIDING BOTTOM NAVIGATION BAR (WISHLIST, CART, MY ORDERS)
        =========================================================
        Slides down when scrolling down (page moves up) and slides
        back up to reveal itself when scrolling up (page moves down).
        Beautiful, accessible, mobile-first control deck.
      */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] h-16 sm:h-20 flex items-center justify-around px-4 pb-safe w-full transition-shadow duration-300"
      >
        {/* ACTION 1: CATALOG/SHOP */}
        <button
          onClick={() => {
            onViewChange('catalog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center gap-0.5 w-16 sm:w-20 py-1 rounded-xl transition-all cursor-pointer group ${
            activeView === 'catalog' ? 'text-brand-500' : 'text-stone-400 hover:text-brand-500'
          }`}
        >
          <ShoppingBag className={`w-5 h-5 group-hover:scale-110 transition-transform ${activeView === 'catalog' ? 'stroke-2' : ''}`} />
          <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 group-hover:text-brand-600 transition-colors">
            Shop
          </span>
        </button>

        {/* ACTION 2: WISHLIST */}
        <button
          onClick={onWishlistToggle}
          className="relative flex flex-col items-center justify-center gap-0.5 w-16 sm:w-20 py-1 rounded-xl text-rose-500 hover:bg-rose-50/40 transition-all cursor-pointer group"
          title="Open Wishlist"
        >
          <div className="relative">
            <Heart className={`w-5 h-5 group-hover:scale-110 transition-transform ${wishlist.length > 0 ? 'fill-current' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-4.5 h-4.5 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border border-white">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 group-hover:text-rose-600 transition-colors">
            Wishlist
          </span>
        </button>

        {/* ACTION 3: CART/BAG */}
        <button
          onClick={onCartToggle}
          className="relative flex flex-col items-center justify-center gap-0.5 w-16 sm:w-20 py-1 rounded-xl text-brand-600 hover:bg-brand-50/40 transition-all cursor-pointer group"
          title="Open Cart"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-4.5 h-4.5 px-1 rounded-full bg-brand-700 text-white text-[9px] font-bold flex items-center justify-center animate-pulse border border-white">
                {cartItemsCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 group-hover:text-brand-600 transition-colors">
            Bag
          </span>
        </button>

        {/* ACTION 4: MY ORDERS */}
        <button
          onClick={() => {
            if (currentUser) {
              onViewChange('orders');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              setIsAuthOpen(true);
            }
          }}
          className={`flex flex-col items-center justify-center gap-0.5 w-16 sm:w-20 py-1 rounded-xl transition-all cursor-pointer group ${
            activeView === 'orders' ? 'text-brand-500' : 'text-stone-400 hover:text-brand-500'
          }`}
          title="My Orders"
        >
          <Package className={`w-5 h-5 group-hover:scale-110 transition-transform ${activeView === 'orders' ? 'stroke-2 text-brand-500' : ''}`} />
          <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 group-hover:text-brand-600 transition-colors">
            Orders
          </span>
        </button>
      </motion.div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
