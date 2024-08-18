const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const apiKeys = require('./routes/apiKeys');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://otsuka:BocahGila@cluster0.ilka0bz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use(bodyParser.json());
app.use('/api', apiKeys);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});