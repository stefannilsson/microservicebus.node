﻿'use strict'; /* global describe, it */
var mocha = require('mocha');
var expect = require('chai').expect;
var assert = require('assert');
var request = require('supertest');
var express = require('express');
var should = require('should');
var util = require('../lib/Utils.js');
var fs = require('fs');
const SCRIPTFOLDER = "/../node_modules/microservicebus.core/lib/services/";
var MicroServiceBusHost = require("../lib/microServiceBusHost.js");

process.env.organizationid = "65b22e1f-a17e-432f-b9f2-b7057423a786";

var settings;
var loggedInComplete1;
var microServiceBusHost;

describe('Util functions', function () {
   
    it('padRight should work', function (done) {

        var t = util.padRight("microServiceBus.com", 25, ' ');
        expect(t).to.equal("microServiceBus.com      ");
        done();
    });
    it('padLeft should work', function (done) {

        var t = util.padLeft("microServiceBus.com", 25, ' ');
        expect(t).to.equal("      microServiceBus.com");
        done();
    });
    it('addNpmPackage should work', function (done) {
        this.timeout(10000);
        util.addNpmPackage("colors", true, function (err) {
            if (err)
                throw err;
            util.addNpmPackage("colors", false, function (err) {
                if (err)
                    throw err;
                done();
            });
        });
    });
    it('compare same version should work', function (done) {

        var r = util.compareVersion("1.0.0", "1.0.0")
        expect(r).to.equal(0);
        done();
    });
    it('compare greater version should work', function (done) {

        var r = util.compareVersion("1.0.0", "1.0.1")
        expect(r).to.equal(-1);
        done();
    });
    it('compare earlier version should work', function (done) {

        var r = util.compareVersion("1.0.2", "1.0.1")
        expect(r).to.equal(1);
        done();
    });
});
describe('Encryption/Decryption', function () {
    var dataToEncrypt = "Some data";
    var encryptedBuffer;

    it('Encryption should work', function (done) {
        
        var dataToEncrypt = "Some data";
        encryptedBuffer = util.encrypt(new Buffer(dataToEncrypt), "secret");
        done();
    });
    it('Decryption should work', function (done) {

        var decryptedBuffer = util.decrypt(encryptedBuffer, "secret");
        var str = decryptedBuffer.toString('utf8');

        if (str != dataToEncrypt)
            throw "Encryption/Decryption failed";

        done();
    });
});
describe('Check configuration', function () {
    it('ENV organizationId should be set', function (done) {
        var orgId = process.env.organizationId;
        expect(orgId).to.not.be.null;

        done();
    });
});
describe('Sign in', function () {
   it('Save settings should work', function (done) {

        settings = {
            "hubUri": "wss://microservicebus.com",
            "nodeName": "TestNode1",
            "organizationId": process.env.organizationid,
            "port": 9090
        }
        util.saveSettings(settings);
        done();
    });
   it('Create microServiceBusHost should work', function (done) {
        loggedInComplete1 = false;
        microServiceBusHost = new MicroServiceBusHost(settings);
        expect(microServiceBusHost).to.not.be.null;
        done();
   });
   it('Sign in should work', function (done) {
       this.timeout(10000);
       microServiceBusHost.OnStarted(function (loadedCount, exceptionCount) {
           expect(exceptionCount).to.eql(0);
           expect(loadedCount).to.eql(1);
           done();
       });
       microServiceBusHost.OnStopped(function () {

       });
       microServiceBusHost.OnUpdatedItineraryComplete(function () {

       });
       try {
           microServiceBusHost.Start();

       }
       catch (er) {
           expect(err).to.be.null;
           done();
       }
       
   });
   it('Ping should work', function (done) {
       var r = microServiceBusHost.TestOnPing("test");
       expect(r).to.equal(true);
       done();
   });
   it('Change Debug state should work', function (done) {
       var r = microServiceBusHost.TestOnChangeDebug(true);
       expect(r).to.equal(true);
       done();
   });
   it('Handle Uncaught Exception state should work', function (done) {
       microServiceBusHost.RaiseUncaughtException();
       done();
   });
});
describe('Post Signin', function () {
    it('azureApiAppInboundService.js should exist after login', function (done) {
        var ret = fs.statSync(__dirname + SCRIPTFOLDER + "azureApiAppInboundService.js");
        ret.should.be.type('object');
        
        done();
    });
    it('calling test should work', function (done) {
        this.timeout(5000);
        var url = 'http://localhost:9090';

        request(url)
            .get('/api/data/azureApiAppInboundService1/test')
            .expect('Content-Type', /json/)
            .expect(200)//Status code
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                res.body.should.have.property('result');
                res.body.result.should.equal(true);
                console.log("GET Complete");
                //done();
                request(url)
                    .delete('/api/data/azureApiAppInboundService1/test')
                    .expect('Content-Type', /json/)
                    .expect(200)//Status code
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        res.body.should.have.property('result');
                        res.body.result.should.equal(true);
                        console.log("DELETE Complete");
                        request(url)
                            .post('/api/data/azureApiAppInboundService1/test')
                            .send({ name: 'Manny', species: 'cat' })
                            .expect('Content-Type', /json/)
                            .expect(200)//Status code
                            .end(function (err, res) {
                                if (err) {
                                    throw err;
                                }
                                res.body.should.have.property('result');
                                res.body.result.should.equal(true);
                                console.log("POST Complete");
                                request(url)
                                    .put('/api/data/azureApiAppInboundService1/test')
                                    .send({ name: 'Manny', species: 'cat' })
                                    .expect('Content-Type', /json/)
                                    .expect(200)//Status code
                                    .end(function (err, res) {
                                        if (err) {
                                            throw err;
                                        }
                                        res.body.should.have.property('result');
                                        res.body.result.should.equal(true);
                                        console.log("PUT Complete");
                                        done();
                                    });
                            });
                    });
            });
    });
    it('javascriptaction.js should exist after calling service', function (done) {
        var ret = fs.statSync(__dirname + SCRIPTFOLDER + "javascriptaction.js");
        ret.should.be.type('object');
        done();
    });
    it('ping should work', function (done) {
        var pingResponse = microServiceBusHost.TestOnPing("");
        pingResponse.should.equal(true);
        done();
    });
    it('change debug state should work', function (done) {
        var TestOnChangeDebugResponse = microServiceBusHost.TestOnChangeDebug(false);
        TestOnChangeDebugResponse.should.equal(true);
        done();
    });
});