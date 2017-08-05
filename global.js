#!/usr/bin/env node


var packagePath = '/home/admin/node_modules';
process.env.NODE_PATH = packagePath;
process.env.HOME = packagePath;
require('module')._initPaths();


//require('app-module-path').addPath('/home/admin/node_modules');

//var path = require("path");
//var packagePath = path.resolve(".", "node_modules");

//console.log('packagePath: ' + packagePath);
//require('app-module-path').addPath(packagePath);
//require('module').globalPaths.push(packagePath);
//require('module')._initPaths();
require("./start.js");
