const formidable = require('formidable');
const fs = require('fs');
const { v4: uuidv4 } = require("uuid");
const service = require("./service");

const processUploadedFile = async (req) => {
    return await new Promise((resolve, reject) => {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            console.log("files = ", files);
            var oldpath = files.file.filepath;
            var fileName = files.file.originalFilename.split(".")[0];
            var fileExtension = files.file.originalFilename.split(".")[1];
            var processingDirectory = '/home/node/app/processing/';
            fs.mkdirSync(processingDirectory, { recursive: true });
            var newpath = processingDirectory + fileName + "_" + uuidv4() + "." + fileExtension;
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw reject(err);
                resolve({ uploadedPath: oldpath, processingPath: newpath });
            });
        });
    });
};

const loadCSVToDB = async (fileToBeLoaded, collectionName) => {
    return service.loadCSVToDB(fileToBeLoaded, collectionName);
};

module.exports = {
    processUploadedFile, loadCSVToDB
}