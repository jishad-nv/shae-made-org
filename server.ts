import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_PRODUCTS,
  INITIAL_HERO,
  INITIAL_CATEGORIES,
  INITIAL_REVIEWS,
  INITIAL_STORIES,
  INITIAL_INQUIRIES,
  INITIAL_ORDERS,
  INITIAL_CONFIG,
} from './src/data/initialData';
import {
  Product,
  Category,
  HeroSettings,
  Review,
  StoryItem,
  Inquiry,
  Order,
  StoreConfig,
  DashboardMetrics,
} from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'server', 'db.json');

// Ensure server db directory exists
if (!fs.existsSync(path.join(__dirname, 'server'))) {
  fs.mkdirSync(path.join(__dirname, 'server'), { recursive: true });
}

interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  heroSettings: HeroSettings;
  reviews: Review[];
  stories: StoryItem[];
  inquiries: Inquiry[];
  orders: Order[];
  config: StoreConfig;
}

// Load or initialize DB
function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.products && parsed.orders) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading db.json, re-initializing from defaults:', err);
  }

  const initialDB: DatabaseSchema = {
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    heroSettings: INITIAL_HERO,
    reviews: INITIAL_REVIEWS,
    stories: INITIAL_STORIES,
    inquiries: INITIAL_INQUIRIES,
    orders: INITIAL_ORDERS,
    config: INITIAL_CONFIG,
  };

  saveDatabase(initialDB);
  return initialDB;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

let db = loadDatabase();

// Calculate live business metrics
function calculateMetrics(database: DatabaseSchema): DashboardMetrics {
  const confirmedOrders = database.orders.filter(
    (o) => o.status !== 'Inquiry'
  );
  const totalRevenue = confirmedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const averageOrderValue = confirmedOrders.length
    ? Math.round(totalRevenue / confirmedOrders.length)
    : 0;

  return {
    confirmedOrdersCount: confirmedOrders.length,
    totalRevenue,
    averageOrderValue,
    pendingInquiriesCount: database.inquiries.filter((i) => i.st === 0).length,
    craftingCount: database.orders.filter((o) => o.status === 'Crafting').length,
    dispatchedCount: database.orders.filter((o) => o.status === 'Dispatched').length,
    completedCount: database.orders.filter((o) => o.status === 'Completed').length,
    activeProductsCount: database.products.filter((p) => Boolean(p.vis)).length,
    outOfStockCount: database.products.filter((p) => !p.stock).length,
  };
}

// Middleware
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// ======================== API ROUTES ========================

// Health & System
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Full state
app.get('/api/state', (_req: Request, res: Response) => {
  res.json({
    ...db,
    metrics: calculateMetrics(db),
  });
});

// Metrics
app.get('/api/metrics', (_req: Request, res: Response) => {
  res.json(calculateMetrics(db));
});

// ---- ORDERS ----
app.get('/api/orders', (req: Request, res: Response) => {
  const { status } = req.query;
  let results = [...db.orders];
  if (status && status !== 'All') {
    results = results.filter((o) => o.status === status);
  }
  res.json(results);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const {
    customerName,
    phone,
    address,
    city,
    pincode,
    items,
    totalAmount,
    status = 'Confirmed',
    paid = true,
    notes = '',
    source = 'Storefront',
  } = req.body;

  if (!customerName || !phone || !address) {
    res.status(400).json({ error: 'Customer name, phone, and address are required' });
    return;
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newOrder: Order = {
    id: `SM-${randomNum}`,
    customerName: customerName.trim(),
    phone: phone.trim(),
    address: address.trim(),
    city: city?.trim() || '',
    pincode: pincode?.trim() || '',
    items: Array.isArray(items) ? items : [],
    totalAmount: Number(totalAmount) || 0,
    status: status as Order['status'],
    paid: Boolean(paid),
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
    notes: notes.trim(),
    source: source as Order['source'],
  };

  db.orders.unshift(newOrder);

  // Also log into inquiries CRM for seamless omnichannel tracking
  const itemsText = newOrder.items.map((i) => `${i.name} (x${i.q})`).join(' + ') || 'Custom order';
  const newInq: Inquiry = {
    id: String(randomNum),
    name: newOrder.customerName,
    loc: `${newOrder.city || ''} ${newOrder.address}`.trim(),
    phone: newOrder.phone,
    item: itemsText,
    total: newOrder.totalAmount,
    st: 1, // Confirmed
    time: 'Just now',
    memo: newOrder.notes || 'Order placed via storefront',
    paid: newOrder.paid,
    platform: 'Storefront',
  };
  db.inquiries.unshift(newInq);

  saveDatabase(db);
  res.status(201).json(newOrder);
});

app.patch('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.orders.findIndex((o) => o.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  db.orders[idx] = { ...db.orders[idx], ...req.body };
  saveDatabase(db);
  res.json(db.orders[idx]);
});

