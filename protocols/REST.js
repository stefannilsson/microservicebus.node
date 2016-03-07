﻿/*
The MIT License (MIT)

Copyright (c) 2014 microServiceBus.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
 
var crypto = require('crypto');
var httpRequest = require('request');
var storage = require('node-persist');
var util = require('../Utils.js');
var guid = require('uuid');

function REST(nodeName, sbSettings) {
    var storageIsEnabled = true;
    var me = this;
    var baseAddress = "https://" + sbSettings.sbNamespace;
    if (!baseAddress.match(/\/$/)) {
        baseAddress += '/';
    }
    //var restMessagingToken = create_sas_token(baseAddress, sbSettings.sasKeyName, sbSettings.sasKey);
    //var restTrackingToken = create_sas_token(baseAddress, sbSettings.trackingKeyName, sbSettings.trackingKey);
    var ttt =this.hubUri
    var restMessagingToken = sbSettings.messagingToken;
    var restTrackingToken = sbSettings.trackingToken;

    REST.prototype.Start = function () {
        stop = false;
        
        // Weird, but unless I thorow away a dummy message, the first message is not picked up by the subscription
        this.Submit("{}", nodeName, "--dummy--");
        
        listenMessaging();
    };
    REST.prototype.Stop = function () {
        stop = true;
    };
    REST.prototype.Submit = function (message, node, service) {
        try {
            if (stop) {
                var persistMessage = {
                    node: node,
                    service: service,
                    message: message
                };
                if (storageIsEnabled)
                    storage.setItem(guid.v1(), persistMessage);
                
                return;
            }
            var submitUri = baseAddress + sbSettings.topic + "/messages" + "?timeout=60"
            
            httpRequest({
                headers: {
                    "Authorization": restMessagingToken, 
                    "Content-Type" : "application/json",
                    "node": node.toLowerCase(),
                    "service" : service
                },
                uri: submitUri,
                json: message,
                method: 'POST'
            }, 
            function (err, res, body) {
                if (err != null) {
                    onQueueErrorSubmitCallback("Unable to send message")
                    var persistMessage = {
                        node: node,
                        service: service,
                        message: message
                    };
                    if (storageIsEnabled)
                        storage.setItem(message.InterchangeId, persistMessage);
                }
                else if (res.statusCode >= 200 && res.statusCode < 300) {
                    // All good
                }
                else if (res.statusCode == 401) { //else if (res.statusCode == 401 && res.statusMessage == '40103: Invalid authorization token signature') {
                    // Outdated token
                    onQueueDebugCallback("Expired token. Updating token...")
                    me.AcquireToken("MICROSERVICEBUS", "MESSAGING", restMessagingToken, function (token) {
                        restMessagingToken = token;
                        me.Submit(message, node, service);
                    })
                    return;
                }
                else {
                    console.log("Unable to send message");
                    var persistMessage = {
                        node: node,
                        service: service,
                        message: message
                    };
                    if (storageIsEnabled)
                        storage.setItem(message.instanceId, persistMessage);
                }
            });

        }
        catch (err) {
            console.log("from this.Submit");
        }
    };
    REST.prototype.Track = function (trackingMessage) {
        try {
            if (stop) {

                if (storageIsEnabled)
                    storage.setItem("_tracking_" + trackingMessage.InterchangeId, trackingMessage);
                
                return;
            }

            var trackUri = baseAddress + sbSettings.trackingHubName + "/messages" + "?timeout=60";
            
            httpRequest({
                headers: {
                    "Authorization": restTrackingToken, 
                    "Content-Type" : "application/json",
                },
                uri: trackUri,
                json: trackingMessage,
                method: 'POST'
            }, 
            function (err, res, body) {
                if (err != null) {
                    onQueueErrorSubmitCallback("Unable to send message. " + err.code + " - " + err.message)
                    console.log("Unable to send message. " + err.code + " - " + err.message);
                    if (storageIsEnabled)
                        storage.setItem("_tracking_" + trackingMessage.InterchangeId, trackingMessage);
                }
                else if (res.statusCode >= 200 && res.statusCode < 300) {
                }
                else if (res.statusCode == 401) {
                    onQueueDebugCallback("Expired tracking token. Updating token...");
                    me.AcquireToken("MICROSERVICEBUS", "TRACKING", restTrackingToken, function (token) {
                        restTrackingToken = token;
                        me.Track(trackingMessage)                    
                    })
                    return;
                }
                else {
                    console.log("Unable to send message. " + res.statusCode + " - " + res.statusMessage);

                }
            });

        }
        catch (err) {
            console.log();
        }
    };

    function listenMessaging() {
        try {
            if (stop) {
                onQueueDebugCallback("Queue listener is stopped");
                
                return;
            }
            var listenUri = baseAddress + sbSettings.topic + "/Subscriptions/" + nodeName + "/messages/head" + "?timeout=60"
            
            httpRequest({
                headers: {
                    "Authorization": restMessagingToken, 
                },
                uri: listenUri,
                method: 'DELETE'
            }, 
            function (err, res, body) {
                
                if (err != null) {
                    onQueueErrorReceiveCallback("Unable to receive message. " + err.code + " - " + err.message);
                    console.log("Unable to receive message. " + err.code + " - " + err.message);
                }
                else if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        if (res.statusCode == 204) {
                            listenMessaging();
                            return;
                        }
                        var service = res.headers.service.replace(/"/g, '');
                        if (service != "--dummy--") {
                            
                            var message = JSON.parse(res.body);
                            var responseData = {
                                body : message,
                                applicationProperties: { value: { service: service } }
                            }
                            onQueueMessageReceivedCallback(responseData);
                        }
                    }
                    catch (listenerror) {
                        console.log("Unable to parse incoming message. " + listenerror.code + " - " + listenerror.message);
                    }
                }
                else if (res.statusCode == 401) {
                    // Outdated token
                    onQueueDebugCallback("Expired token. Updating token...")
                    me.AcquireToken("MICROSERVICEBUS", "MESSAGING", restMessagingToken, function (token) {
                        restMessagingToken = token;
                        listenMessaging();
                    })
                    
                    return;
                }
                else {
                    console.log("Unable to send message. " + res.statusCode + " - " + res.statusMessage);
                }
                listenMessaging();
            });

        }
        catch (err) {
            console.log(err);
        }
    }
}
module.exports = REST;