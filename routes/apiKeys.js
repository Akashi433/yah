const express = require('express');
const router = express.Router();
const ApiKey = require('../models/ApiKeys');

// Add API Key
router.post('/addapikey', async (req, res) => {
    const { key } = req.body;
    const newApiKey = new ApiKey({ key });
    await newApiKey.save();
    res.status(201).send('API Key added successfully');
});

// Remove API Key
router.delete('/removekey/:key', async (req, res) => {
    await ApiKey.deleteOne({ key: req.params.key });
    res.send('API Key removed successfully');
});

// Check API Key
router.get('/checkapikey/:key', async (req, res) => {
    const apiKey = await ApiKey.findOne({ key: req.params.key });
    if (apiKey) {
        res.send(apiKey);
    } else {
        res.status(404).send('API Key not found');
    }
});

// Add Premium API Key
router.post('/addpremiumapikey/:key', async (req, res) => {
    const apiKey = await ApiKey.findOne({ key: req.params.key });
    if (apiKey) {
        apiKey.isPremium = true;
        apiKey.limit = 500; // premium limit
        await apiKey.save();
        res.send('API Key upgraded to Premium');
    } else {
        res.status(404).send('API Key not found');
    }
});

// Check Limit
router.get('/checklimit/:key', async (req, res) => {
    const apiKey = await ApiKey.findOne({ key: req.params.key });
    if (apiKey) {
        res.send({ limit: apiKey.limit, requestCount: apiKey.requestCount });
    } else {
        res.status(404).send('API Key not found');
    }
});

// Reset Limit
router.post('/resetlimit/:key', async (req, res) => {
    const apiKey = await ApiKey.findOne({ key: req.params.key });
    if (apiKey) {
        apiKey.requestCount = 0;
        await apiKey.save();
        res.send('Limit reset successfully');
    } else {
        res.status(404).send('API Key not found');
    }
});

// Middleware to check API Key usage
router.use(async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const foundKey = await ApiKey.findOne({ key: apiKey });
    if (foundKey) {
        if (foundKey.requestCount < foundKey.limit) {
            foundKey.requestCount += 1;
            await foundKey.save();
            next();
        } else {
            res.status(429).send('Limit exceeded');
        }
    } else {
        res.status(401).send('Invalid API Key');
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
            res.json({ status: 200, result: data });
        })
        .catch(e => {
            res.json({ status: false, message: "Error fetching data" });
        });
});

module.exports = router;
