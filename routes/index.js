const express = require('express');
const homeDepot = require('./homeDepot.js');
const samsClub = require('./samsClub.js');
const zoro = require('./zoro.js');
const walmart = require('./walmart.js');

const rootRouter = express.Router();

rootRouter.use('/homeDepot', homeDepot);
rootRouter.use('/samsClub', samsClub);
rootRouter.use('/zoro', zoro);
rootRouter.use('/walmart', walmart);

module.exports = rootRouter;
