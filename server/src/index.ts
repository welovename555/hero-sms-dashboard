import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { HeroSmsClient } from './heroSms/client.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

const getClient = (req: express.Request) => {
  const sessionKey = req.cookies.hero_api_key;
  const apiKey = sessionKey || process.env.HERO_SMS_API_KEY;
  if (!apiKey) throw new Error('API Key not found. Please set it in Settings.');
  return new HeroSmsClient(apiKey);
};

app.post('/api/session/key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'API Key is required' });
  res.cookie('hero_api_key', apiKey, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'API Key saved to session' });
});

app.delete('/api/session/key', (req, res) => {
  res.clearCookie('hero_api_key');
  res.json({ message: 'API Key cleared' });
});

app.get('/api/session/check', (req, res) => {
  const hasKey = !!(req.cookies.hero_api_key || process.env.HERO_SMS_API_KEY);
  res.json({ authenticated: hasKey });
});

app.get('/api/balance', async (req, res) => {
  try {
    const client = getClient(req);
    const balance = await client.getBalance();
    res.json({ balance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/prices', async (req, res) => {
  try {
    const { country, service } = req.query;
    const client = getClient(req);
    const prices = await client.getPrices(country ? Number(country) : undefined, service as string);
    res.json(prices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders/buy', async (req, res) => {
  try {
    const { country, service, operator } = req.body;
    if (!country || !service) return res.status(400).json({ error: 'Country and Service are required' });
    const client = getClient(req);
    const order = await client.getNumber(service, Number(country), operator);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const client = getClient(req);
    const orders = await client.getActiveActivations();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:id/status', async (req, res) => {
  try {
    const client = getClient(req);
    const status = await client.getStatus(req.params.id);
    res.json({ status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders/:id/action', async (req, res) => {
  try {
    const { status } = req.body;
    const client = getClient(req);
    const result = await client.setStatus(req.params.id, Number(status));
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
