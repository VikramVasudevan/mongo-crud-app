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
    .route('/api/patch/:transactionalDataEntityName')
    .patch(controller.api.patchData);

/* Web End points for HTML rendering */
router
    .route('/web/view/')
    .get(controller.web.get);

router
    .route('/web/view/:transactionalDataEntityName')
    .get(controller.web.get);

module.exports = router;
