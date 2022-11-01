const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config()
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize : 50,
            });
        console.log("db connected!", process.env.MONGODB_URL);
    }
    catch (err) {
        throw new Error(err);
    }
}

//non blocking callback
// const connect = () =>{
//     mongoose.connect(
//         "mongodb+srv://robin:robin@myemployees-tiapy.mongodb.net/test?retryWrites=true&w=majority",
//         { useNewUrlParser: true, useUnifiedTopology: true },
//         () => {
//             console.log('connected to mongo db');
//         }
//       );
// }

//non blocking promise
// const connect = () => {
//     mongoose.connect(
//         "mongodb+srv://robin:robin@myemployees-tiapy.mongodb.net/test?retryWrites=true&w=majority",
//         { useNewUrlParser: true, useUnifiedTopology: true })
//         .then((result)=>{
//             console.log("mongoose connected via  promise");
//         })
//         .catch((error)=>{
//             throw new Error("couldnt connect to mongo db");
//         });
//     };

const disconnect = async () => {
    try {
        await mongoose.disconnect();
        // console.log("mongodb database connected disconnected")
    }
    catch (err) {
        console.log(err)
        throw new Error(err);
    }
}

const dropCollection = async (collectionName) => {
    try {
        await mongoose.connection.collection(collectionName).drop();
    }
    catch (err) {
        if (err.code === 26) {
            console.log('namespace %s not found', collectionName)
        } else {
            throw new Error(err);
        }
    }
}

const getNextSequence = async function(name) {
    var ret = await mongoose.connection.collection("counters").findOneAndUpdate(
             { _id: name },
             { $inc: { seq: 1 } },
             { new: true, upsert: true }
    );
    console.log("ret", ret);
    return ret.value.seq;
}

const getNextSequenceAfter = async function(name) {
    var ret = await mongoose.connection.collection("counters").findOneAndUpdate(
             { _id: name },
             { $inc: { seq: 1 } },
             { new: true, upsert: true, returnDocument: 'after' }
    );
    console.log("ret", ret);
    return ret.value.seq;
}

mongoose.set('useFindAndModify', false);
module.exports = {
    connect,
    disconnect,
    dropCollection,
    getNextSequence,
    getNextSequenceAfter
};
