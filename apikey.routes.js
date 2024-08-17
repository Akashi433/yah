const express = require('express');
const ApiKey = require('./apikey.model');
const router = express.Router();

// Menambahkan API Key
router.post('/addapikey', async (req, res) => {
    const apikey = new ApiKey({ key: req.body.key });
    await apikey.save();
    res.status(201).json({ message: 'API Key added', apikey });
});

// Menghapus API Key
router.delete('/removekey/:key', async (req, res) => {
    await ApiKey.deleteOne({ key: req.params.key });
    res.status(200).json({ message: 'API Key removed' });
});

// Memeriksa API Key
router.get('/checkapikey/:key', async (req, res) => {
    const apikey = await ApiKey.findOne({ key: req.params.key });
    if (apikey) {
        res.status(200).json(apikey);
    } else {
        res.status(404).json({ message: 'API Key not found' });
    }
});

// Menambahkan Premium API Key
router.post('/addpremiumapikey/:key', async (req, res) => {
    const apikey = await ApiKey.findOne({ key: req.params.key });
    if (apikey) {
        apikey.type = 'premium';
        apikey.limit = 1000; // Misal limit premium 1000
        await apikey.save();
        res.status(200).json({ message: 'API Key upgraded to premium', apikey });
    } else {
        res.status(404).json({ message: 'API Key not found' });
    }
});

// Memeriksa Limit
router.get('/checklimit/:key', async (req, res) => {
    const apikey = await ApiKey.findOne({ key: req.params.key });
    if (apikey) {
        res.status(200).json({ limit: apikey.limit, requestCount: apikey.requestCount });
    } else {
        res.status(404).json({ message: 'API Key not found' });
    }
});

// Reset Limit Setiap Jam
setInterval(async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    await ApiKey.updateMany(
        { lastReset: { $lt: oneHourAgo } },
        { requestCount: 0, lastReset: now }
    );
}, 60 * 60 * 1000); // Setiap jam

module.exports = router;
