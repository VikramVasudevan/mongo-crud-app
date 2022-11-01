const service = require('./service');
const metadata = require('./metadata');
const mongoose = require('mongoose');
const fileProcessor = require("./file-processor");

module.exports = {
    api: {
        getFilterFromReq: (req) => {
            return service.getFilterFromReq(req);
        },
        getData: async (req, res) => {
            const masterDataEntityName = req.params.masterDataEntityName;
            const filter = module.exports.api.getFilterFromReq(req);
            const data = await service.getData(masterDataEntityName, filter);
            let columns = metadata[masterDataEntityName];
            if (!columns && data.length > 0) {
                columns = Object.keys(data[0]);
            }
            if (!columns) columns = [];

            return { columns, data, masterDataEntityName };
        },
        processFile: async (req, res) => {
            try {
                const fileUploadResponse = await fileProcessor.processUploadedFile(req);
                console.log("fileUploadResponse = ", fileUploadResponse);
                const fileLoadResponse = await fileProcessor.loadCSVToDB(fileUploadResponse.processingPath, req.params.masterDataEntityName);
                res.send({ error: false, status: 200, message: "File uploaded successfully" });
            } catch (e) {
                console.error("Error loading file", e);
                res.status(500).send({ error: true, status: 500, message: e });
            }
        },
        getMasterDataEntityList: (req, res) => { },
        downloadTemplate: async (req, res) => {
            try {
                let columns = metadata[req.params.masterDataEntityName];
                await service.downloadTemplate(req.params.masterDataEntityName, columns, req, res);
            } catch (error) {
                console.error("Error loading file", error);
                res.status(500).send({ error: true, status: 500, message: JSON.stringify(error) });
            }
        },
        deleteData: async (req, res) => {
            try {
                console.log("Received delete request for : ", req.body);
                let returnVal = {};
                if (req.body.record) {
                    var _id = req.body.record._id;
                    if (_id) {
                        await service.deleteData(req.body.masterDataEntityName, _id);
                        returnVal = {
                            status: 200,
                            message: "Record deleted successfully"
                        };
                    } else {
                        returnVal = {
                            status: 400,
                            message: "_id is mandatory"
                        };
                    }
                } else {
                    returnVal = {
                        status: 400,
                        message: "Invalid request"
                    };
                }
                res.json(returnVal);
            } catch (error) {
                console.error("Error loading file", error);
                res.status(500).send({ error: true, status: 500, message: JSON.stringify(error) });
            }
        },
        postData: async (req, res) => {
            try {
                console.log("Received post request for : ", req.body);
                let returnVal = {};
                if (req.body.record) {
                    var _id = req.body.record._id;
                    delete req.body.record._id;
                    var newRecord = req.body.record;
                    await service.postData(req.body.masterDataEntityName, newRecord);
                    returnVal = {
                        status: 200,
                        message: "Record posted successfully"
                    };
                } else {
                    returnVal = {
                        status: 400,
                        message: "Invalid request"
                    };
                }
                res.json(returnVal);
            } catch (error) {
                console.error("Error loading file", error);
                res.status(500).send({ error: true, status: 500, message: JSON.stringify(error) });
            }
        },
        patchData: async (req, res) => {
            try {
                console.log("Received patch request for : ", req.body);
                let returnVal = {};
                if (req.body.record) {
                    var _id = req.body.record._id;
                    delete req.body.record._id;
                    var updatedObj = req.body.record;
                    await service.patchData(req.body.masterDataEntityName, _id, updatedObj);
                    returnVal = {
                        status: 200,
                        message: "Record patched successfully"
                    };
                } else {
                    returnVal = {
                        status: 400,
                        message: "Invalid request"
                    };
                }
                res.json(returnVal);
            } catch (error) {
                console.error("Error loading file", error);
                res.status(500).send({ error: true, status: 500, message: JSON.stringify(error) });
            }
        },
    },
    web: {
        getData: async (req, res) => {
            try {
                const entities = await service.getMasterDataEntityList();
                const { columns, data, masterDataEntityName } = await module.exports.api.getData(req, res);
                let queryParamsRaw = require('querystring').stringify(req.query);
                res.render('masterData', { title: 'Mongo CRUD App | Admin Module | Master Data Management', masterDataEntityName: masterDataEntityName, subtitle: masterDataEntityName, entities: entities, data: data, columns: columns, queryParams: req.query, queryParamsRaw: queryParamsRaw, numRows: data.length })
            } catch (error) {
                console.error("Error loading file", error);
                res.status(500).send({ error: true, status: 500, message: JSON.stringify(error) });
            }
        },
        processFile: (req, res) => { },
        getMasterDataEntityList: async (req, res) => {
            try {
                const entities = await service.getMasterDataEntityList();
                res.render('masterData', { title: 'Mongo CRUD App | Admin Module | Master Data Management', entities: entities })
            } catch (error) {
                console.error("Error loading file", error);
                res.status(500).send({ error: true, status: 500, message: JSON.stringify(error) });
            }
        },
    }
}