app.delete('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.orders = db.orders.filter((o) => o.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Order deleted' });
});

// ---- INQUIRIES & CHATS / INSTAGRAM LEADS ----
app.get('/api/inquiries', (_req: Request, res: Response) => {
  res.json(db.inquiries);
});

app.post('/api/inquiries', (req: Request, res: Response) => {
  const {
    name,
    phone = '',
    loc = '—',
    item,
    total = 0,
    memo = '',
    platform = 'Instagram',
    handle = '',
    refs = [],
  } = req.body;

  const newInquiry: Inquiry = {
    id: String(Math.floor(1000 + Math.random() * 9000)),
    name: name?.trim() || 'New Customer',
    phone: phone.trim(),
    loc: loc.trim(),
    item: item?.trim() || 'Custom craft inquiry',
    total: Number(total) || 0,
    st: 0, // Inquiry
    time: 'Just now',
    memo: memo.trim(),
    paid: false,
    platform: platform as Inquiry['platform'],
    handle: handle.trim(),
    refs: Array.isArray(refs) ? refs : [],
  };

  db.inquiries.unshift(newInquiry);
  saveDatabase(db);
  res.status(201).json(newInquiry);
});

app.patch('/api/inquiries/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.inquiries.findIndex((i) => i.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Inquiry not found' });
    return;
  }

  db.inquiries[idx] = { ...db.inquiries[idx], ...req.body };
  saveDatabase(db);
  res.json(db.inquiries[idx]);
});

app.delete('/api/inquiries/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.inquiries = db.inquiries.filter((i) => i.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Inquiry deleted' });
});

// ---- PRODUCTS ----
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search } = req.query;
  let results = [...db.products];

  if (category && category !== 'All') {
    results = results.filter((p) => p.cat === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    results = results.filter((p) =>
      (p.name + p.sub + p.cat + (p.desc || '')).toLowerCase().includes(q)
    );
  }

  res.json(results);
});

app.post('/api/products', (req: Request, res: Response) => {
  const {
    name,
    sub = 'Handmade with love',
    desc = '',
    cat = 'Resin Crafts',
    price = 499,
    mrp = 699,
    badge = 'New',
    stock = 1,
    vis = 1,
    img = 'coasters',
    more = [],
    tags = [],
  } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Product name is required' });
    return;
  }

  const newProduct: Product = {
    id: `p${Date.now().toString().slice(-6)}`,
    name: name.trim(),
    sub: sub.trim(),
    desc: desc.trim(),
    cat: cat.trim(),
    price: Number(price) || 0,
    mrp: Number(mrp) || Number(price) || 0,
    badge: badge.trim(),
    stock: stock ? 1 : 0,
    vis: vis ? 1 : 0,
    img: img || 'coasters',
    more: Array.isArray(more) ? more.slice(0, 10) : [],
    tags: Array.isArray(tags) ? tags : [],
  };

  db.products.unshift(newProduct);
  saveDatabase(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  db.products[idx] = {
    ...db.products[idx],
    ...req.body,
    more: Array.isArray(req.body.more) ? req.body.more.slice(0, 10) : db.products[idx].more,
  };

  saveDatabase(db);
  res.json(db.products[idx]);
});

