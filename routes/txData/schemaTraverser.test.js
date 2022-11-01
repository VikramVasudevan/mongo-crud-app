const { traverseCollection } = require("./schemaTraverser");

let output = [];
traverseCollection("crimes", output);

console.log(JSON.stringify(output,null,4));