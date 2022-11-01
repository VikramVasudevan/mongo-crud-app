const db = require("./DB");
const _ = require("lodash");
const { parse } = require('json2csv');

const getMetadata = async () => {
    let myMetadata = await db.getMetadata();
    //console.log("myMetadata=", myMetadata);
    let returnVal = {};

    myMetadata.forEach(doc => {
        returnVal[doc.name] = doc;
    });

    return returnVal;
};

const getData = async (reportName, filter) => {
    try {
        let metadata = await getMetadata();
        let thePipeline = _.cloneDeep(metadata[reportName].pipeline);
        thePipeline = JSON.parse(thePipeline);
        //console.log("thePipeline = ", thePipeline);
        if (!_.isEmpty(filter)) {
            thePipeline.push({ "$match": filter });
        }

        return db.getData(metadata[reportName].collection, thePipeline);
    } catch (e) {
        console.error("Error fetching data", e);
        return [];
    }
}

const downloadData = async (reportName, filter, columns, res) => {
    try {
        let metadata = await getMetadata();
        let thePipeline = _.cloneDeep(metadata[reportName].pipeline);
        thePipeline = JSON.parse(thePipeline);
        // console.log("thePipeline = ", thePipeline);
        if (!_.isEmpty(filter)) {
            thePipeline.push({ "$match": filter });
        }

        res.setHeader("content-type", "text/csv");
        res.setHeader("content-disposition", `${reportName}.csv`);
        const results = db.getDataAsCursor(metadata[reportName].collection, thePipeline, true);
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
        console.error("Error downloading data", e);
        res.status(500).send({ error: true, message: e });
    }
}

module.exports = {
    getMetadata,
    getData,
    downloadData
}