const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    isPremium: { type: Boolean, default: false },
    requestCount: { type: Number, default: 0 },
    limit: { type: Number, default: 100 }, // default limit for free
    createdAt: { type: Date, default: Date.now }
});