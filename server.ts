import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { dbService } from './src/db.ts';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Stripe client lazy initialization
let stripe: Stripe | null = null;
const getStripe = (): Stripe | null => {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey) {
      try {
        stripe = new Stripe(secretKey, {
          apiVersion: '2025-01-27-preview' as any,
        });
        console.log('Stripe successfully initialized.');
      } catch (err) {
        console.error('Error initializing Stripe:', err);
      }
    }
  }
  return stripe;
};

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Authentication Route
app.post('/api/auth/login', (req, res) => {
  const { email, name, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  const user = dbService.getOrCreateUser(email, name, role || 'user');
  res.json(user);
});

// 2. Products API
app.get('/api/products', (req, res) => {
  let products = [...dbService.getProducts()];
  const { search, category, minPrice, maxPrice, rating, inStock, sortBy } = req.query;

  if (search) {
    const q = String(search).toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
  }

  if (minPrice) {
    products = products.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    products = products.filter(p => p.price <= Number(maxPrice));
  }

  if (rating) {
    products = products.filter(p => (p.rating || 0) >= Number(rating));
  }

  if (inStock === 'true') {
    products = products.filter(p => p.stock > 0);
  }

  if (sortBy) {
    if (sortBy === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating_desc') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'name_asc') {
      products.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = dbService.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json(product);
});

// Create product (Admin only logic verified via request header check for simplicity)
app.post('/api/products', (req, res) => {
  const userRole = req.headers['x-user-role'];
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }

  const { name, description, price, image, category, stock } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required.' });
  }

  const newProduct = dbService.addProduct({
    name,
    description: description || '',
    price: Number(price),
    image: image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80',
    category,
    stock: stock !== undefined ? Number(stock) : 10,
    rating: 5.0,
    reviewsCount: 0,
    isFeatured: req.body.isFeatured || false,
  });

  res.status(201).json(newProduct);
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const userRole = req.headers['x-user-role'];
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }

  const updated = dbService.updateProduct(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json(updated);
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const userRole = req.headers['x-user-role'];
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }

  const success = dbService.deleteProduct(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json({ success: true, message: 'Product deleted.' });
});

// 3. Orders API
app.get('/api/orders', (req, res) => {
  const userRole = req.headers['x-user-role'] as string;
  const userEmail = req.headers['x-user-email'] as string;

  if (userRole === 'admin') {
    return res.json(dbService.getOrders());
  }

  if (!userEmail) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const user = dbService.getUsers().find(u => u.email.toLowerCase() === userEmail.toLowerCase());
  if (!user) {
    return res.json([]);
  }

  res.json(dbService.getOrdersByUser(user.id));
});

app.get('/api/orders/:id', (req, res) => {
  const order = dbService.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  // Authorize check
  const userRole = req.headers['x-user-role'] as string;
  const userEmail = req.headers['x-user-email'] as string;

  if (userRole !== 'admin' && order.customerEmail.toLowerCase() !== userEmail?.toLowerCase()) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  res.json(order);
});

// Create Order (Checkout)
app.post('/api/orders', (req, res) => {
  const { userId, customerName, customerEmail, items, totalAmount, shippingAddress, paymentMethod, paymentStatus, stripePaymentIntentId } = req.body;

  if (!customerEmail || !items || !items.length || !totalAmount || !shippingAddress) {
    return res.status(400).json({ error: 'Missing required order fields.' });
  }

  // Fetch or create user record
  const user = dbService.getOrCreateUser(customerEmail, customerName);

  const newOrder = dbService.createOrder({
    userId: userId || user.id,
    customerName: customerName || user.name,
    customerEmail: customerEmail.toLowerCase(),
    items,
    totalAmount: Number(totalAmount),
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentStatus || 'pending',
    stripePaymentIntentId,
  });

  res.status(201).json(newOrder);
});

// Update Order Status (Admin only)
app.put('/api/orders/:id/status', (req, res) => {
  const userRole = req.headers['x-user-role'];
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }

  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  const updated = dbService.updateOrderStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  res.json(updated);
});

// 4. Payment Gateway Integration API (Stripe)
app.post('/api/checkout/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;
  if (!amount) {
    return res.status(400).json({ error: 'Amount is required.' });
  }

  const stripeClient = getStripe();

  if (!stripeClient) {
    // Return simulated state if Stripe key is not configured
    return res.json({
      isSimulated: true,
      clientSecret: `simulated_secret_${Date.now()}`,
      message: 'Stripe API is not configured. Running in high-fidelity sandbox simulation mode.'
    });
  }

  try {
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(Number(amount) * 100), // convert to cents
      currency: currency || 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      isSimulated: false,
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Stripe error occurred.' });
  }
});

// ----------------------------------------------------
// VITE DEV SERVER OR STATIC ASSET SERVING
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted for local development.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving compiled static assets in production.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Application dev server running on http://localhost:${PORT}`);
  });
}

startServer();
