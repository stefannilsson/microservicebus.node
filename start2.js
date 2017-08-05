#!/usr/bin/env node


var m = require('module');
var path = require("path");
require('colors');


console.log('****************************');

console.log('Before');
for (var i = 0; i < require.main.paths.length; i++) {
    console.log(require.main.paths[i]);
}
console.log('****************************');

packagePath = path.resolve(".", "node_modules");
console.log('packagePath: ' + packagePath);

require('app-module-path').addPath(packagePath);
require('module').Module.globalPaths.push(packagePath);
console.log('****************************');

console.log('After');
for (var i = 0; i < require.main.paths.length; i++) {
    console.log(require.main.paths[i]);
}
console.log('****************************');
var util = require('./lib/Utils.js');
var thermometer;

util.addNpmPackage("microservicebus.core@beta", true, function (err) {
    if (err) {
        console.log("Unable to install core update".bgRed.white);
        console.log("Error: " + err);
    }
    else {
        console.log("Core installed successfully".bgRed.white);

        var zzz = require("microservicebus.core");
        console.log("isnull: " + zzz == null);
    }
});