const fs = require('mz/fs');
const csv = require('fast-csv');
const mongodb = require('./mongodb/mongodb.utils');

const { Schema } = mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.set('debug', false);

const rankSchema = new Schema({
    serverid: Number,
    resetid: Number,
    rank: Number,
    name: String,
    land: String,         // <-- You have this as Number but it's a string
    networth: Number,
    tag: String,
    stuff: String,        // the empty field in the csv
    gov: String,
    gdi: Number,
    protection: Number,
    vacation: Number,
    alive: Number,
    deleted: Number
});

const Rank = mongoose.model('Rank', rankSchema);

const log = data => console.log(JSON.stringify(data, undefined, 2));

(async function () {

    try {
        await mongodb.connect();

        await Promise.all(Object.entries(mongoose.connection.models).map(([k, m]) => m.remove()));

        let headers = Object.keys(Rank.schema.paths)
            .filter(k => ['_id', '__v'].indexOf(k) === -1);

        // log(headers);

        await new Promise((resolve, reject) => {

            let buffer = [],
                counter = 0;

            let stream = fs.createReadStream('input.csv')
                .pipe(csv.parse({ headers: true }))
                .on("data", doc => {
                    stream.pause();
                    try {
                        console.log("Processing doc ", buffer.length);
                        if (buffer.length > 10) {
                            const loadBuffer = JSON.parse(JSON.stringify(buffer));
                            console.log("Resetting buffer");
                            buffer = [];
                            console.log("Inserting into database ...", loadBuffer.length, 'records');
                            Rank.insertMany(loadBuffer).then(() => {
                            });
                        }
                        buffer.push(doc);
                    } catch (e) {
                        console.error(e);
                        stream.destroy();
                    }
                    stream.resume();
                })
                .on("error", reject)
                .on('end', async () => {
                    try {
                        if (buffer.length > 0) {
                            console.log("Inserting into database ...", buffer.length, 'records');
                            await Rank.insertMany(buffer);
                            buffer = [];
                        }
                        resolve();
                    } catch (e) {
                        stream.destroy(e);
                        reject(e);
                    } finally {
                        process.exit();
                    }
                });
        });


    } catch (e) {
        console.error(e)
    } finally {
        process.exit()
    }


})()