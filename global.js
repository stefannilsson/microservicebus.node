#!/usr/bin/env node

var path = require("path");
var packagePath = path.resolve("~/", "node_modules");
console.log('packagePath: ' + packagePath);
require('app-module-path').addPath(packagePath);
require('module').globalPaths.push(packagePath);
require('module')._initPaths();
require("./start.js");
