const os = require('os');
const path = require('path');
const request = require('request');

const constants = function () {
const defaultUI5version = new Promise((resolve, reject) => {
    let req = request('https://latest-openui5.rikosjett.com/api/v1/latest');
    let data = '';
    req
        .on('error', (err) => {
            req.abort();
            reject(err);
        })
        .on('response', function (response) {
            if (response.statusCode === 404) {
                reject();
                req.abort();
            }
        })
        .on('data', (chunk) => {
            data += chunk;
        })
        .on('close', function (err) {
            resolve(data);
        })
});

return {
        tmpDownloadFile: path.join(os.tmpdir(),'ui5.zip'),
        unzipPath: '.ui5', // install command: target for unzipping
        sourceDir: '.ui5', // for configure command: where are the extracted ui5 sources stored
        defaultUI5version: defaultUI5version
    }



};

module.exports = constants();



