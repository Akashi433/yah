const mongoose = require('mongoose');

const apikeySchema = new mongoose.Schema({
  key: String,
  type: String, // free atau premium
  limit: Number,
  createdAt: Date,
  updatedAt: Date
});

const ApiKey = mongoose.model('ApiKey', apikeySchema);

module.exports = ApiKey;