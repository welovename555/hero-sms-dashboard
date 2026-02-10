import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HeroSmsClient } from './heroSms/client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '../../config.json');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Helper to manage config
const loadConfig = () => {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    } catch (e) {
      return {};
    }
  }
  return {};
};

const saveConfig = (config: any) => {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
};

const getClient = (req: express.Request) => {
  const config = loadConfig();
  const apiKey = req.cookies.hero_api_key || config.api_key || process.env.HERO_SMS_API_KEY;
  if (!apiKey) throw new Error('กรุณาตั้งค่า API Key ในหน้า Settings');
  return new HeroSmsClient(apiKey);
};

// API Routes
app.get('/api/config', (req, res) => {
  const config = loadConfig();
  res.json({ hasKey: !!config.api_key });
});

app.post('/api/session/key', (req, res) => {
  const { apiKey, persist } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'API Key is required' });
  
  if (persist) {
    const config = loadConfig();
    config.api_key = apiKey;
    saveConfig(config);
  }
  
  res.cookie('hero_api_key', apiKey, { 
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true 
  });
  res.json({ message: 'บันทึก API Key เรียบร้อยแล้ว' });
});

app.delete('/api/session/key', (req, res) => {
  const { clearPersist } = req.query;
  if (clearPersist === 'true') {
    const config = loadConfig();
    delete config.api_key;
    saveConfig(config);
  }
  res.clearCookie('hero_api_key');
  res.json({ message: 'ล้างข้อมูลเรียบร้อยแล้ว' });
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

app.get('/api/services', async (req, res) => {
  try {
    const { country } = req.query;
    const client = getClient(req);
    const services = await client.getServices(country ? Number(country) : undefined);
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/countries', async (req, res) => {
  try {
    const client = getClient(req);
    const countries = await client.getCountries();
    res.json(countries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/prices/top', async (req, res) => {
  try {
    const { service } = req.query;
    if (!service) return res.status(400).json({ error: 'Service is required' });
    const client = getClient(req);
    const data = await client.getTopCountries(service as string);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders/buy', async (req, res) => {
  try {
    const { country, service } = req.body;
    const client = getClient(req);
    const order = await client.getNumber(service, Number(country));
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/active', async (req, res) => {
  try {
    const client = getClient(req);
    const data = await client.getActiveActivations();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:id/status', async (req, res) => {
  try {
    const client = getClient(req);
    const status = await client.getStatus(req.params.id);
    res.json(status);
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
