const mongoose = require('mongoose');

const getModel = (masterDataEntityName) => {
    return mongoose.models[masterDataEntityName] || mongoose.model(masterDataEntityName, new mongoose.Schema({}, { strict: false }), masterDataEntityName);
}

const getData = async (masterDataEntityName, filter, unlimited) => {
    const model = getModel(masterDataEntityName);
    let returnVal = model.find(filter);
    if (!unlimited) {
        returnVal = returnVal.limit(500)
    }

    returnVal = returnVal.select({ __v: 0 });

    returnVal = returnVal.sort({ _id: -1 }).lean()
    return returnVal;
}

const getDataAsCursor = (masterDataEntityName, filter, unlimited) => {
    console.log("Filter = ", filter);
    let returnVal = mongoose.connection.db.collection(masterDataEntityName).find(filter);

    if (!unlimited) {
        returnVal = returnVal.limit(500)
    }

    returnVal = returnVal.project({ __v: 0 });

    returnVal = returnVal.sort({ _id: -1 })
    return returnVal;
}

const patchData = async (masterDataEntityName, _id, value) => {
    const model = getModel(masterDataEntityName);
    return model.findByIdAndUpdate(_id, value);
}

const postData = async (masterDataEntityName, value) => {
    const model = getModel(masterDataEntityName);
    const record = new model(value);
    return record.save();
}

const deleteData = async (masterDataEntityName, _id) => {
    const model = getModel(masterDataEntityName);
    return model.findByIdAndDelete(_id);
}


module.exports = {
    getData,
    getDataAsCursor,
    patchData,
    postData,
    deleteData,
    getModel
}