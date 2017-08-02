#!/usr/bin/env node

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

console.log("microservicebus.node started as Snap");

require("./start.js");
