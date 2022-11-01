const express = require('express');
const controller = require('./controller');
const router = express.Router();
var cors = require('cors');

router.use(
    cors({
        allowedOrigins: ['*'],
    }),
);

/* API End Points */
router
    .route('/api/download/:reportName')
    .get(controller.api.downloadData);

/* Web End points for HTML rendering */
router
    .route('/web/view')
    .get(controller.web.getData);

router
    .route('/web/view/:reportName')
    .get(controller.web.getData);


module.exports = router;
