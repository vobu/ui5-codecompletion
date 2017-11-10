#!/usr/bin/env node

const progressBar = require('progress');
const fs = require('fs-extra');
const url = require('url');
const admZip = require('adm-zip');
const xml2js = require('xml2js');
const _ = require('lodash');
const glob = require('glob');
const hbs = require('handlebars');
const path = require('path');
const request = require('request');

const constants = require('./constants');

const helpers = {

    _gitignore(target) {
        "use strict";
        console.info("********************************************************************************");
        console.info(`HINT: you might want to add 
   ${target} 
to .gitignore (or your VCS's equivalent)
in order to avoid adding the UI5 sources to version control`);
        console.info("********************************************************************************");
    },

    isUrl(urlString) {
        "use strict";
        if (!urlString) {
            return false;
        }
        let urlObj = url.parse(urlString);
        if (urlObj.protocol && urlObj.protocol.indexOf('http') > -1) {
            return true;
        } else {
            return false;
        }
    },

    isFile(path) {
        try {
            fs.lstatSync(path).isFile();
            return true;
        } catch (err) {
            return false;
        }
    },

    isZip(uri) {
        return uri.endsWith(".zip");
    },

    download(from) {
        return new Promise((resolve, reject) => {
            if (!helpers.isZip(from)) {
                let errMsg = `${from} is not pointing to a .zip file...exiting`;
                reject(errMsg);
                return false;
            }
            if (!helpers.isUrl(from) && !helpers.isFile(from)) {
                let errMsg = `${from} is not a valid file system path...exiting`;
                reject(errMsg);
                return false;
            }

            if (helpers.isUrl(from)) {
                // refactor - now using request instead of http/https
                let req = request(from);
                let bar;
                console.log(`downloading ${from}`);
                req
                    .on('error', (err) => {
                        req.abort();
                        reject(err);
                    })
                    .on('response', function (response) {
                        if (response.statusCode === 404) {
                            reject(`Remote file at ${from} doesn't seem to exist. Server responded with status code ${response.statusCode}!`);
                            req.abort();
                        }
                    })
                    .on('data', function (chunk) {
                        bar = bar || new progressBar('   [:bar] :rate/bps :percent :etas', {
                            complete: '=',
                            incomplete: ' ',
                            width: 20,
                            total: parseInt(req.response.headers['content-length'])
                        });
                        bar.tick(chunk.length);
                    })
                    .pipe(
                        fs.createWriteStream(constants.tmpDownloadFile)
                    )
                    .on('close', function (err) {
                        resolve();
                    });
            } else if (helpers.isFile(from)) {
                try {
                    fs.copySync(from, constants.tmpDownloadFile, {
                        preserveTimestamps: true
                    });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }

        });
    },

    unzip(to) {
        let projectDir = process.cwd();
        if (!to.includes(projectDir, 0)) {
            throw new Error(`${to} is outside project root directory!`)
        }

        try {
            fs.ensureDirSync(to)
        } catch (err) {
            throw new Error(`can't create ${to}\nError: ${err}`);
        }
        console.log(`extracting UI5 sources to ${to}...`);
        let zip = new admZip(constants.tmpDownloadFile);
        zip.extractAllTo(to, /*overwrite*/ true);
        console.log('   ...done!');
        return true;
    },

    deleteZip() {
        "use strict";
        fs.unlinkSync(constants.tmpDownloadFile);
        console.log('deleting .zip: done!');
        return true;
    },

    addEntryToXmlFileAt(aObjectsToAdd, sFileName, sFallbackFile) {
        let oParser = new xml2js.Parser();
        let builder = new xml2js.Builder();
        if (!fs.existsSync(sFileName)) {
            let sTargetDir = require('path').dirname(sFileName);
            fs.ensureDirSync(sTargetDir);

            if (fs.existsSync(sFallbackFile)) {
                fs.writeFileSync(sFileName, fs.readFileSync(sFallbackFile));
            } else {
                console.error(`fallbackfile ${sFallbackFile} does not exist - 
sure we're working a WebStorm project dir here!?`);
            }
        } else {
            let sIdeaModules = fs.readFileSync(sFileName, 'utf8');

            oParser.parseString(sIdeaModules, function (err, result) {

                _.forEach(aObjectsToAdd, function (oObject) {
                    let aTarget = _.at(result, oObject.at);
                    aTarget.push(oObject.object);
                });

                fs.writeFileSync(sFileName, builder.buildObject(result));
            });
        }
    },

    addLocalUI5LibraryToConfig() {

        // add ui5 library to idea module
        let aModuleFiles = glob.sync(".idea/*.iml");

        console.log(`adding UI5-sources to ${aModuleFiles.length} already existing 'Libraries in Scope'.`);

        helpers.addEntryToXmlFileAt([{
            object: {
                $: {
                    type: 'library',
                    name: 'LocalUI5Library',
                    level: 'Project'
                }
            }, at: 'module.component[0].orderEntry[0]'
        }], './' + aModuleFiles[0]);

        helpers.addEntryToXmlFileAt([{
            object: {
                $: {
                    url: 'file://$PROJECT_DIR$',
                    libraries: '{LocalUI5Library}'
                }
            }, at: "project.component[0].file"
        },
            {
                object: {
                    $: {
                        url: 'PROJECT',
                        libraries: '{LocalUI5Library}'
                    }
                }, at: "project.component[0].file"
            }
        ], path.join(process.cwd(), '.idea', 'jsLibraryMappings.xml'), path.join(__dirname, '..', 'resources', 'jsLibraryMappings.xml'));

        return true;
    },

    /**
     * @description update webstorm autocompletion xml for ui5 sources from files in $project_dir/.ui5
     */
    updateUI5CompletionFromSource(location) {
        let aLibFiles;
        let oHbsTemplate;

        let sAbsPath = path.join(location, 'resources');
        let sSourcePath = path.relative(process.cwd(), sAbsPath);
        aLibFiles = glob.sync(`${sSourcePath}/**/*dbg.js`, {ignore: '**/*-all*.js'});
        console.log(`providing code completion from 
   ${sSourcePath} 
for ${aLibFiles.length} files (*dbg.js only).`);
        oHbsTemplate = hbs.compile(fs.readFileSync(path.join(__dirname, '..', 'resources', 'LocalUI5LibraryTemplate.hbs')).toString());
        fs.ensureDirSync(path.join('.idea', 'libraries'));
        fs.writeFileSync(path.join('.idea', 'libraries', 'LocalUI5Library.xml'), oHbsTemplate({sourceFiles: aLibFiles}));
        return true;
    }
};


module.exports = helpers;


        

