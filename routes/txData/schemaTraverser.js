const mongo_crud_app_shared_modules = require('mongo_crud_app_shared_modules');

const traverse = (parentPath, isParentArray, parentElement, schema, paths, level, output) => {
    for (var i = 0; i < Object.keys(paths).length; i++) {
        const path = Object.keys(paths)[i];
        const obj = schema.path(path);
        let space = "";
        for (var j = 0; j < level; j++)
            space += " ";

        const absolutePath = (parentPath ? (parentPath + ".") : "") + (isParentArray ? "$." : "") + path;

        let element = {
            level: level,
            absolutePath: absolutePath,
            type: obj.instance,
            parentPath: parentPath,
            path: path,
            isParentArray: isParentArray
        };
        if (parentElement) {
            if (!parentElement.children)
                parentElement.children = [];
            parentElement.children.push(element);
        }
        else
            output.push(element);

        if (obj.instance == 'Array') {
            if (obj.schema) {
                // console.log(space, absolutePath, " = Array");
                //console.log("obj.schema = ", obj.schema);
                traverse(path, true, element, obj.schema, obj.schema.paths, level + 1, output)
            }
            else {
                // console.log(space, absolutePath, " = Array<", obj.$embeddedSchemaType.instance, ">");
                if (!element.children) element.children = [];
                element.children.push({
                    level: level + 1,
                    absolutePath: absolutePath + ".$",
                    type: obj.$embeddedSchemaType.instance,
                    parentPath: absolutePath,
                    path: "$",
                    isParentArray: true
                })

                //console.log("Element.children = ", element.children)
            }
        } else {
            //console.log(space, absolutePath, " = ", obj.instance);
        }
    }
}

const traverseCollection = (collectionName, output) => {
    console.log("mongo_crud_app_shared_modules.mongodb.models = ", mongo_crud_app_shared_modules.mongodb.models);
    const model = mongo_crud_app_shared_modules.mongodb.models[collectionName];
    if (model)
        traverse("", false, undefined, model.schema, model.schema.paths, 0, output);
    else
        throw "Configuration Error : Configured model does not exist!";
}

module.exports = {
    traverseCollection
}