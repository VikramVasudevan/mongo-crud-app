const { traverseCollection } = require("./schemaTraverser");
const service = require('./service');
const _ = require('lodash');

const parseFilterFromQueryString = async (req) => {
    const transactionalDataEntityName = req.params.transactionalDataEntityName;
    let filter = {};
    let skip = 0;
    let limit = 1;
    const metadata = await service.getMetadataByEntityName(transactionalDataEntityName);
    Object.keys(req.query).filter(param => param.startsWith("fil-")).forEach(param => {
        //console.log(param, req.query[param]);
        let newParam = param.substring(4);
        filter[metadata.attributes.find(attr => attr.name == newParam).fieldName] = req.query[param];
    })

    if (Object.keys(req.query).includes("skip"))
        skip = parseInt(req.query.skip);
    if (Object.keys(req.query).includes("limit"))
        limit = parseInt(req.query.limit);

    return { filter, skip, limit };

}

const get = async (req, res) => {
    try {
        const transactionalDataEntityName = req.params.transactionalDataEntityName;
        let formElements = [];
        let metadata = {};
        if (transactionalDataEntityName) {
            metadata = await service.getMetadataByEntityName(transactionalDataEntityName);
            if (metadata)
                traverseCollection(metadata.model, formElements);
            //console.log(metadata);
        }
        const entities = await service.getEntities();

        let { filter, skip, limit } = await parseFilterFromQueryString(req);
        //console.log(filter);
        let dataAndCount = {};
        let data;
        let count = 0;

        if (!_.isEmpty(filter)) {
            dataAndCount = await service.getData(metadata.model, filter, skip, limit);
            data = dataAndCount.data;
            count = dataAndCount.count;
        }
        if (data && data.length >= 1)
            data = data[0];
        else
            data = {};
        //console.log(data);
        res.render('txData', {
            title: 'Mongo CRUD App | Admin Module | Transactional Data Management',
            transactionalDataEntityName: transactionalDataEntityName,
            subtitle: transactionalDataEntityName ? metadata?.displayName : transactionalDataEntityName,
            numRows: count,
            entities: entities,
            formElements: formElements,
            metadata: transactionalDataEntityName ? metadata : {},
            queryString: req.query,
            filter: filter,
            data: data,
            skip: skip,
            limit: limit,
            getElement: (data, path) => {
                // console.log("path", path);
                if (!path.includes("."))
                    return data[path];
                else {
                    let tokens = path.split(".");
                    // console.log("tokens = ", tokens);
                    let d = _.cloneDeep(data);
                    for (var i = 0; i < tokens.length; i++) {
                        // console.log("Processing token", tokens[i])
                        if (d)
                            d = d[tokens[i]];
                    }
                    return d;
                }
            }
        })
    } catch (e) {
        console.error("Error fetching data",e);
        res.render('error', {
            title: 'Mongo CRUD App | Admin Module | Transactional Data Management',
            message: "Error - " + e.toString()
        });
    }
}

const patchData = async (req, res) => {
    try {
        const transactionalDataEntityName = req.params.transactionalDataEntityName;
        let metadata = {};
        if (transactionalDataEntityName)
            metadata = await service.getMetadataByEntityName(transactionalDataEntityName);

        console.log("req.body = ", req.body)
        const { _id, newValue } = req.body;
        if(!_id) {
            res.status(400).send({
                status: 400,
                error: true,
                message: "_id is missing in body"
            });
            returnl
        }
        const response = await service.patchData(metadata.model, _id, newValue);
        console.log("response = ", response);
        res.status(200).send({
            status: 200,
            error: false,
            message: "Record patched successfully"
        });
    } catch (e) {
        console.error("Error patching data", e);
        res.status(500).send({
            status: 500,
            error: true,
            message: "Error Patching Data : " + JSON.stringify(e)
        });
    }
}

module.exports = {
    api: {
        patchData
    },
    web: {
        get
    }
}