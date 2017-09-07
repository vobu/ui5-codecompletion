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
    it("updateUI5CompletionFromSource: should use 3 files for code completion in locallib.xmll", function(done) {
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
