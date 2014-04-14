/**
 * Copyright 2013 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var events = require("./events");
var server = require("./server");
var nodes = require("./nodes");
var library = require("./library");
var settings = null;

var path = require('path');

process.env.NODE_RED_HOME = process.env.NODE_RED_HOME || path.resolve(__dirname+"/..");

var events = require("events");

var RED = {

    init: function(httpServer,userSettings) {
        settings = userSettings;
        server.init(httpServer,settings);
        library.init();
        return server.app;
    },

    start: server.start,
    stop: server.stop,
    nodes: nodes,
    library: library,
    events: events
};

RED.__defineGetter__("app", function() { console.log("Deprecated use of RED.app - use RED.httpAdmin instead"); return server.app });
RED.__defineGetter__("httpAdmin", function() { return server.app });
RED.__defineGetter__("httpNode", function() { return server.nodeApp });
RED.__defineGetter__("server", function() { return server.server });
RED.__defineGetter__("settings", function() { return settings });

module.exports = RED;
