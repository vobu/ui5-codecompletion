const path = require('path');
const expect = require('chai').expect;
const proxyquire = require('proxyquire').noPreserveCache();
const fs = require('fs-extra');

describe("from parameter", function () {
    it("should be set to the default value if omitted", function () {
        const {builder} = require('../lib/_commands/install');
        const constants = require('../lib/constants');
        expect(builder.from.default).to.be.equal(constants.defaultUI5version);
    });
    it("should allow local file path to a UI5 zip", function () {
        const helpers = require('../lib/helpers');
        let zip = path.join(__dirname, "example.zip");
        expect(helpers.isFile(zip)).to.be.true;
    });
    it("should reject invalid file path", function () {
        const helpers = require('../lib/helpers');
        expect(helpers.isFile("/doe/not/exist.zip")).to.be.false;
    });
    it("should allow both http and https URIs to a UI5 zip", function () {
        const helpers = require('../lib/helpers');
        let http = "http://bla/ui5.zip";
        let https = "https://bla/ui5.zip";
        expect(helpers.isUrl(http)).to.be.true;
        expect(helpers.isUrl(https)).to.be.true;
    });
    it("should recoginze invalid URIs", function () {
        const helpers = require('../lib/helpers');
        expect(helpers.isUrl("http//bla")).to.be.false;
        expect(helpers.isUrl("smb://file.zip")).to.be.false;
    });
    it("should validate that we're pointing from to a zip", function () {
        const helpers = require('../lib/helpers');
        let http = "http://bla/ui5.zip";
        let https = "https://bla/ui5.zip";
        let zip = path.join(__dirname, "example.zip");
        expect(helpers.isZip(http)).to.be.true;
        expect(helpers.isZip(https)).to.be.true;
        expect(helpers.isZip(zip)).to.be.true;
    })
    it("should disallow files other than .zip", function () {
        const helpers = require('../lib/helpers');
        expect(helpers.isZip("http://js-soft.com/robots.txt")).to.be.false;
        expect(helpers.isZip(path.join(__dirname, "install.js"))).to.be.false;
    })
});

describe("to parameter", function () {
    it("should be set to a default value if omitted", function () {
        const {builder} = require('../lib/_commands/install');
        const constants = require('../lib/constants');
        expect(builder.to.default).to.be.equal(constants.unzipPath);
    });
    it("should throw an error if 'to' directory has insufficient permissions", function () {
        const helpers = require('../lib/helpers');
        let root = path.parse(__dirname).root;
        let to = path.join(root, "ui5");
        expect(helpers.unzip.bind(this, to)).to.throw();
    });
    it("should throw an error if to path is not inside $project_dir", function () {
        const helpers = require('../lib/helpers');
        let to = path.join(process.cwd(), "..", "..", "some", "path");
        expect(helpers.unzip.bind(this, to)).to.throw();
    })
});

describe("install", function () {
    const glob = require('glob');
    const constants = require('../lib/constants.js');
    const {install} = proxyquire('../lib/commands', {
        "./helpers": {
            download(from) {
                return Promise.resolve().then(() => {
                    let mockZip = path.join(process.cwd(), "test", "example.zip");
                    fs.copySync(mockZip, constants.tmpDownloadFile);
                })
            },
            addEntryToXmlFileAt(a, b, c) {
                return true;
            }
        },
        "fs-extra": {
            emptyDir: function (target) {
                return true;
            },
            ensureDirSync: function (target) {
                return true;
            },
            writeFileSync: function (src, target) {
                return true;
            },
            existsSync: function (file) {
                return true;
            }
        }
    });

    it("should download a mocked UI5 lib from an URL to a custom location in the $project_dir", function (done) {
        let fromMock = "http://mocked/zip.zip";
        let to = "local/ui5/dir";
        let source = path.join(process.cwd(), to);
        Promise.resolve().then(() => {
            return install(fromMock, to);
        }).then(() => {
            let iFiles = glob.sync(`${source}/**/*dbg.js`).length;
            expect(iFiles).to.be.greaterThan(0);
            fs.removeSync(source);
            done();
        }).catch(err => {
            fs.removeSync(source);
            expect.fail(err);
            done();
        })
    });

    it("should use a mocked UI5 lib from a FS path and install in custom location in $project_dir", function (done) {
        "use strict";
        let fromMock = path.join(process.cwd(), "test", "example.zip");
        let to = "local1/ui5/dir";
        let source = path.join(process.cwd(), to);
        Promise.resolve().then(() => {
            return install(fromMock, to);
        }).then(() => {
            let iFiles = glob.sync(`${source}/**/*dbg.js`).length;
            expect(iFiles).to.be.greaterThan(0);
            fs.removeSync(source);
            done();
        }).catch(err => {
            fs.removeSync(source);
            expect.fail(err);
            done();
        })
    });

    it("should recognize a non-existing .zip of a URL", function (done) {
        const {install} = require('../lib/commands'); // reset proxyquired/stubbed functionality
        let from = "http://metalodge.com/doesntexist.zip";
        let to = "local/ui5/dir";
        install(from, to).then(function (expectedErrMsg) {
            expect(expectedErrMsg).to.include("doesn't seem to exist");
            done();
        })
    })
});