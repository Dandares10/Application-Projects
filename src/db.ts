import fs from 'fs';
import path from 'path';
import { Product, Order, User } from './types.ts';

const DB_PATH = path.join(process.cwd(), 'db.json');

interface DbSchema {
  products: Product[];
  orders: Order[];
  users: User[];
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'ZenBuds Pro Wireless',
    description: 'Premium noise-cancelling wireless earbuds with spatial audio, 30-hour battery life, and ultra-comfortable secure fit.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
    category: 'Audio',
    stock: 25,
    rating: 4.8,
    reviewsCount: 124,
    isFeatured: true
  },
  {
    id: 'prod-2',
    name: 'Chronos Smartwatch',
    description: 'Sleek fitness tracker and smartwatch with AMOLED display, continuous heart rate monitoring, sleep analysis, and GPS tracking.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&q=80',
    category: 'Wearables',
    stock: 15,
    rating: 4.6,
    reviewsCount: 88,
    isFeatured: true
  },
  {
    id: 'prod-3',
    name: 'Aether Mechanical Keyboard',
    description: 'Hot-swappable tactile mechanical keyboard with custom RGB backlighting, aluminum frame, and sound-dampening foam.',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80',
    category: 'Accessories',
    stock: 12,
    rating: 4.9,
    reviewsCount: 56,
    isFeatured: true
  },
  {
    id: 'prod-4',
    name: 'Vortex Precision Mouse',
    description: 'Ergonomic high-precision wireless mouse with programmable side buttons, infinite scroll, and customizable DPI up to 26,000.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80',
    category: 'Accessories',
    stock: 30,
    rating: 4.5,
    reviewsCount: 92
  },
  {
    id: 'prod-5',
    name: 'Lumina Smart Desk Lamp',
    description: 'Minimalist smart LED desk lamp with adjustable color temperature, brightness schedules, and built-in fast wireless charging pad.',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
    category: 'Lifestyle',
    stock: 18,
    rating: 4.4,
    reviewsCount: 41
  },
  {
    id: 'prod-6',
    name: 'Nomad Tech Backpack',
    description: 'Weatherproof premium commuter backpack with dedicated padded compartments for a 16" laptop, tablet, chargers, and custom layout organization.',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    category: 'Lifestyle',
    stock: 10,
    rating: 4.7,
    reviewsCount: 73
  }
];

const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin',
    email: 'admin@example.com',
    name: 'Demo Admin',
    role: 'admin'
  },
  {
    id: 'user-regular',
    email: 'user@example.com',
    name: 'Demo User',
    role: 'user'
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    userId: 'user-regular',
    customerName: 'Demo User',
    customerEmail: 'user@example.com',
    items: [
      {
        productId: 'prod-1',
        name: 'ZenBuds Pro Wireless',
        price: 149.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80'
      },
      {
        productId: 'prod-5',
        name: 'Lumina Smart Desk Lamp',
        price: 59.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80'
      }
    ],
    totalAmount: 209.98,
    status: 'delivered',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    shippingAddress: {
      street: '123 Innovation Way',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94107',
      country: 'United States'
    },
    paymentMethod: 'simulated',
    paymentStatus: 'paid'
  }
];

function readDb(): DbSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initialDb: DbSchema = {
        products: DEFAULT_PRODUCTS,
        orders: DEFAULT_ORDERS,
        users: DEFAULT_USERS
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading file-based database:', error);
    return {
      products: DEFAULT_PRODUCTS,
      orders: DEFAULT_ORDERS,
      users: DEFAULT_USERS
    };
  }
}

function writeDb(db: DbSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing file-based database:', error);
  }
}

export const dbService = {
  // Products
  getProducts(): Product[] {
    return readDb().products;
  },

  getProductById(id: string): Product | undefined {
    return readDb().products.find(p => p.id === id);
  },

  addProduct(product: Omit<Product, 'id'>): Product {
    const data = readDb();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`
    };
    data.products.push(newProduct);
    writeDb(data);
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<Omit<Product, 'id'>>): Product | undefined {
    const data = readDb();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    data.products[index] = {
      ...data.products[index],
      ...updates
    };
    writeDb(data);
    return data.products[index];
  },

  deleteProduct(id: string): boolean {
    const data = readDb();
    const filtered = data.products.filter(p => p.id !== id);
    if (filtered.length === data.products.length) return false;
    data.products = filtered;
    writeDb(data);
    return true;
  },

  // Users
  getOrCreateUser(email: string, name?: string, role: 'admin' | 'user' = 'user'): User {
    const data = readDb();
    let user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        role
      };
      data.users.push(user);
      writeDb(data);
    } else if (name && user.name !== name) {
      user.name = name;
      writeDb(data);
    }
    return user;
  },

  getUsers(): User[] {
    return readDb().users;
  },

  // Orders
  getOrders(): Order[] {
    return readDb().orders;
  },

  getOrdersByUser(userId: string): Order[] {
    return readDb().orders.filter(o => o.userId === userId);
  },

  getOrderById(id: string): Order | undefined {
    return readDb().orders.find(o => o.id === id);
  },

  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>): Order {
    const data = readDb();
    
    // Deduct stock if payment was successful
    if (order.paymentStatus === 'paid') {
      order.items.forEach(item => {
        const prod = data.products.find(p => p.id === item.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      });
    }

    const newOrder: Order = {
      ...order,
      id: `ord-${1000 + data.orders.length + 1}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    data.orders.push(newOrder);
    writeDb(data);
    return newOrder;
  },

  updateOrderStatus(id: string, status: Order['status']): Order | undefined {
    const data = readDb();
    const index = data.orders.findIndex(o => o.id === id);
    if (index === -1) return undefined;

    data.orders[index].status = status;
    writeDb(data);
    return data.orders[index];
  },

  updateOrderPaymentStatus(id: string, paymentStatus: Order['paymentStatus']): Order | undefined {
    const data = readDb();
    const index = data.orders.findIndex(o => o.id === id);
    if (index === -1) return undefined;

    data.orders[index].paymentStatus = paymentStatus;
    writeDb(data);
    return data.orders[index];
  }
};
