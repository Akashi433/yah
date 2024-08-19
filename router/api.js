const express = require('express');
const ApiKey = require('../models/db');
const router = express.Router();

// Add API Key
router.post('/addapikey', async (req, res) => {
    const { key } = req.body;
    const newApiKey = new ApiKey({ key });
    await newApiKey.save();
    res.status(201).json({ message: 'API Key added', key });
});

// Remove API Key
router.delete('/removekey/:key', async (req, res) => {
    const { key } = req.params;
    await ApiKey.deleteOne({ key });
    res.status(200).json({ message: 'API Key removed', key });
});

// Check API Key
router.get('/checkapikey/:key', async (req, res) => {
    const { key } = req.params;
    const apiKey = await ApiKey.findOne({ key });
    res.status(200).json(apiKey ? { valid: true } : { valid: false });
});

// Add Premium API Key
router.post('/addpremiumapikey/:key', async (req, res) => {
    const { key } = req.params;
    await ApiKey.updateOne({ key }, { isPremium: true, limit: 500 }); // limit untuk premium
    res.status(200).json({ message: 'API Key upgraded to premium', key });
});

// Check Limit
router.get('/checklimit/:key', async (req, res) => {
    const { key } = req.params;
    const apiKey = await ApiKey.findOne({ key });
    const currentLimit = apiKey ? apiKey.limit - apiKey.usageCount : null;
    res.status(200).json({ limit: currentLimit });
});

// Reset Limit setiap jam
setInterval(async () => {
    const currentTime = new Date();
    const apiKeys = await ApiKey.find();
    apiKeys.forEach(async (apiKey) => {
        const hoursPassed = Math.floor((currentTime - apiKey.lastReset) / (1000 * 60 * 60));
        if (hoursPassed >= 1) { // reset setiap jam
            apiKey.usageCount = 0;
            apiKey.lastReset = currentTime;
            await apiKey.save();
        }
    });
}, 3600000); // 1 jam dalam milidetik

// Middleware untuk mengurangi limit setiap kali API Key digunakan
router.use(async (req, res, next) => {
    const apiKey = req.query.apikey; // Ambil dari query parameter
    const apiKeyRecord = await ApiKey.findOne({ key: apiKey });
    if (apiKeyRecord) {
        if (apiKeyRecord.usageCount < apiKeyRecord.limit) {
            apiKeyRecord.usageCount += 1;
            await apiKeyRecord.save();
            next();
        } else {
            res.status(429).json({ message: 'Limit exceeded' });
        }
    } else {
        res.status(404).json({ message: 'API Key not found' });
    }
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
            res.json({ 
            status: 200, 
            result: data 
            });
        })
        .catch(e => {
            res.json({ status: false, message: "Error fetching data" });
        });
});

module.exports = router;
