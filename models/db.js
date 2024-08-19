const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  isPremium: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
  limit: { type: Number, default: 100 }, // default limit untuk free
  createdAt: { type: Date, default: Date.now },
});

const ApiKey = mongoose.model('ApiKey', apiKeySchema);
module.exports = ApiKey;