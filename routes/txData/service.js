const db = require('./DB');

const getEntities = () => {
    return db.getEntities();
}

const getMetadata = async () => {
    return db.getMetadata();
}

const getMetadataByEntityName = async (transactionalDataEntityName) => {
    return db.getMetadataByEntityName(transactionalDataEntityName);
}

const getData = async (model, filter, skip, limit) => {
    const data = await db.getData(model, filter, skip, limit);
    const count = await db.getTotalRows(model, filter);
    return { data, count };
}

const patchData = async (model, id, newValue) => {
    return db.patchData(model, id, newValue);
}

module.exports = {
    getMetadataByEntityName,
    getMetadata,
    getEntities,
    getData,
    patchData
}