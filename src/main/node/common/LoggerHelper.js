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

const origlog = console.log;

const defaultOptions = Object.freeze(
    {
        logDate: true,
        logDateFormat: 'toLocaleString', // Date format is actually the format-function-name in which user wants to convert the date
        enableAll: true,
        enableLog: true,
        enableLogI: true,
        enableLogD: false ,
        enableLogE: true,
        logCustomPrefix: '', // accepts any string of length < 1000
        logDateThenPrefix: true,
        debugPrefix: 'DEBUG',
        infoPrefix: 'INFO ',
        errorPrefix: 'ERROR',
        stopLogging: false // stop this logging with format, only console.log() & log() can be used as usual logging
    }
);
let logConfig  = {};
console.resetLogger = function() {
    logConfig = JSON.parse(JSON.stringify(defaultOptions));
};
console.resetLogger();

const getCurrentDateFormat = function() {
    var dateStr = new Date().toLocaleString(); // default date format
    if (logConfig && logConfig.logDateFormat && typeof logConfig.logDateFormat === 'string') {
        switch (logConfig.logDateFormat.toLowerCase()) {
            case 'todatestring':
                dateStr = (new Date()).toDateString();
                break;
            case 'togmtstring':
                dateStr = (new Date()).toGMTString();
                break;
            case 'toisostring':
                dateStr = (new Date()).toISOString();
                break;
            case 'tojson':
                dateStr = (new Date()).toJSON();
                break;
            case 'tolocaledatestring':
                dateStr = (new Date()).toLocaleDateString();
                break;
            case 'todatestring':
                dateStr = (new Date()).toLocaleTimeString();
                break;
            case 'tostring':
                dateStr = (new Date()).toString();
                break;
            case 'totimestring':
                dateStr = (new Date()).toTimeString();
                break;
            case 'toutcstring':
                dateStr = (new Date()).toUTCString();
                break;
            default:
                // dateStr = (new Date()).toLocaleString();
            break;
        }
    }
    return dateStr + ' ';
};

const getDatePrefix = function(prefix) {
    var datePrefix = '';
    var dateString = '';
    if (logConfig && logConfig.enableAll) {
        if (logConfig.logDate) {
            dateString = getCurrentDateFormat();
        }
        datePrefix = logConfig.logDateThenPrefix ? (dateString + prefix + ' ') : (prefix + ' ' + dateString);
    }
    return datePrefix + ' ';
};

console.log = function (obj, ...argumentArray) {
    if (logConfig && !logConfig.stopLogging) {
        var datePrefix = (logConfig && logConfig.enableLogI) ?
                        getDatePrefix(logConfig.infoPrefix) :
                        '';
        if (typeof obj === 'string') {
            argumentArray.unshift(datePrefix + obj);
        } else {
            argumentArray.unshift(obj);
            argumentArray.unshift(datePrefix);
        }
        origlog.apply(this, argumentArray);
    }
};

console.debug = function (obj, ...argumentArray) {
    if(!process.env.LOGGER_LEVEL==="debug")return;
    
    if (logConfig && !logConfig.stopLogging) {
        var datePrefix = (logConfig && logConfig.enableLogD) ?
                     getDatePrefix(logConfig.debugPrefix) :
                     '';
        if (typeof obj === 'string') {
            argumentArray.unshift(datePrefix + obj);
        } else {
            argumentArray.unshift(obj);
            argumentArray.unshift(datePrefix);
        }
        origlog.apply(this, argumentArray);
    }
};

console.info = function (obj, ...argumentArray) {
    if (logConfig && !logConfig.stopLogging) {
        var datePrefix = (logConfig && logConfig.enableLogI) ?
                        getDatePrefix(logConfig.infoPrefix) :
                        '';
        if (typeof obj === 'string') {
            argumentArray.unshift(datePrefix + obj);
        } else {
            argumentArray.unshift(obj);
            argumentArray.unshift(datePrefix);
        }
        origlog.apply(this, argumentArray);
    }
};

console.error = function (obj, ...argumentArray) {
    if (logConfig && !logConfig.stopLogging) {
        var datePrefix = (logConfig && logConfig.enableLogE) ?
                        getDatePrefix(logConfig.errorPrefix) :
                        '';
        if (typeof obj === 'string') {
            argumentArray.unshift(datePrefix + obj);
        } else {
            // This handles console.log( object )
            argumentArray.unshift(obj);
            argumentArray.unshift(datePrefix);
        }
        origlog.apply(this, argumentArray);
    }
};

module.exports.log = console.log;
module.exports.logInfo = console.logI;
module.exports.logDebug = console.logD;
module.exports.logEerror = console.logE;
module.exports.logConfig = logConfig;
module.exports.resetLogger = console.resetLogger;

console.log('*override-console-log* is loaded');
