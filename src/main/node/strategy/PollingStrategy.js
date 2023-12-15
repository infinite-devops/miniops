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

// https://stackoverflow.com/questions/32596102/node-js-cancel-settimeout-from-an-event

const logger = require('../common/Logger.js');
const DevopsTask = require('../core/DevopsTask.js');
const ShellHelper = require('../common/ShellHelper.js');
const Pipeline = require('../core/Pipeline.js');
var cron = require('cron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
var cronParser = require('cron-parser');

function PollingStrategy(){

    var timer;

    this.start = async(devopsSettings, notificationSettings) => {

        logger.info("PullingStrategy starting")

        if(typeof devopsSettings.cronExpression === 'undefined'){
            logger.error("cron_expression parameter is required")
            return;
        }     
        
        var shellHelper = new ShellHelper();
        var pipeline = new Pipeline();
        var devopsTask = new DevopsTask(shellHelper, pipeline);

        var interval = cronParser.parseExpression(devopsSettings.cronExpression);
        var lossDuringItereation = 500;
        var first = true;
        async function polling() {
          if(first===true){
            first = false;
            devopsTask.start(devopsSettings, notificationSettings);  
          }else{            
            var now = new Date();
            var next = interval.next();
            if((next.getTime()-now.getTime())< lossDuringItereation){
              devopsTask.start(devopsSettings, notificationSettings);  
            }
          }
          timer = setTimeout(polling, lossDuringItereation);
        }
      
        polling();
    }

    this.stop = async () => {
        if(timer) clearTimeout(timer);
    }      

}

module.exports = PollingStrategy;