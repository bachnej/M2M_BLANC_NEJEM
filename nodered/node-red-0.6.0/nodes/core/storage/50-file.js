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

var RED = require(process.env.NODE_RED_HOME+"/red/red");
var fs = require("fs");

function FileNode(n) {
    RED.nodes.createNode(this,n);

    this.filename = n.filename;
    this.appendNewline = n.appendNewline;
    this.overwriteFile = n.overwriteFile;
    var node = this;
    this.on("input",function(msg) {
        var filename = msg.filename || this.filename;

        if (filename == "") {
            node.warn('No filename specified');
        } else {
            var data = msg.payload;
            if (this.appendNewline) {
                data += "\n";
            }
            if (msg.hasOwnProperty('delete')) {
                fs.unlink(filename, function (err) {
                    if (err) node.warn('Failed to delete file : '+err);
                    //console.log('Deleted file",filename);
                });
            }
            else {
                if (this.overwriteFile) {
                    fs.writeFile(filename, data, function (err) {
                        if (err) node.warn('Failed to write to file : '+err);
                        //console.log('Message written to file',filename);
                    });
                }
                else {
                    fs.appendFile(filename, data, function (err) {
                        if (err) node.warn('Failed to append to file : '+err);
                        //console.log('Message appended to file',filename);
                    });
                }
            }
        }
    });
}
RED.nodes.registerType("file",FileNode);
