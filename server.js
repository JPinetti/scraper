const dotenv = require('dotenv');
const express = require('express');
const router = require('./routes');

const app = express();
const port = process.env.PORT || 8080;

dotenv.config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(router);
app.use(express.static('public'));

app.get('/', (_, res) => {
  res.send('Hello Scraper');
});

app.listen(port, () => {
  console.log(`App listening at ${port} port`);
});

module.exports = app;
