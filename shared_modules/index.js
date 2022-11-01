const testCollection1 = require('./mongodb/models/test_collection1');

function sayHello() {
    console.log("Hello!");
}

module.exports = {
    sayHello,
    mongodb: {
        models: {
            testCollection1
        }
    }
}