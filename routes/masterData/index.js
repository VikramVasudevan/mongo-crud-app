const express = require('express');
const masterDataController = require('./controller');
const masterDataRouter = express.Router();
var cors = require('cors');

masterDataRouter.use(
    cors({
        allowedOrigins: ['*'],
    }),
);

/* API End Points */
masterDataRouter
    .route('/api/view/')
    .get(masterDataController.api.getMasterDataEntityList);

masterDataRouter
    .route('/api/downloadTemplate/:masterDataEntityName')
    .get(masterDataController.api.downloadTemplate);

masterDataRouter
    .route('/api/get/:masterDataEntityName')
    .get(masterDataController.api.getData);

masterDataRouter
    .route('/api/upload/:masterDataEntityName')
    .post(masterDataController.api.processFile);

masterDataRouter
    .route('/api/delete/:masterDataEntityName')
    .delete(masterDataController.api.deleteData);

masterDataRouter
    .route('/api/post/:masterDataEntityName')
    .post(masterDataController.api.postData);

masterDataRouter
    .route('/api/patch/:masterDataEntityName')
    .patch(masterDataController.api.patchData);

/* Web End points for HTML rendering */
masterDataRouter
    .route('/web/view/')
    .get(masterDataController.web.getMasterDataEntityList);

masterDataRouter
    .route('/web/view/:masterDataEntityName')
    .get(masterDataController.web.getData);

masterDataRouter
    .route('/web/upload/:masterDataEntityName')
    .post(masterDataController.web.processFile);

module.exports = masterDataRouter;
