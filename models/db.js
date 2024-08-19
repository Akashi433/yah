const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    isPremium: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0 },
    limit: { type: Number, default: 100 }, // limit untuk free
    lastReset: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ApiKey', apiKeySchema);
