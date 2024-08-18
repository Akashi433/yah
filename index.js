const express = require('express');
const app = express();
const apiRouter = require('./router/api');

app.use('/api', apiRouter);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
