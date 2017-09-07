const { configure } = require('../commands');
const constants = require('../constants');

module.exports = {
    command: 'configure [sourceDir]',
    desc: 'uses the extracted UI5 library in $project/',
    builder: {
        sourcedir: {
            default: constants.sourceDir
        }
    },
    handler: (args) => {
        configure(args.sourceDir)
    }
};