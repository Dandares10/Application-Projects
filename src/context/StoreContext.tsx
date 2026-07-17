import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order, User, UserRole, ShippingAddress } from '../types.ts';

// ==========================================
// TOAST DIALOG INTERFACES
// ==========================================

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

// ==========================================
// CENTRALIZED STORE STATE SPECIFICATION
// ==========================================

interface StoreContextType {
  products: Product[];
  filteredProducts: Product[];
  orders: Order[];
  cart: CartItem[];
  wishlist: Product[];
  currentUser: User | null;
  isLoading: boolean;
  toasts: ToastMessage[];
  addToast: (text: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  fetchProducts: (filters?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    inStock?: boolean;
    sortBy?: string;
  }) => Promise<void>;
  fetchOrders: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  login: (email: string, name?: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  createOrder: (shippingAddress: ShippingAddress, paymentMethod: 'stripe' | 'paypal' | 'simulated', stripePaymentIntentId?: string) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id'>>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
}

// 1. Instantiating our React context stage
const StoreContext = createContext<StoreContextType | undefined>(undefined);

// 2. Custom hook wrapper
// Streamlines accessing state without manually invoking `useContext(StoreContext)` in every single widget!
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};

// ==========================================
// STORE DATA PROVIDER ORCHESTRATOR
// ==========================================

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  // --- Standard Local State Tracks ---
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 3. TOAST SYSTEM WITH AUTO-DESTRUCT
  // Appends a new user alert and triggers a delayed window scheduler to tear it down after 4000ms.
  const addToast = (text: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 4. ON-MOUNT PERSISTENCE DESERIALIZER (useEffect)
  // Re-syncs previous active sessions, shopping bags, and wishlists from the client browser's memory cache.
  // We use robust try-catch blocks to prevent breaking in case of malformed local JSON strings.
  useEffect(() => {
    const storedUser = localStorage.getItem('ecom_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('ecom_user');
      }
    }

    const storedCart = localStorage.getItem('ecom_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        localStorage.removeItem('ecom_cart');
      }
    }

    const storedWishlist = localStorage.getItem('ecom_wishlist');
    if (storedWishlist) {
      try {
        setWishlist(JSON.parse(storedWishlist));
      } catch (e) {
        localStorage.removeItem('ecom_wishlist');
      }
    }
    
    setIsLoading(false);
  }, []);

  // 5. CACHE SYNCHRONIZATION LISTENERS
  // Whenever `cart` or `wishlist` changes, we update LocalStorage to guarantee durable client-side storage.
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('ecom_cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('ecom_cart');
    }
  }, [cart]);

  useEffect(() => {
    if (wishlist.length > 0) {
      localStorage.setItem('ecom_wishlist', JSON.stringify(wishlist));
    } else {
      localStorage.removeItem('ecom_wishlist');
    }
  }, [wishlist]);

  // 6. MASTER PRODUCTS DISPATCHER
  // Loads the complete unfiltered inventory from the server.
  const fetchMasterProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching master products:', err);
    }
  };

  // 7. FILTERED DYNAMIC REST SEARCH LOGIC
  // Compiles multiple filter variables into secure, standardized URL query params.
  const fetchProducts = async (filters?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    inStock?: boolean;
    sortBy?: string;
  }) => {
    try {
      let url = '/api/products';
      const hasFilters = filters && (
        filters.search || 
        (filters.category && filters.category !== 'All') || 
        filters.minPrice !== undefined || 
        filters.maxPrice !== undefined || 
        filters.rating !== undefined || 
        filters.inStock || 
        filters.sortBy
      );

      if (filters) {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.category && filters.category !== 'All') params.append('category', filters.category);
        if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
        if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
        if (filters.rating !== undefined) params.append('rating', String(filters.rating));
        if (filters.inStock !== undefined) params.append('inStock', String(filters.inStock));
        if (filters.sortBy) params.append('sortBy', filters.sortBy);

        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFilteredProducts(data);
        if (!hasFilters) {
          setProducts(data);
        }
      } else {
        addToast('Failed to load product catalog.', 'error');
      }
    } catch (err) {
      addToast('Network error loading products.', 'error');
    }
  };

  // 8. ORDERS RECOVERY PROTOCOL
  // Passes client-side auth context credentials securely using custom HTTP header attributes.
  const fetchOrders = async () => {
    if (!currentUser) return;
    try {
      const headers: Record<string, string> = {
        'x-user-role': currentUser.role,
        'x-user-email': currentUser.email,
      };

      const res = await fetch('/api/orders', { headers });
      if (res.ok) {
        const data = await res.json();
        // Sort orders by newest first
        setOrders(data.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // Synchronize dynamic requests when User context pivots
  useEffect(() => {
    fetchMasterProducts();
    fetchProducts();
    if (currentUser) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [currentUser]);

  // ==========================================
  // TRANSACTION OPERATIONAL LOGIC
  // ==========================================

  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      addToast(`Sorry, ${product.name} is out of stock!`, 'error');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          addToast(`Only ${product.stock} units available in stock.`, 'info');
          return prev;
        }
        addToast(`Updated quantity of ${product.name} in cart!`, 'success');
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      addToast(`Added ${product.name} to cart!`, 'success');
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find(i => i.product.id === productId);
    if (item) {
      setCart(prev => prev.filter(i => i.product.id !== productId));
      addToast(`Removed ${item.product.name} from cart.`, 'info');
    }
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find(i => i.product.id === productId);
    if (item) {
      if (quantity > item.product.stock) {
        addToast(`Only ${item.product.stock} units available.`, 'info');
        return;
      }
      setCart(prev => 
        prev.map(i => i.product.id === productId ? { ...i, quantity } : i)
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  // ==========================================
  // WISHLIST OPERATIONAL LOGIC
  // ==========================================

  const addToWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        addToast(`${product.name} is already in your wishlist.`, 'info');
        return prev;
      }
      addToast(`Added ${product.name} to wishlist!`, 'success');
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => {
      const filtered = prev.filter(item => item.id !== productId);
      const found = prev.find(item => item.id === productId);
      if (found) {
        addToast(`Removed ${found.name} from wishlist.`, 'info');
      }
      return filtered;
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  // ==========================================
  // USER AUTHENTICATION FLOWS
  // ==========================================

  const login = async (email: string, name?: string, role: UserRole = 'user') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role })
      });

      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        localStorage.setItem('ecom_user', JSON.stringify(user));
        addToast(`Welcome back, ${user.name}!`, 'success');
        return true;
      }
      addToast('Login failed.', 'error');
      return false;
    } catch (err) {
      addToast('Network error during login.', 'error');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ecom_user');
    clearCart();
    addToast('Successfully signed out.', 'info');
  };

  // ==========================================
  // COMMERCE ORDER CREATION (CHECKOUT)
  // ==========================================

  const createOrder = async (
    shippingAddress: ShippingAddress, 
    paymentMethod: 'stripe' | 'paypal' | 'simulated', 
    stripePaymentIntentId?: string
  ): Promise<Order | null> => {
    if (!currentUser) return null;

    try {
      const orderPayload = {
        userId: currentUser.id,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image
        })),
        totalAmount: cart.reduce((total, item) => total + (item.product.price * item.quantity), 0),
        shippingAddress,
        paymentMethod,
        paymentStatus: 'paid', 
        stripePaymentIntentId
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-email': currentUser.email,
        },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const newOrder = await res.json();
        setOrders(prev => [newOrder, ...prev]);
        clearCart();
        fetchProducts(); // Refresh stock in frontend catalog dynamically
        addToast(`Order ${newOrder.id} successfully placed!`, 'success');
        return newOrder;
      }
      addToast('Error saving order records.', 'error');
      return null;
    } catch (err) {
      addToast('Network error during checkout.', 'error');
      return null;
    }
  };

  // ==========================================
  // ADMINISTRATIVE API CONTROL SERVICES
  // ==========================================

  const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
    if (!currentUser || currentUser.role !== 'admin') return false;

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-email': currentUser.email,
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        addToast(`Order ${orderId} updated to ${status}!`, 'success');
        return true;
      }
      addToast('Failed to update order status.', 'error');
      return false;
    } catch (err) {
      addToast('Network error updating order.', 'error');
      return false;
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
    if (!currentUser || currentUser.role !== 'admin') return null;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-email': currentUser.email,
        },
        body: JSON.stringify(product)
      });

      if (res.ok) {
        const newProduct = await res.json();
        setProducts(prev => [...prev, newProduct]);
        setFilteredProducts(prev => [...prev, newProduct]);
        addToast(`${newProduct.name} added to catalog!`, 'success');
        return newProduct;
      }
      addToast('Error creating product.', 'error');
      return null;
    } catch (err) {
      addToast('Network error adding product.', 'error');
      return null;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id'>>): Promise<Product | null> => {
    if (!currentUser || currentUser.role !== 'admin') return null;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-email': currentUser.email,
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        const updated = await res.json();
        setProducts(prev => prev.map(p => p.id === id ? updated : p));
        setFilteredProducts(prev => prev.map(p => p.id === id ? updated : p));
        addToast(`${updated.name} updated successfully.`, 'success');
        return updated;
      }
      addToast('Error updating product.', 'error');
      return null;
    } catch (err) {
      addToast('Network error updating product.', 'error');
      return null;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    if (!currentUser || currentUser.role !== 'admin') return false;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser.role,
          'x-user-email': currentUser.email,
        }
      });

      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setFilteredProducts(prev => prev.filter(p => p.id !== id));
        addToast('Product successfully removed.', 'success');
        return true;
      }
      addToast('Error deleting product.', 'error');
      return false;
    } catch (err) {
      addToast('Network error deleting product.', 'error');
      return false;
    }
  };

  return (
    <StoreContext.Provider value={{
      products,
      filteredProducts,
      orders,
      cart,
      currentUser,
      isLoading,
      toasts,
      addToast,
      removeToast,
      fetchProducts,
      fetchOrders,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      login,
      logout,
      createOrder,
      updateOrderStatus,
      addProduct,
      updateProduct,
      deleteProduct
    }}>
      {children}
    </StoreContext.Provider>
  );
};

