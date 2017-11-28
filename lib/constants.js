const os = require('os');
const path = require('path');

const constants = {
    tmpDownloadFile: path.join(os.tmpdir(),'ui5.zip'),
    unzipPath: '.ui5', // install command: target for unzipping
    sourceDir: '.ui5', // for configure command: where are the extracted ui5 sources stored
    defaultUI5version: 'https://openui5.hana.ondemand.com/downloads/openui5-runtime-1.44.24.zip', // this is the LTE version, folks
};

module.exports = constants;
