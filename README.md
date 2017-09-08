# UI5 codecompletion

[![Build Status](https://travis-ci.org/vobujs/ui5-codecompletion.svg?branch=develop)](https://travis-ci.org/vobujs/ui5-codecompletion) 
[![npm Package](https://img.shields.io/npm/v/ui5-codecompletion.svg)](https://www.npmjs.com/package/ui5-codecompletion)

`ui5-codecompletion` is a npm module providing a CLI that enables code completion in WebStorm's JS editor for a 
specific version of [(open)UI5](https://openui5.org). 

[](doc/usage.gif)

* [Installation](#installation)
* [Usage](#usage)
  * [download, install and configure UI5 LTS version](#download-install-and-configure-ui5-lts-version)
  * [download a custom version to a custom location and install and configure it for code completion](#download-a-custom-version-to-a-custom-location-and-install-and-configure-it-for-code-completion)
  * [configure existing UI5 lib for use with code completion](#configure-existing-ui5-lib-for-use-with-code-completion)
* [FAQ](#faq)
* [Related](#related)
* [Contributors](#contributors)

## Installation
    npm install -g ui5-codecompletion
    
Yes, global install is recommended so you can install/configure code completion in any project.   
Still, local install `npm install ui5-codecompletion` will of course provide you `node_modules/.bin/ui5-codecompletion`.
    
## Usage
    $~ > ui5-codecompletion -h
    Usage: ui5-codecompletion <command> [options]
    
    Commands:
      configure [sourceDir]  uses the extracted UI5 library in $project/
      install [from] [to]    downloads (if URL) or copies (if fs path) and
                             configures a UI5 runtime library for code completion
    
    Options:
      -h, --help       Show help                                           [boolean]
      -f, --from       URL or file system path to zip-file w/ UI5 runtime sources,
                       defaults to
                       "https://openui5.hana.ondemand.com/downloads/openui5-runtime-
                       1.44.19.zip"
      -t, --to         file system path, relative to $project_dir, to store UI5
                       sources in; defaults to "$project/.ui5"
      -s, --sourceDir  file system path, relative to $project_dir, to configure code
                       completion with; defaults to "$project/.ui5"
    
    Examples:
      ui5-codecompletion install                downloads and configures UI5 with
                                                default options
      ui5-codecompletion install                installs UI5 from the specified URL
      --from=https://url/openui5-runtime.zip    to $project/.ui5
      ui5-codecompletion install \              installs UI5 from the URL pointing
      > -f=https://url/openui5-runtime.zip \    to the .zip, to
      > -t=ui5/sources/local                    $project/ui5/sources/local
      ui5-codecompletion configure              uses UI5 sources in
                                                $project/.ui5 to configure code
                                                completion
      ui5-codecompletion configure              uses UI5 sources in
      --sourceDir=my/relative/dir/ui5           $project/my/relative/dir/ui5 to
                                                configure code completion
      ui5-codecompletion configure -s=dir/ui5   uses UI5 sources in
                                                $project_dir/dir/ui5 to configure
                                                code completion


### download, install and configure UI5 LTS version
```
$~/your/app> ui5-codecompletion install
```
for downloading the most recent long term support runtime version of UI5,   
storing it in `.ui5` of your project and    
preparing those sources for code completion.   
(other options available, see above)

Then, tell WebStorm to use the library in your project.  
(***this configuration is necessary, but only once***)   
Open "Libraries in Scope" dialog:   
[](doc/ws-scope.png)   

Check "LocalUI5Library" and "Manage Scopes":   
[](doc/ws-scope1.png)   

Select/Add the directory of your project code completion should apply to 
via selecting "LocalUI5Library" in "Library" drop-down:   
[](doc/ws-scope1.png)

### download a custom version to a custom location and install and configure it for code completion
```
$~/your/app> ui5-codecompletion install --from=https://example.org/ui5.zip --to=local/lib
```
for downloading your custom UI5 version to `~/your/app/local/lib` and use these sources for code completion.      
(see above one-time config instructions if running `ui5-codecompletion` for the first time)

### configure existing UI5 lib for use with code completion
```
$~/your/other/app> ui5-codecompletion configure --sourcedir=extracted/UI5/sources
```
will look for a `resources` folder in `~/your/other/app/extracted/UI5/sources` and use 
all `*.dbg.js` UI5 files in there for code completion.   
(see above one-time config instructions if running `ui5-codecompletion` for the first time)

## FAQ
### Why [openUI5](https://openui5.org) only and not [SAPUI5](https://sapui5.hana.ondemand.com/) as well?
Because downloading [SAPUI5](https://sapui5.hana.ondemand.com/) requires checking of a disclaimer in the UI and
we were too lazy to script that. PR welcome!
### Can I have multiple UI5 versions installed/configure in a project?
Theoretically yes. Practically no, as it's not implemented - a single XML file is fed to WebStorm's scoping mechanism, 
so only the most current UI5 library provided via `ui5-codecompletion install -f=$url/ui5.zip` or 
`ui5-codecompletion configure -s=local/UI5/lib` is used for code completion.
### Why WebStorm only?
That's the editor we're using. Feel free to port to yours. PR welcome!

## Related
- [UI5 Schemas](https://github.com/ui5experts/ui5-schemas/)  
  for code completion in XML views in WebStorm
- [UI5 helper](https://plugins.jetbrains.com/plugin/9427-ui5-helper)   
  for some comfort navigating inside sources of a UI5 app in WebStorm
  
## Contributors
[<img src="https://avatars0.githubusercontent.com/u/404480?v=4&s=400" width="100px;"/><br /><sub>Constantin Lebrecht</sub>](http://www.js-soft.com)