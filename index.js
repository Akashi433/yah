const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const apikeyRoute = require('./api/apikey.route');

app.use(express.json());
app.use('/api', apikeyRoute);

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use('/api', apikeyRoutes);

// reset limit setiap jam
setInterval(() => {
  apikeyController.resetLimit();
}, 3600000); // 1 jam

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});