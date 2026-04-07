import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Dados em memória (para teste local)
// Em produção, isso seria um banco de dados
const dataStore: Record<string, any> = {
  stores: [],
  categories: [],
  entries: [],
  debts: [],
};

// ==================== APIs REST ====================

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== STORES ====================
app.get('/api/stores', (_req: Request, res: Response) => {
  res.json(dataStore.stores);
});

app.post('/api/stores', (req: Request, res: Response) => {
  const { id, storeName, cnpj } = req.body;
  const store = { id, storeName, cnpj, createdAt: new Date().toISOString() };
  dataStore.stores.push(store);
  res.json(store);
});

// ==================== CATEGORIES ====================
app.get('/api/categories/:storeId', (req: Request, res: Response) => {
  const { storeId } = req.params;
  const categories = dataStore.categories.filter((c: any) => c.storeId === storeId);
  res.json(categories);
});

app.post('/api/categories', (req: Request, res: Response) => {
  const { id, storeId, name, operation, order } = req.body;
  const category = { id, storeId, name, operation, order, createdAt: new Date().toISOString() };
  dataStore.categories.push(category);
  res.json(category);
});

app.put('/api/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, operation, order } = req.body;
  const index = dataStore.categories.findIndex((c: any) => c.id === id);
  if (index !== -1) {
    dataStore.categories[index] = { ...dataStore.categories[index], name, operation, order, updatedAt: new Date().toISOString() };
    res.json(dataStore.categories[index]);
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

app.delete('/api/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  dataStore.categories = dataStore.categories.filter((c: any) => c.id !== id);
  res.json({ success: true });
});

// ==================== ENTRIES ====================
app.get('/api/entries/:storeId/:year/:month', (req: Request, res: Response) => {
  const { storeId, year, month } = req.params;
  const monthStr = String(month).padStart(2, '0');
  const datePrefix = `${year}-${monthStr}`;
  const entries = dataStore.entries.filter((e: any) => 
    e.storeId === storeId && e.date.startsWith(datePrefix)
  );
  res.json(entries);
});

app.post('/api/entries', (req: Request, res: Response) => {
  const { id, storeId, date, values } = req.body;
  const entry = { id, storeId, date, values, createdAt: new Date().toISOString() };
  dataStore.entries.push(entry);
  res.json(entry);
});

app.put('/api/entries/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { values } = req.body;
  const index = dataStore.entries.findIndex((e: any) => e.id === id);
  if (index !== -1) {
    dataStore.entries[index] = { ...dataStore.entries[index], values, updatedAt: new Date().toISOString() };
    res.json(dataStore.entries[index]);
  } else {
    res.status(404).json({ error: 'Entry not found' });
  }
});

// ==================== DEBTS ====================
app.get('/api/debts', (_req: Request, res: Response) => {
  res.json(dataStore.debts);
});

app.post('/api/debts', (req: Request, res: Response) => {
  const { id, personName, description, amount, date } = req.body;
  const debt = { id, personName, description, amount, date, paid: false, createdAt: new Date().toISOString() };
  dataStore.debts.push(debt);
  res.json(debt);
});

app.put('/api/debts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { paid, paidDate, paidAmount } = req.body;
  const index = dataStore.debts.findIndex((d: any) => d.id === id);
  if (index !== -1) {
    dataStore.debts[index] = { ...dataStore.debts[index], paid, paidDate, paidAmount, updatedAt: new Date().toISOString() };
    res.json(dataStore.debts[index]);
  } else {
    res.status(404).json({ error: 'Debt not found' });
  }
});

app.delete('/api/debts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  dataStore.debts = dataStore.debts.filter((d: any) => d.id !== id);
  res.json({ success: true });
});

// ==================== STATIC FILES ====================
// Serve static files from dist/client in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist', 'client');
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
  console.log(`[Server] API available at http://0.0.0.0:${PORT}/api`);
});
