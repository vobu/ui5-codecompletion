const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

const helpers = require('./helpers');

function install(from, to) {
    let target = path.join(process.cwd(), to);
    return helpers.download(from)
        .then(() => {
            return fs.emptyDir(target)
        })
        .then(() => {
            return helpers.unzip(target)
        })
        .then(helpers.deleteZip)
        .then(() => {
            return helpers.updateUI5CompletionFromSource(target)
        })
        .then(helpers.addLocalUI5LibraryToConfig)
        .then(() => {
            helpers._gitignore(target)
        })
        .catch(err => {
            "use strict";
            console.error(err);
            throw(err); // re-throw for promise chain
        });
}

function configure(sourcesDir) {
    let target = path.join(process.cwd(), sourcesDir);
    return Promise.resolve()
        .then(() => {
            if (!fs.existsSync(target)) {
                throw new Error(`there's no ${target} directory!`)
            } else if (glob.sync(`${target}/**/*dbg.js`).length <= 0) {
                throw new Error(`there don't seem to be any UI5 debug-sources in directory ${target}!`)
            } else {
                return true;
            }
        })
        .then(() => {
            return helpers.updateUI5CompletionFromSource(target)
        })
        .then(helpers.addLocalUI5LibraryToConfig)
        .then(() => {
            helpers._gitignore(target)
        })
        .catch(err => {
            console.error(err);
        });
}

module.exports = {
    install,
    configure
};