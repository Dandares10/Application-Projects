import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowRight, Sparkles, Tag, ShieldAlert, X, Filter, ArrowUpDown } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import Navbar from './components/Navbar.tsx';
import ProductCard from './components/ProductCard.tsx';
import CartModal from './components/CartModal.tsx';
import CheckoutModal from './components/CheckoutModal.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import OrdersList from './components/OrdersList.tsx';
import ToastContainer from './components/Toast.tsx';
import AuthModal from './components/AuthModal.tsx';
import FilterSidebar from './components/FilterSidebar.tsx';
import DealsSlider from './components/DealsSlider.tsx';
import ProductDetail from './components/ProductDetail.tsx';
import WishlistModal from './components/WishlistModal.tsx';
import { Product } from './types.ts';

function MainApp() {
  const { products, filteredProducts, currentUser, isLoading, fetchProducts } = useStore();
  const [activeView, setActiveView] = useState<'catalog' | 'admin' | 'orders'>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Extended Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minRating, setMinRating] = useState<number | ''>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured'); // options: 'featured', 'price_asc', 'price_desc', 'rating_desc', 'name_asc'
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Admin edit context
  const [adminEditProduct, setAdminEditProduct] = useState<any | null>(null);

  // Categories list
  const categories = ['All', 'Audio', 'Wearables', 'Accessories', 'Lifestyle'];

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Dynamically fetch products from backend whenever filters change
  useEffect(() => {
    fetchProducts({
      search: debouncedSearch || undefined,
      category: selectedCategory,
      minPrice: minPrice !== '' ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
      rating: minRating !== '' ? Number(minRating) : undefined,
      inStock: inStockOnly || undefined,
      sortBy: sortBy !== 'featured' ? sortBy : undefined
    });
  }, [debouncedSearch, selectedCategory, minPrice, maxPrice, minRating, inStockOnly, sortBy]);

  const activeFiltersCount = 
    (selectedCategory !== 'All' ? 1 : 0) +
    (searchQuery !== '' ? 1 : 0) +
    (minPrice !== '' ? 1 : 0) +
    (maxPrice !== '' ? 1 : 0) +
    (minRating !== '' ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setInStockOnly(false);
    setSortBy('featured');
  };

  const handleRemoveSingleFilter = (type: string) => {
    if (type === 'category') setSelectedCategory('All');
    if (type === 'search') {
      setSearchQuery('');
      setDebouncedSearch('');
    }
    if (type === 'price') {
      setMinPrice('');
      setMaxPrice('');
    }
    if (type === 'rating') setMinRating('');
    if (type === 'stock') setInStockOnly(false);
  };

  // filteredProducts is provided directly from useStore context

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-neutral-900 border-2 border-brand-500 animate-spin" />
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mt-4">Loading AURA...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-50">
      {/* Top micro promotion line */}
      <div className="bg-brand-500 text-white py-2 text-center text-[10px] font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 px-4 border-b border-brand-600/20">
        <Sparkles className="w-3.5 h-3.5 text-brand-700 animate-pulse" />
        <span>Upgrade your setup — use code <strong className="text-brand-100 font-bold">AURA15</strong> for 15% off first order</span>
        <span className="hidden sm:inline text-brand-100/80 font-normal">| Free global shipping included.</span>
      </div>

      {/* Main Header Navbar */}
      <Navbar
        onCartToggle={() => setIsCartOpen(true)}
        onWishlistToggle={() => setIsWishlistOpen(true)}
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          setSelectedProduct(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 pb-28 sm:pb-36">
        
        {/* VIEW 1: CATALOG VIEW */}
        {activeView === 'catalog' && (
          selectedProduct ? (
            <ProductDetail product={selectedProduct} onBack={() => { setSelectedProduct(null); window.scrollTo({ top: 0 }); }} />
          ) : (
            <div className="space-y-8 animate-fadeIn">
            {/* Promo Hero Display Block */}
            <div className="relative rounded-3xl bg-brand-100 overflow-hidden shadow-sm border border-brand-200">
              {/* Background gradient noise */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-200/40 via-transparent to-brand-700/5 z-0" />
              <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-brand-500/5 blur-3xl" />
              
              <div className="relative z-10 px-6 sm:px-12 py-10 sm:py-16 max-w-2xl text-left space-y-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-700 text-white shadow-sm">
                  Curated Collective
                </span>
                <h1 className="text-3xl sm:text-5xl font-bold font-serif tracking-tight text-brand-900 leading-tight">
                  Aesthetic Everyday Instruments.
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed italic">
                  A premium assembly of noise-cancelling acoustics, smart wearables, and tactile desktop accessories styled to complement your workspace.
                </p>
                <div className="pt-2 flex items-center gap-4">
                  <button 
                    onClick={() => {
                      const el = document.getElementById('catalog-grid');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all shadow-sm active:scale-95 group"
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">6 Premium pieces in stock</span>
                </div>
              </div>
            </div>

            {/* Timed Deals Acquisitions */}
            <DealsSlider onProductClick={(prod) => { setSelectedProduct(prod); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />

            {/* Grid Search & Filter Rail */}
            <div className="flex flex-col gap-4 pt-4 pb-6 border-b border-brand-200">
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                {/* Search Bar Input */}
                <div className="relative flex-grow max-w-lg">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by product name or description..."
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-brand-200 text-xs focus:outline-none focus:border-brand-500 bg-white text-stone-800 transition-colors shadow-sm"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setDebouncedSearch(''); }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brand-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Actions: Filters & Sorting */}
                <div className="flex items-center gap-2.5 justify-between md:justify-end">
                  {/* Total Count (Visual helper) */}
                  <span className="text-[11px] font-mono text-stone-500 font-medium">
                    Found {filteredProducts.length} exquisite {filteredProducts.length === 1 ? 'piece' : 'pieces'}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Filter Button for Mobile / Desktop Drawer Toggle */}
                    <button
                      onClick={() => setIsMobileFiltersOpen(true)}
                      className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                        activeFiltersCount > 0
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                          : 'bg-white hover:bg-brand-100 text-stone-500 hover:text-brand-900 border-brand-200'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Filters</span>
                      {activeFiltersCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-white text-brand-500 text-[10px] font-bold flex items-center justify-center">
                          {activeFiltersCount}
                        </span>
                      )}
                    </button>

                    {/* Sorting Select Menu */}
                    <div className="relative flex items-center gap-1 bg-white border border-brand-200 rounded-full px-3 py-1.5 shadow-sm text-stone-600">
                      <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="bg-transparent text-xs font-bold uppercase tracking-wider text-stone-600 focus:outline-none cursor-pointer pr-1"
                      >
                        <option value="featured">Featured</option>
                        <option value="price_asc">Price: Low-High</option>
                        <option value="price_desc">Price: High-Low</option>
                        <option value="rating_desc">Top Rated</option>
                        <option value="name_asc">Name: A-Z</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Filter Tags Row */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 animate-fadeIn">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mr-1">
                    Active:
                  </span>
                  {selectedCategory !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-100 border border-brand-200 text-[10px] font-bold text-brand-900 uppercase tracking-wider">
                      <span>Category: {selectedCategory}</span>
                      <button 
                        onClick={() => handleRemoveSingleFilter('category')}
                        className="p-0.5 hover:bg-brand-200/50 rounded-full transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery !== '' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-100 border border-brand-200 text-[10px] font-bold text-brand-900 uppercase tracking-wider">
                      <span>Search: "{searchQuery}"</span>
                      <button 
                        onClick={() => handleRemoveSingleFilter('search')}
                        className="p-0.5 hover:bg-brand-200/50 rounded-full transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {(minPrice !== '' || maxPrice !== '') && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-100 border border-brand-200 text-[10px] font-bold text-brand-900 uppercase tracking-wider">
                      <span>
                        Price: {minPrice !== '' ? `$${minPrice}` : '$0'} - {maxPrice !== '' ? `$${maxPrice}` : '∞'}
                      </span>
                      <button 
                        onClick={() => handleRemoveSingleFilter('price')}
                        className="p-0.5 hover:bg-brand-200/50 rounded-full transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {minRating !== '' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-100 border border-brand-200 text-[10px] font-bold text-brand-900 uppercase tracking-wider">
                      <span>Rating: {minRating}+ ★</span>
                      <button 
                        onClick={() => handleRemoveSingleFilter('rating')}
                        className="p-0.5 hover:bg-brand-200/50 rounded-full transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {inStockOnly && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-100 border border-brand-200 text-[10px] font-bold text-brand-900 uppercase tracking-wider">
                      <span>In Stock Only</span>
                      <button 
                        onClick={() => handleRemoveSingleFilter('stock')}
                        className="p-0.5 hover:bg-brand-200/50 rounded-full transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={handleClearAllFilters}
                    className="text-[10px] font-bold text-brand-700 hover:text-brand-900 uppercase tracking-widest hover:underline cursor-pointer ml-1 py-1"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Responsive catalog grid layout */}
            <div id="catalog-grid" className="scroll-mt-24">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* 1. Left Sidebar Filter Panel (Sticky on Desktop, hidden on Mobile) */}
                <div className="hidden lg:block lg:col-span-1">
                  <FilterSidebar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    minRating={minRating}
                    setMinRating={setMinRating}
                    inStockOnly={inStockOnly}
                    setInStockOnly={setInStockOnly}
                    onClearAll={handleClearAllFilters}
                    activeFiltersCount={activeFiltersCount}
                  />
                </div>

                {/* 2. Main Product Listing Section */}
                <div className="lg:col-span-3">
                  {filteredProducts.length === 0 ? (
                    <div className="py-24 text-center space-y-4 max-w-sm mx-auto">
                      <div className="w-16 h-16 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-500 mx-auto">
                        <Search className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-brand-900 uppercase tracking-wider">No matching products found</h4>
                        <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">Please try modifying your keywords, adjusting the price bounds, or clearing active filters to refresh the catalog.</p>
                      </div>
                      <button
                        onClick={handleClearAllFilters}
                        className="px-5 py-2.5 rounded-full bg-brand-500 text-white font-bold text-[10px] uppercase tracking-wider shadow hover:bg-brand-600 transition-colors cursor-pointer mt-4"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onEditClick={() => {
                            setActiveView('admin');
                          }}
                          onCardClick={(prod) => {
                            setSelectedProduct(prod);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Filter Slide-out Overlay Bottom Sheet */}
            {isMobileFiltersOpen && (
              <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 bg-brand-900/45 backdrop-blur-xs"
                  onClick={() => setIsMobileFiltersOpen(false)}
                />
                {/* Bottom Sheet Drawer */}
                <div className="relative bg-white rounded-t-3xl border-t border-brand-200 shadow-2xl max-h-[85vh] overflow-y-auto z-10 p-6 animate-fadeIn flex flex-col">
                  <div className="flex items-center justify-between pb-4 border-b border-brand-100 mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-900 flex items-center gap-2">
                      <Filter className="w-4 h-4 text-brand-500" />
                      <span>Filter Options</span>
                    </h3>
                    <button
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="p-1.5 rounded-full hover:bg-brand-100 text-stone-400 hover:text-brand-500 transition-all border border-transparent hover:border-brand-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pb-4">
                    <FilterSidebar
                      categories={categories}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      minPrice={minPrice}
                      setMinPrice={setMinPrice}
                      maxPrice={maxPrice}
                      setMaxPrice={setMaxPrice}
                      minRating={minRating}
                      setMinRating={setMinRating}
                      inStockOnly={inStockOnly}
                      setInStockOnly={setInStockOnly}
                      onClearAll={handleClearAllFilters}
                      activeFiltersCount={activeFiltersCount}
                    />
                  </div>

                  <div className="pt-4 border-t border-brand-100">
                    <button
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="w-full py-3.5 rounded-full bg-brand-500 text-white font-bold text-xs uppercase tracking-wider text-center shadow hover:bg-brand-600 transition-colors cursor-pointer"
                    >
                      Apply Filters ({filteredProducts.length} Results)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          )
        )}

        {/* VIEW 2: ADMIN PANEL */}
        {activeView === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminPanel />
          ) : (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Admin Credentials Required</h3>
                <p className="text-xs text-neutral-500 mt-1">You must sign in as an Administrator to access the inventory console and sales tracking logs.</p>
              </div>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-brand-600 text-xs font-semibold shadow transition-all"
              >
                Sign In as Admin
              </button>
            </div>
          )
        )}

        {/* VIEW 3: ORDER LIST VIEW */}
        {activeView === 'orders' && (
          currentUser ? (
            <OrdersList />
          ) : (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Tag className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Sign in to track orders</h3>
                <p className="text-xs text-neutral-500 mt-1">Authenticate to synchronize your orders, download invoice forms, and view dispatch history.</p>
              </div>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-brand-600 text-xs font-semibold shadow transition-all"
              >
                Sign In Now
              </button>
            </div>
          )
        )}
      </main>

      {/* Curated Luxury Footer */}
      <footer className="bg-white border-t border-neutral-100 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-neutral-950 text-white flex items-center justify-center text-xs font-bold">
              A
            </div>
            <span className="text-xs font-bold font-display tracking-widest text-neutral-500">
              AURA DIGITAL CO.
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">
            <span>Secure Transactions via Stripe</span>
            <span>•</span>
            <span>24/7 Client Support</span>
            <span>•</span>
            <span>Ephemeral Database</span>
          </div>

          <div className="text-[10px] text-neutral-400 font-mono">
            © 2026 AURA. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Cart Slider Drawer */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckoutClick={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onLoginClick={() => {
          setIsCartOpen(false);
          setIsAuthOpen(true);
        }}
      />

      {/* Wishlist Slider Drawer */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        onProductClick={(product) => {
          setSelectedProduct(product);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Billing Secure Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onViewOrders={() => setActiveView('orders')}
      />

      {/* Dedicated Sign-in overlays */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Micro floating feedback messages */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
