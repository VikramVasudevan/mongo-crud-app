const service = require("./service");

const getFilter = (req) => {
    let filter = {};
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
}

const getData = async (req, res) => {
    const reportName = req.params.reportName;
    const metadata = await service.getMetadata();
    let reports = Object.keys(metadata).map(report => {
        return {
            reportName: report,
            displayName: metadata[report].displayName
        }
    });

    //console.log("reports = ", reports);

    let templateArguments = { title: 'Mongo CRUD App | Admin Module | Reports', reports: reports, queryParams: req.query };

    let filter = getFilter(req);

    if (reportName) {
        const data = await service.getData(reportName, filter);
        //console.log("data = ", data);
        let columns = metadata[reportName].columns;
        if (!columns && data.length > 0) {
            columns = Object.keys(data[0]);
        }
        if (!columns) columns = [];
        const moreArgs = { ...templateArguments, report : metadata[reportName], data: data, columns: columns, numRows: data.length };
        templateArguments = moreArgs;
    }
    res.render('reports', templateArguments)
}

const downloadData = async (req, res) => {
    let metadata = await service.getMetadata();
    let columns = metadata[req.params.reportName].columns;
    let filter = getFilter(req);
    await service.downloadData(req.params.reportName, filter, columns, res);
}

module.exports = {
    api: {
        downloadData
    },
    web: {
        getData
    }
}