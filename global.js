#!/usr/bin/env node


var path = require("path");
var packagePath = path.resolve(process.env.APPDATA ? process.env.APPDATA : ".", "node_modules");
require('app-module-path').addPath(packagePath);
require('module').Module.globalPaths.push(packagePath);

console.log("microservicebus.node started as Snap");

require("./start.js");
