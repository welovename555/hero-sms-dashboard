"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const client_1 = require("./heroSms/client");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);
// Helper to get API client
const getClient = (req) => {
    const sessionKey = req.cookies.hero_api_key;
    const apiKey = sessionKey || process.env.HERO_SMS_API_KEY;
    if (!apiKey)
        throw new Error('API Key not found. Please set it in Settings.');
    return new client_1.HeroSmsClient(apiKey);
};
// Auth/Session Routes
app.post('/api/session/key', (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey)
        return res.status(400).json({ error: 'API Key is required' });
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
// Hero-SMS Proxy Routes
app.get('/api/balance', async (req, res) => {
    try {
        const client = getClient(req);
        const balance = await client.getBalance();
        res.json({ balance });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/prices', async (req, res) => {
    try {
        const { country, service } = req.query;
        const client = getClient(req);
        const prices = await client.getPrices(country ? Number(country) : undefined, service);
        res.json(prices);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/orders/buy', async (req, res) => {
    try {
        const { country, service, operator } = req.body;
        if (!country || !service)
            return res.status(400).json({ error: 'Country and Service are required' });
        const client = getClient(req);
        const order = await client.getNumber(service, Number(country), operator);
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/orders', async (req, res) => {
    try {
        const client = getClient(req);
        const orders = await client.getActiveActivations();
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/orders/:id/status', async (req, res) => {
    try {
        const client = getClient(req);
        const status = await client.getStatus(req.params.id);
        res.json({ status });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/orders/:id/action', async (req, res) => {
    try {
        const { status } = req.body;
        const client = getClient(req);
        const result = await client.setStatus(req.params.id, Number(status));
        res.json({ result });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map