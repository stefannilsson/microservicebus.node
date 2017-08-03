#!/usr/bin/env node
/*
var homeDirectory = ".";
var path = require("path");
var module = require('module').Module;

// Check if node is started as Snap
if (process.argv[1].endsWith("startsnap")) {
    console.log("Loading microservicebus.core/package.json for snap");
    homeDirectory = ".";
}

var packagePath = path.resolve(homeDirectory, "node_modules");
require('app-module-path').addPath(packagePath);
module.globalPaths.push(packagePath);
//require.main.paths.push(packagePath);

module._initPaths();
*/

var m = require('module');
console.log(process.argv);

var path = require("path");

console.log('****************************');

console.log('Before');
for (var i = 0; i < require.main.paths.length; i++) {
    console.log(require.main.paths[i]);
}
console.log('****************************');

console.log("process.env.APPDATA: " + process.env.APPDATA);
console.log("process.env.HOME: " + process.env.HOME);
console.log("process.env.PWD: " + process.env.PWD);
console.log("__dirname: " + __dirname);
console.log(".: " + path.resolve("."));

packagePath = path.resolve(".", "node_modules");
console.log('packagePath: ' + packagePath);

require('app-module-path').addPath(packagePath);
require('module').Module.globalPaths.push(packagePath);

console.log('After');
for (var i = 0; i < require.main.paths.length; i++) {
    console.log(require.main.paths[i]);
}

console.log("microservicebus.node started as Snap");

require("./start.js");
