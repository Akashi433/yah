const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    isPremium: { type: Boolean, default: false },
    limit: { type: Number, default: 100 }, // Limit untuk free
    requestsMade: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ApiKey', apiKeySchema);