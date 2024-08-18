const express = require('express');
const ApiKey = require('./apikey.model');
const router = express.Router();

var creatorList = ['Mamms']; // Nama Lu Ngab
var creator = creatorList[Math.floor(Math.random() * creatorList.length)]; // Ini jan diubah


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
