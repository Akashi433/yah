const ApiKey = require('../models/apikey.model');

exports.addApiKey = async (req, res) => {
  const { key } = req.body;
  const existingKey = await ApiKey.findOne({ key });
  if (existingKey) {
    return res.status(400).send({ message: 'API Key sudah ada' });
  }
  const newKey = new ApiKey({ key, type: 'free', limit: 100 }); // limit default untuk free
  await newKey.save();
  res.send({ message: 'API Key berhasil ditambahkan' });
};

exports.addPremiumApiKey = async (req, res) => {
  const { key } = req.body;
  const existingKey = await ApiKey.findOne({ key });
  if (!existingKey) {
    return res.status(400).send({ message: 'API Key tidak ada' });
  }
  existingKey.type = 'premium';
  existingKey.limit = 1000; // limit default untuk premium
  await existingKey.save();
  res.send({ message: 'API Key berhasil diupgrade ke premium' });
};

exports.removeApiKey = async (req, res) => {
  const { key } = req.body;
  await ApiKey.findOneAndRemove({ key });
  res.send({ message: 'API Key berhasil dihapus' });
};

exports.checkApiKey = async (req, res) => {
  const { key } = req.body;
  const existingKey = await ApiKey.findOne({ key });
  if (!existingKey) {
    return res.status(401).send({ message: 'API Key tidak valid' });
  }
  res.send({ message: 'API Key valid' });
};

exports.checkLimit = async (req, res) => {
  const { key } = req.body;
  const existingKey = await ApiKey.findOne({ key });
  if (!existingKey) {
    return res.status(401).send({ message: 'API Key tidak valid' });
  }
  const limit = existingKey.limit;
  if (limit <= 0) {
    return res.status(429).send({ message: 'Limit API Key telah habis' });
  }
  existingKey.limit -= 1;
  await existingKey.save();
  res.send({ message: 'Limit API Key masih ada' });
};

exports.resetLimit = async () => {
  await ApiKey.updateMany({}, { $set: { limit: 100 } }); // reset limit untuk free
  await ApiKey.updateMany({ type: 'premium' }, { $set: { limit: 1000 } }); // reset limit untuk premium
};