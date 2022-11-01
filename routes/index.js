const express = require('express');
const mainRouter = express.Router();
const masterDataRouter = require('./masterData');
const txDataRouter = require('./txData');
const reportsRouter = require('./reports');
var cors = require('cors');

mainRouter.use(
  cors({
    allowedOrigins: ['*'],
  }),
);

mainRouter.use('/masterData', masterDataRouter);
mainRouter.use('/txData', txDataRouter);
mainRouter.use('/reports', reportsRouter);

module.exports = mainRouter;