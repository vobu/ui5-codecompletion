const path = require('path');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const fs = require('fs-extra');
const xml2jsString = require('xml2js').parseString;

describe("sourcesDir parameter", function () {
    it("should be set to the default value if omitted", function () {
        const {builder} = require('../lib/_commands/configure');
        const constants = require('../lib/constants');
        expect(builder.sourcedir.default).to.be.equal(constants.sourceDir);
    });
});

describe("configure", function() {
    it("updateUI5CompletionFromSource: should use 3 files for code completion in locallib.xml", function(done) {
        const helpers = proxyquire('../lib/helpers', {
            "glob": {
                sync: function(path, options) {
                    return [
                        'bla/a-dbg.js',
                        'bla/b-dbg.js',
                        'bla/c-dbg.js',
                    ]
                }
            },
            "fs-extra": {
                ensureDirSync: function(target) {
                    return true;
                },
                writeFileSync: function(src, target) {
                    xml2jsString(target, (err, result) => {
                        if (err) {
                            expect.fail("error parsing XML string");
                            done();
                        }
                        let node = result.component.library[0].CLASSES[0].root;
                        expect(node.length).to.be.equal(3);
                        done();
                        return true;
                    });
                }
            }
        });

        helpers.updateUI5CompletionFromSource('/fake/mock/path');
    });

    it("updateUI5CompletionFromSource: should only allow relative references to UI5 lib (in project dir)", function(done) {
        let mockUI5libDir = path.join(process.cwd(), 'local', 'ui5', 'lib');
        let absPath = path.join(mockUI5libDir, 'resources');
        let sSourcePath = path.relative(process.cwd(), absPath);
        let fakeFile = path.join(sSourcePath, 'bla', 'a-dbg.js');
        
        const helpers = proxyquire('../lib/helpers', {
            "glob": {
                sync: function(path, options) {
                    return [
                        fakeFile
                    ]
                }
            },
            "fs-extra": {
                ensureDirSync: function(target) {
                    return true;
                },
                writeFileSync: function(src, target) {
                    xml2jsString(target, (err, result) => {
                        if (err) {
                            expect.fail("error parsing XML string");
                            done();
                        }
                        let url = result.component.library["0"].properties["0"].sourceFilesUrls["0"].item["0"].$.url;
                        
                        expect(url).to.not.include(process.cwd());
                        done();
                        return true;
                    });
                }
            }
        });

        helpers.updateUI5CompletionFromSource(mockUI5libDir);
    });
   
    it("addEntryToXmlFileAt: should use fallback file if no jsLibraryMappings.xml exists", function (done) {
        const helpers = proxyquire('../lib/helpers', {
            "glob": {
                sync: function(path, options) {
                    return [
                        'bla/a-dbg.js',
                        'bla/b-dbg.js',
                        'bla/c-dbg.js',
                    ]
                }
            },
            "fs-extra": {
                existsSync: function (target) {
                    if (target !== path.join(__dirname, '../resources/jsLibraryMappings.xml')) {
                        return false;
                    } else {
                        return true;
                    }
                },
                ensureDirSync: function (target) {
                    return true;
                },
                writeFileSync: function (src, target) {
                    done();
                    return true;
                }
            }
        });
        
        let ideaFile = path.join(process.cwd(), '/.idea/jsLibraryMappings.xml');
        let fallbackFile = path.join(__dirname, '../resources/jsLibraryMappings.xml');
        helpers.addEntryToXmlFileAt(['bla'], ideaFile, fallbackFile);
    })
});
