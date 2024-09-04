const express = require('express');
const ApiKey = require('../models/db');
const chatgpt = require('../scraper/gpt4');
const router = express.Router();

creator = "MATz"

loghandler = {
    notparam: {
        status: false,
        creator: `${creator}`,
        code: 406,
        message: 'Masukan parameter apikey!'
    },
    notnama: {
        status: false,
        creator: `${creator}`,
        code: 406,
        message: 'Masukan parameter nama'
    },
    notimg: {
        status: false,
        creator: `${creator}`,
        code: 406,
        message: 'Masukan parameter img'
    },
    notemoji: {
        status: false,
        creator: `${creator}`,
        code: 406,
        message: 'Masukan parameter emoji'
    },
    notangka: {
        status: false,
        creator: `${creator}`,
        code: 406,
        message: 'Masukan parameter angka'
    },
    notnomor: {
        status: false,
        creator: `${creator}`,
        code: 406,
        message: 'Masukan parameter nomor'
    },
    notjumlah: {
        status: false,
        creator: `${creator}`,
        code: 406,
        message: 'Masukan parameter jumlah'
    },
    notkey: {
        status: false,
        creator: `${creator}`,
        code: 406,
        message: 'Masukan parameter key'
     },
    invalidKey: {
        status: false,
        creator: `${creator}`,
        code: 406,
        message: `Apikey tidak ditemukan! Silahkan kontak Owner untuk dapatkan Apikey wa.me/62895337278647`
    },
    invalidtext: {
            status: false,
        creator: `${creator}`,
        message: 'Teks tidak valid'
    },
    notAddApiKey: {
        status: false,
        creator: `${creator}`,
        code: 406,
        message: 'Masukan parameter status, apikeyInput, email, nomorhp, name, age, country, exp'
    },
    noturl: {
        status: false,
        creator: `${creator}`,
        code: 406,
        message: 'Masukan parameter Url'
    },
    notprompt: {
        status: false,
        creator: `${creator}`,
        code: 406,
        message: 'Masukan parameter Url'
    },
notmessage: {
        status: false,
        creator: `${creator}`,
        code: 406,
        message: 'Masukan parameter messages'
    },
    notquery: {
        status: false,
        creator: `${creator}`,
        code: 406,
        message: 'Masukan parameter Query'
    },
    error: {
        status: false,
        creator: `${creator}`,
        message: 'Erorr! Mungkin Sedang dalam perbaikan'
    }
}

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

// Reset Limit setiap hari
setInterval(async () => {
    const currentTime = new Date();
    const apiKeys = await ApiKey.find();
    apiKeys.forEach(async (apiKey) => {
        const daysPassed = Math.floor((currentTime - apiKey.lastReset) / (1000 * 60 * 60 * 24));
        if (daysPassed >= 1) { // reset setiap hari
            apiKey.usageCount = 0;
            apiKey.lastReset = currentTime;
            await apiKey.save();
        }
    });
}, 86400000); // 1 hari dalam milidetik

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

// API

router.get('/ai/gpt', async (req, res, next) => {
    const apikeyInput = req.query.apikey;
    const messages = req.query.messages; // Query parameter pertama
    const prompt = req.query.prompt; // Query parameter kedua

    // Validasi API key
    if (!apikeyInput) return res.json({ status: false, message: "API Key tidak ada" });

    const apiKey = await ApiKey.findOne({ key: apikeyInput });
    if (!apiKey) return res.json({ status: false, message: "API Key tidak valid" });

    // Validasi prompt dan messages
    if (!messages) return res.json({ status: false, message: "Masukan parameter messages" });
    if (!prompt) return res.json({ status: false, message: "Masukan parameter prompt" });

    // Panggil fungsi gpt dengan kedua parameter
    chatgpt(messages, prompt)
        .then(data => {
            if (!data) return res.json(loghandler.notprompt);
            res.json({
                status: 200,
                result: data 
            });
        })
        .catch(e => {
            res.json({ status: false, message: "gagal mengambil data" });
        });
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
