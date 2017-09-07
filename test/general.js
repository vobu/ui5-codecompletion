const path = require('path');
const expect = require('chai').expect;

const { spawnSync } = require('child_process');

it('should show a hint if called with no commands/options', function () {

    const ui5cc = path.join(process.cwd(), "bin/index.js");
    const child = spawnSync(ui5cc, {
        stdio: 'pipe',
        encoding: 'utf-8'
    });

    expect(child.stderr).not.to.be.empty;
    expect(child.stderr).to.include('at least one command');
});     

it('should show usage information if called with either -h or --help', function() {
    function expectations(stderr, stdout) {
        "use strict";
        expect(stderr).to.be.empty;
        expect(stdout).to.include('Usage: ui5-codecompletion')
            .and.include('install [from]')
            .and.include('configure');
    }
    
    const ui5cc_h = path.join(process.cwd(), "bin/index.js");
    const child_h = spawnSync(ui5cc_h, ["-h"], {
        stdio: 'pipe',
        encoding: 'utf-8'
    });
    expectations(child_h.stderr, child_h.stdout);

    const ui5cc_help = path.join(process.cwd(), "bin/index.js");
    const child_help = spawnSync(ui5cc_help, ["--help"], {
        stdio: 'pipe',
        encoding: 'utf-8'
    });
    expectations(child_help.stderr, child_help.stdout);

});