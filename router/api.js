const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Connect to MongoDB
mongoose.connect('mongodb+srv://otsuka:BocahGila@cluster0.ilka0bz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

// Define the API key model
const apiKeyModel = mongoose.model('ApiKey', {
  key: String,
  type: String, // free or premium
  limit: Number,
  remaining: Number,
  createdAt: Date
});

// Define the API key limits
const freeLimit = 100;
const premiumLimit = 1000;

// Add API key (free)
router.post('/addapikey', async (req, res) => {
  const key = req.body.key;
  if (!key) {
    return res.status(400).json({ error: 'Key is required' });
  }
  const existingKey = await apiKeyModel.findOne({ key });
  if (existingKey) {
    return res.status(400).json({ error: 'Key already exists' });
  }
  const newKey = new apiKeyModel({ key, type: 'free', limit: freeLimit, remaining: freeLimit });
  await newKey.save();
  res.json({ message: 'API key added successfully' });
});

// Add premium API key
router.post('/addpremiumapikey', async (req, res) => {
  const key = req.body.key;
  if (!key) {
    return res.status(400).json({ error: 'Key is required' });
  }
  const existingKey = await apiKeyModel.findOne({ key });
  if (!existingKey) {
    return res.status(404).json({ error: 'Key not found' });
  }
  existingKey.type = 'premium';
  existingKey.limit = premiumLimit;
  existingKey.remaining = premiumLimit;
  await existingKey.save();
  res.json({ message: 'API key upgraded to premium successfully' });
});

// Remove API key
router.delete('/removekey', async (req, res) => {
  const key = req.body.key;
  if (!key) {
    return res.status(400).json({ error: 'Key is required' });
  }
  await apiKeyModel.findOneAndRemove({ key });
  res.json({ message: 'API key removed successfully' });
});

// Check API key
router.get('/checkapikey', async (req, res) => {
  const key = req.query.key;
  if (!key) {
    return res.status(400).json({ error: 'Key is required' });
  }
  const apiKey = await apiKeyModel.findOne({ key });
  if (!apiKey) {
    return res.status(404).json({ error: 'Key not found' });
  }
  res.json({ type: apiKey.type, remaining: apiKey.remaining });
});

// Check limit
router.get('/checklimit', async (req, res) => {
  const key = req.query.key;
  if (!key) {
    return res.status(400).json({ error: 'Key is required' });
  }
  const apiKey = await apiKeyModel.findOne({ key });
  if (!apiKey) {
    return res.status(404).json({ error: 'Key not found' });
  }
  res.json({ remaining: apiKey.remaining });
});

// Reset limit every hour
setInterval(async () => {
  const apiKeys = await apiKeyModel.find();
  apiKeys.forEach((apiKey) => {
    apiKey.remaining = apiKey.limit;
    apiKey.save();
  });
}, 3600000); // 1 hour

// Middleware to check API key and limit
router.use(async (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!key) {
    return res.status(401).json({ error: 'API key is required' });
  }
  const apiKey = await apiKeyModel.findOne({ key });
  if (!apiKey) {
    return res.status(404).json({ error: 'API key not found' });
  }
  if (apiKey.remaining <= 0) {
    return res.status(429).json({ error: 'API key limit exceeded' });
  }
  apiKey.remaining--;
  await apiKey.save();
  next();
});

// Example API endpoint
router.get('/example', (req, res) => {
  res.json({ message: 'Hello World!' });
});

module.exports = router;
