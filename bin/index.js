#!/usr/bin/env node
const yargs = require('yargs');
const path = require('path');
const constants = require('../lib/constants');

const bin = (async function () {
    const execute = yargs.commandDir(path.join(__dirname, '../', 'lib', '_commands'))
        .help('help')
        .alias('h', 'help')
        .showHelpOnFail(false, "specify --help for available options")
        .usage('Usage: ui5-codecompletion <command> [options]')
        .describe('from', `URL or file system path to zip-file w/ UI5 runtime sources, defaults to "${await constants.defaultUI5version.then(res=>res)}"`)
        .describe('to', `file system path, relative to $project_dir, to store UI5 sources in; defaults to "${constants.unzipPath}"`)
        .describe('sourceDir', `file system path, relative to $project_dir, to configure code completion with; defaults to "${constants.sourceDir}"`)
        .alias('f', 'from')
        .alias('t', 'to')
        .alias('s', 'sourceDir')
        .example('ui5-codecompletion install', 'downloads and configures UI5 with default options')
        .example('ui5-codecompletion install --from=https://url/openui5-runtime.zip',
            `installs UI5 from the specified URL to ${constants.unzipPath}`)
        .example('ui5-codecompletion install \\\n> -f=https://url/openui5-runtime.zip \\\n> -t=ui5/sources/local',
            'installs UI5 from the URL pointing to the .zip, to $project_dir/ui5/sources/local')
        .example('ui5-codecompletion configure', `uses UI5 sources in ${constants.sourceDir} to configure code completion`)
        .example('ui5-codecompletion configure --sourceDir=my/relative/dir/ui5' ,
            'uses UI5 sources in $project_dir/my/relative/dir/ui5 to configure code completion')
        .example('ui5-codecompletion configure -s=dir/ui5' ,
            'uses UI5 sources in $project_dir/dir/ui5 to configure code completion')
        .demandCommand(1, 'at least one command (install|configure) needs to be provided!')
        .argv;
})();

module.exports = bin;


        

