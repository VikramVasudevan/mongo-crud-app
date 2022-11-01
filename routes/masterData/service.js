const db = require('./DB');
const fs = require('fs');
const { parse } = require('json2csv');
const csv = require('fast-csv');
const _ = require('lodash');

const getMasterDataEntityList = async () => {
    return ['test_collection_1','test_collection_2', 'test_collection_3'];
}

const processFile = async (fileName, masterDataEntityName) => {

}

const getData = async (masterDataEntityName, filter) => {
    return db.getData(masterDataEntityName, filter);
}

const patchData = async (masterDataEntityName, _id, value) => {
    return db.patchData(masterDataEntityName, _id, value);
}

const postData = async (masterDataEntityName, value) => {
    return db.postData(masterDataEntityName, value);
}

const deleteData = async (masterDataEntityName, _id) => {
    return db.deleteData(masterDataEntityName, _id);
}

const getFilterFromReq = (req) => {
    let filter = {};
    console.log("req.query", req.query);
    if (req.query) {
        Object.keys(req.query).forEach(queryParam => {
            if (req.query[queryParam]) {
                if (queryParam != "_id") {
                    filter[queryParam] = new RegExp(req.query[queryParam], "gi");
                }
                else {
                    filter[queryParam] = new mongoose.mongo.ObjectId(req.query[queryParam]);
                }
            }
        })
    }
    return filter;
};


const downloadTemplate = async (masterDataEntityName, columns, req, res) => {
    try {
        res.setHeader("content-type", "text/csv");
        res.setHeader("content-disposition", `${masterDataEntityName}.csv`);
        const results = db.getDataAsCursor(masterDataEntityName, getFilterFromReq(req), true);
        let firstRow = true;
        for await (const doc of results) {
            if (!columns) columns = Object.keys(doc);
            const csv = parse(doc, { fields: columns, header: firstRow });
            res.write(csv);
            res.write("\n");
            firstRow = false;
        }
        res.end();
    } catch (e) {
        res.status(500).json({ status: 500, error: true, message: JSON.stringify(error) });
    }
}

const loadCSVToDB = async (fileToBeLoaded, collectionName) => {
    const model = db.getModel(collectionName);

    //Take backup
    const backupCollectionName = collectionName + "_" + new Date().getTime();
    await model.aggregate([{ $out: backupCollectionName }]);

    return await new Promise((resolve, reject) => {

        let buffer = [],
            counter = 0;

        let stream = fs.createReadStream(fileToBeLoaded)
            .pipe(csv.parse({ headers: true }))
            .on("data", doc => {
                stream.pause();
                try {
                    console.log("Processing doc ", buffer.length);
                    if (buffer.length > 10) {
                        const loadBuffer = JSON.parse(JSON.stringify(buffer));
                        console.log("Resetting buffer");
                        buffer = [];
                        console.log("Updating ...", loadBuffer.length, 'records');
                        bulkWrite(model, buffer);
                    }
                    buffer.push(doc);
                } catch (e) {
                    console.error("Error loading data", e);
                    stream.destroy();
                }
                stream.resume();
            })
            .on("error", reject)
            .on('end', async () => {
                try {
                    if (buffer.length > 0) {
                        console.log("Updating ...", buffer.length, 'records');
                        bulkWrite(model, buffer);
                        buffer = [];
                    }
                    resolve();
                } catch (e) {
                    console.error("Error loading final data set", e);
                    stream.destroy(e);
                    reject(e);
                } finally {
                    console.log("Finally ...");
                }
            });
    });
};

const bulkWrite = (model, buffer) => {
    model.bulkWrite(buffer.map(rec => {
        if (_.isEmpty(rec._id))
            delete rec._id;

        return (rec._id ? {
            updateOne: {
                filter: { _id: rec._id },
                update: { $set: rec },
                upsert: true,
            }
        } : {
            insertOne: {
                "document": rec
            }
        });
    }))
}

module.exports = {
    getMasterDataEntityList, processFile, getData, patchData, postData, deleteData, downloadTemplate, loadCSVToDB, getFilterFromReq
}