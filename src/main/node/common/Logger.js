/*
 *   Copyright (c) 2023 JRichardsz
 *   All rights reserved.

 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 
 *   The above copyright notice and this permission notice shall be included in all
 *   copies or substantial portions of the Software.
 
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 */

const fs = require("fs");
const os = require("os");

var config = {};
var logExist=false;

function Logger() {}

Logger.init = (_config) => {
    if(_config) config = _config;
    if(typeof config.loggerFileLocation !== 'undefined' && config.loggerFileLocation!=""){    
        try {
            fs.readFileSync(config.loggerFileLocation, "utf-8");
            logExist=true;
        }
        catch (e) {
            console.error("logger file does not exist: "+config.loggerFileLocation);
            fs.writeFileSync(config.loggerFileLocation, "");
            logExist=true;
        }
    
    }    
}    

Logger.info = (message) => {

    var dateString = getCurrentDateFormat();
    if(typeof message === 'string'){
        console.log(`${dateString} INFO  - ${message}`);
        writeToLog(`${dateString} INFO  - ${message}`);
    }else{
        console.log(`${dateString} INFO  - `, message);
        writeToLog(`${dateString} INFO  - ${JSON.stringify(message)}`);
    }
    
}

Logger.debug = (message) => {
    if(typeof config.loggerLevel === 'undefined' || config.loggerLevel==="" ||  !config.loggerLevel==="debug" ) return;
    
    var dateString = getCurrentDateFormat();
    if(typeof message === 'string'){
        console.log(`${dateString} DEBUG - ${message}`);
        writeToLog(`${dateString} DEBUG - ${message}`);
    }else{
        console.log(`${dateString} DEBUG - `, message);
        writeToLog(`${dateString} DEBUG - ${JSON.stringify(message)}`);
    }
}

Logger.error = (message) => {
    var dateString = getCurrentDateFormat();
    if(typeof message === 'string'){
        console.error(`${dateString} ERROR - ${message}`);
        writeToLog(`${dateString} ERROR - ${message}`);
    }else{
        console.error(`${dateString} ERROR - `, message);
        writeToLog(`${dateString} ERROR - ${JSON.stringify(message)}`);
    }
    
}

function writeToLog(message){
    if(logExist===false) return;
    if(typeof config.loggerFileLocation === 'undefined') return;
    fs.appendFile(config.loggerFileLocation, message+os.EOL, function (err) {
        if (err) throw err;
    });
}

const getCurrentDateFormat = function() {
    return (new Date()).toLocaleString();;
};

module.exports = Logger;