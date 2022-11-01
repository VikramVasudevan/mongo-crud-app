const mongo_crud_app_shared_modules = require('../../shared_modules');
const mongoose = require('mongoose');

const getModel = (collection) => {
    return mongoose.models[collection] || mongoose.model(collection, new mongoose.Schema({}, { strict: false }), collection);
}

const getMetadata = async () => {
    const model = getModel("admin_txdata_config");
    return model.find({}).lean();
}

const getMetadataByEntityName = async (transactionalDataEntityName) => {
    const model = getModel("admin_txdata_config");
    return model.findOne({ name: transactionalDataEntityName }).lean();
}


const getEntities = async () => {
    return getMetadata();
}

const getData = async (model, filter, skip, limit) => {
    console.log("Querying ", model, filter, skip, limit);
    return mongo_crud_app_shared_modules.mongodb.models[model].find(filter).skip(skip).limit(limit).lean();
}

const getTotalRows = async (model, filter) => {
    console.log("Querying to get total rows", model, filter);
    return mongo_crud_app_shared_modules.mongodb.models[model].countDocuments(filter);
}


const patchData = async (model, id, newValue) => {
    console.log("Patching Data For - ", model, id, newValue);
    return mongo_crud_app_shared_modules.mongodb.models[model].findByIdAndUpdate(id, { $set: newValue });
}

module.exports = {
    getTotalRows,
    getMetadataByEntityName,
    getMetadata,
    getEntities,
    getData,
    patchData
}