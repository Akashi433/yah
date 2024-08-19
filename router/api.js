const express = require('express');
const router = express.Router();
const ApiKey = require('../models/db.js');

// Middleware untuk reset limit setiap jam
setInterval(async () => {
    const apiKeys = await ApiKey.find({});
    const now = new Date();

    for (const key of apiKeys) {
        if (now - key.lastReset >= 3600000) { // 1 jam
            key.requestsMade = 0;
            key.lastReset = now;
            await key.save();
        }
    }
}, 60000); // Cek setiap menit

// Tambah API key
router.post('/addapikey', async (req, res) => {
    const newKey = new ApiKey({ key: req.body.key });
    await newKey.save();
    res.json({ message: 'API key added', key: newKey });
});

// Hapus API key
router.delete('/removekey/:key', async (req, res) => {
    await ApiKey.deleteOne({ key: req.params.key });
    res.json({ message: 'API key removed' });
});

// Cek API key
router.get('/checkapikey/:key', async (req, res) => {
    const apiKey = await ApiKey.findOne({ key: req.params.key });
    res.json(apiKey ? { valid: true, apiKey } : { valid: false });
});

// Tambah premium API key
router.post('/addpremiumapikey/:key', async (req, res) => {
    const apiKey = await ApiKey.findOne({ key: req.params.key });
    if (apiKey) {
        apiKey.isPremium = true;
        apiKey.limit = 1000; // Limit untuk premium
        await apiKey.save();
        res.json({ message: 'API key upgraded to premium', apiKey });
    } else {
        res.status(404).json({ message: 'API key not found' });
    }
});

// Cek limit
router.get('/checklimit/:key', async (req, res) => {
    const apiKey = await ApiKey.findOne({ key: req.params.key });
    if (apiKey) {
        res.json({ limit: apiKey.limit, requestsMade: apiKey.requestsMade });
    } else {
        res.status(404).json({ message: 'API key not found' });
    }
});

// Reset limit
router.post('/resetlimit/:key', async (req, res) => {
    const apiKey = await ApiKey.findOne({ key: req.params.key });
    if (apiKey) {
        apiKey.requestsMade = 0;
        await apiKey.save();
        res.json({ message: 'Limit reset', apiKey });
    } else {
        res.status(404).json({ message: 'API key not found' });
    }
});

// Middleware untuk mengurangi limit setiap request
const checkAndReduceLimit = async (req, res, next) => {
    const apiKey = await ApiKey.findOne({ key: req.headers['x-api-key'] });
    if (apiKey) {
        if (apiKey.requestsMade < apiKey.limit) {
            apiKey.requestsMade += 1;
            await apiKey.save();
            next();
        } else {
            res.status(429).json({ message: 'Limit exceeded' });
        }
    } else {
        res.status(404).json({ message: 'API key not found' });
    }
};

// Contoh route yang dilindungi
router.get('/protected', checkAndReduceLimit, (req, res) => {
    res.json({ message: 'This is a protected route' });
});

router.get('/infonpm', async (req, res, next) => {
    const apikeyInput = req.query.apikey;
    const query = req.query.query;
    if (!apikeyInput) return res.json({ status: false, message: "API Key tidak ada" });
    
    const apiKey = await ApiKey.findOne({ key: apikeyInput });
    if (!apiKey) return res.json({ status: false, message: "API Key tidak valid" });
    if (!query) return res.json({ status: false, message: "Masukan parameter query" });
    
    // Fetch data dari NPM registry
    fetch(encodeURI(`https://registry.npmjs.org/${query}`))
        .then(response => response.json())
        .then(data => {
            res.json({ status: 200, result: data });
        })
        .catch(e => {
            res.json({ status: false, message: "Error fetching data" });
        });
});

module.exports = router;
