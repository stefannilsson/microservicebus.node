#!/usr/bin/env node


var path = require("path");
var os = require('os');

var packagePath = path.resolve(os.homedir(), 'node_modules');
process.env.NODE_PATH = packagePath;
process.env.HOME = os.homedir();

if (process.argv.indexOf("--debug")) {
    process.env.NODE_DEBUG = "module";
}

console.log('Before');
for (var i = 0; i < require.main.paths.length; i++) {
    console.log(require.main.paths[i]);
}
console.log('****************************');

packagePath = path.resolve(".", "node_modules");
console.log('packagePath: ' + packagePath);

require('app-module-path').addPath(packagePath);
require('module').globalPaths.push(packagePath);

console.log();
console.log('****************************');

console.log('After (require.main.paths)');
for (var i = 0; i < require.main.paths.length; i++) {
    console.log(require.main.paths[i]);
}
console.log();
console.log('After (globalPaths)');
for (var i = 0; i < require('module').globalPaths.length; i++) {
    console.log(require('module').globalPaths[i]);
}

console.log('****************************');
console.log();

//process.env.NODE_PATH = packagePath;
//process.env.HOME = os.homedir();

//require('app-module-path').addPath(packagePath);
//require('module').globalPaths.push(packagePath);

//require('module')._initPaths();
//module.paths.unshift(packagePath);

require('colors');

//require('app-module-path').addPath('/home/admin/node_modules'); 

//var path = require("path");
//var packagePath = path.resolve(".", "node_modules");

//console.log('packagePath: ' + packagePath);
//require('app-module-path').addPath(packagePath);
//require('module').globalPaths.push(packagePath);
//require('module')._initPaths();

require("./start.js");
