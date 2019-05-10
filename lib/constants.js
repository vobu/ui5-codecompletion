const os = require('os');
const path = require('path');
const request = require('request');

const constants = function () {
const defaultUI5version = new Promise((resolve, reject) => {
        const url = 'https://latest-openui5.rikosjett.com/api/v1/latest';
        request(url, (err, resp, content) => {
            if (err) {
                reject(err);
            }
            resolve(content);
        });
});

return {
        tmpDownloadFile: path.join(os.tmpdir(),'ui5.zip'),
        unzipPath: '.ui5', // install command: target for unzipping
        sourceDir: '.ui5', // for configure command: where are the extracted ui5 sources stored
        defaultUI5version: defaultUI5version
    }



};

module.exports = constants();



