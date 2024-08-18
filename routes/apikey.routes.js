const express = require('express');
const apikeyController = require('./controller');
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
router.post('/add-api-key', apikeyController.addApiKey);
router.post('/add-premium-api-key', apikeyController.addPremiumApiKey);
router.post('/remove-api-key', apikeyController.removeApiKey);
router.post('/check-api-key', apikeyController.checkApiKey);
router.post('/check-limit', apikeyController.checkLimit);

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
