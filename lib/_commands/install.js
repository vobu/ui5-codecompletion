const {install} = require('../commands');
const constants = require('../constants');

module.exports = {
    command: 'install [from] [to]',
    desc: 'downloads (if URL) or copies (if fs path) and configures a UI5 runtime library for code completion',
    builder: {
        from: {
            default: constants.defaultUI5version.then( res => res)
        },
        to: {
            default: constants.unzipPath
        }
    },
    handler: async args => {
        install(await args.from, args.to)
    }
};