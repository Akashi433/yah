const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    type: { type: String, enum: ['free', 'premium'], default: 'free' },
    limit: { type: Number, default: 100 }, // Misal limit free 100
    requestCount: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ApiKey', ApiKeySchema);