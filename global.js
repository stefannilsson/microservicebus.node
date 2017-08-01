#!/usr/bin/env node

var homeDirectory = ".";
var path = require("path");
var module = require('module');
// Check if node is started as Snap
if (process.argv[1].endsWith("startsnap")) {
    console.log("Loading microservicebus.core/package.json for snap");
    homeDirectory = process.env["PWD"];
}

var packagePath = path.resolve(process.env.APPDATA ? process.env.APPDATA : homeDirectory, "node_modules");
require('app-module-path').addPath(packagePath);
module.globalPaths.push(packagePath);
module._initPaths();
console.log("microservicebus.node started as Snap");

require("./start.js");
