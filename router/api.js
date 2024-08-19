const express = require('express');
const router = express.Router();
const ApiKey = require('../models/db');

// Middleware untuk mengecek API Key
const checkApiKey = async (req, res, next) => {
  const apiKey = req.headers['apikey'];
  const keyData = await ApiKey.findOne({ key: apiKey });

  if (!keyData) {
    return res.status(403).send("API Key tidak valid");
  }

  if (keyData.usageCount >= keyData.limit) {
    return res.status(403).send("Limit penggunaan API Key telah tercapai");
  }

  keyData.usageCount += 1; // mengurangi limit
  await keyData.save();
  next();
};

// Tambah API Key
router.post('/addapikey', async (req, res) => {
  const newKey = new ApiKey({ key: req.body.key });
  await newKey.save();
  res.send("API Key berhasil ditambahkan");
});

// Hapus API Key
router.delete('/removekey/:key', async (req, res) => {
  await ApiKey.deleteOne({ key: req.params.key });
  res.send("API Key berhasil dihapus");
});

// Cek API Key
router.get('/checkapikey/:key', async (req, res) => {
  const keyData = await ApiKey.findOne({ key: req.params.key });
  res.send(keyData);
});

// Tambah API Key Premium
router.post('/addpremiumapikey/:key', async (req, res) => {
  const keyData = await ApiKey.findOne({ key: req.params.key });
  keyData.isPremium = true;
  keyData.limit = 1000; // limit untuk premium
  await keyData.save();
  res.send("API Key diupgrade menjadi premium");
});

// Cek Limit
router.get('/checklimit/:key', async (req, res) => {
  const keyData = await ApiKey.findOne({ key: req.params.key });
  res.send({ usageCount: keyData.usageCount, limit: keyData.limit });
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

// Reset Limit Setiap Jam
setInterval(async () => {
  const keys = await ApiKey.find();
  keys.forEach(async (key) => {
    key.usageCount = 0;
    await key.save();
  });
}, 60 * 60 * 1000); // setiap jam

module.exports = router;