app.patch('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  db.products[idx] = { ...db.products[idx], ...req.body };
  saveDatabase(db);
  res.json(db.products[idx]);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.products = db.products.filter((p) => p.id !== id);
  // Also remove from trending slots if present
  db.heroSettings.slots = db.heroSettings.slots.filter((slotId) => slotId !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Product deleted' });
});

// ---- CATEGORIES ----
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json(db.categories);
});

app.post('/api/categories', (req: Request, res: Response) => {
  const { name, icon = 'palette' } = req.body;
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Category name is required' });
    return;
  }

  const cleanName = name.trim();
  if (db.categories.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
    res.status(400).json({ error: 'Category already exists' });
    return;
  }

  const newCat: Category = { name: cleanName, icon: icon.trim() };
  db.categories.push(newCat);
  saveDatabase(db);
  res.status(201).json(newCat);
});

app.put('/api/categories', (req: Request, res: Response) => {
  if (!Array.isArray(req.body)) {
    res.status(400).json({ error: 'Expected an array of categories' });
    return;
  }
  db.categories = req.body;
  saveDatabase(db);
  res.json(db.categories);
});

app.delete('/api/categories/:name', (req: Request, res: Response) => {
  const { name } = req.params;
  db.categories = db.categories.filter((c) => c.name !== name);
  saveDatabase(db);
  res.json({ success: true, message: 'Category removed' });
});

// ---- SHOWCASE & HERO SETTINGS ----
app.get('/api/showcase', (_req: Request, res: Response) => {
  res.json({
    heroSettings: db.heroSettings,
    stories: db.stories,
  });
});

app.put('/api/showcase', (req: Request, res: Response) => {
  if (req.body.heroSettings) {
    db.heroSettings = { ...db.heroSettings, ...req.body.heroSettings };
  }
  if (req.body.slots) {
    db.heroSettings.slots = req.body.slots;
  }
  saveDatabase(db);
  res.json({ heroSettings: db.heroSettings, stories: db.stories });
});

app.post('/api/stories', (req: Request, res: Response) => {
  const { img, cap = '', url = '' } = req.body;
  if (!img) {
    res.status(400).json({ error: 'Image URL or base64 is required' });
    return;
  }

  const newStory: StoryItem = {
    img,
    cap: cap.trim(),
    url: url.trim(),
  };

  db.stories.unshift(newStory);
  saveDatabase(db);
  res.status(201).json(newStory);
});

app.delete('/api/stories/:index', (req: Request, res: Response) => {
  const idx = Number(req.params.index);
  if (isNaN(idx) || idx < 0 || idx >= db.stories.length) {
    res.status(400).json({ error: 'Invalid story index' });
    return;
  }
  db.stories.splice(idx, 1);
  saveDatabase(db);
  res.json({ success: true, stories: db.stories });
});

// ---- REVIEWS ----
app.get('/api/reviews', (_req: Request, res: Response) => {
  res.json(db.reviews);
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const { n, pl = 'Verified Customer', r = 5, t, img } = req.body;
  if (!n || !t) {
    res.status(400).json({ error: 'Reviewer name and review text are required' });
    return;
  }

  const newReview: Review = {
    n: n.trim(),
    pl: pl.trim(),
    r: Number(r) || 5,
    t: t.trim(),
    img,
  };

  db.reviews.unshift(newReview);
  saveDatabase(db);
  res.status(201).json(newReview);
});

app.delete('/api/reviews/:index', (req: Request, res: Response) => {
  const idx = Number(req.params.index);
  if (isNaN(idx) || idx < 0 || idx >= db.reviews.length) {
    res.status(400).json({ error: 'Invalid review index' });
    return;
  }
  db.reviews.splice(idx, 1);
  saveDatabase(db);
  res.json({ success: true, reviews: db.reviews });
});

// ---- STORE SETTINGS ----
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(db.config);
});

app.put('/api/settings', (req: Request, res: Response) => {
  db.config = { ...db.config, ...req.body };
  saveDatabase(db);
  res.json(db.config);
});

// ======================== SERVER & VITE INTEGRATION ========================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🌿 Shae.made backend API and storefront running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
