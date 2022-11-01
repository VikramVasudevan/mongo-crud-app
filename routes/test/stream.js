const { Readable } = require("stream");

async function logChunks(readable) {
    for await (const chunk of readableStream) {
        console.log("From logChunks -",chunk.toString());
    }
}


let items = ["one", "two", "three", "four", "five", "six"];
let count = 0;
const readableStream = new Readable({
    read(size) {
        this.push(items[count]);
        if (count === items.length) this.push(null);
        count++;
    }
});

// piping
readableStream.pipe(process.stdout)

// through the data event
readableStream.on('data', (chunk) => {
    console.log("[",chunk.toString(),']');
});

readableStream.on('end', () => {
    console.log("Stream ended");
});

logChunks(readableStream)