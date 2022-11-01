const mongoose = require('mongoose');

const getModel = (collection) => {
    return mongoose.models[collection] || mongoose.model(collection, new mongoose.Schema({}, { strict: false }), collection);
}

const getMetadata = async () => {
    const model = getModel("admin_reports");
    return model.find({}).lean();
}

const getData = async (collection, pipeline) => {
    //console.log("collection = ", collection)
    //console.log("pipeline = ", pipeline)
    const model = getModel(collection);
    return model.aggregate(pipeline);
}

const getDataAsCursor = (collection, pipeline, unlimited) => {
    let returnVal = mongoose.connection.db.collection(collection).aggregate(pipeline)

    if (!unlimited) {
        returnVal = returnVal.limit(500)
    }

    returnVal = returnVal.project({ __v: 0 });

    returnVal = returnVal.sort({ _id: -1 })
    return returnVal;
}


module.exports = {
    getMetadata,
    getData,
    getDataAsCursor
}