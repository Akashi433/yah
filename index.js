const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const apiRouter = require('./router/api');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://otsuka:BocahGila@cluster0.ilka0bz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use('/api', apiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});