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

const DevopsTask = require('./core/DevopsTask.js');
const ShellHelper = require('./common/ShellHelper.js');
const Pipeline = require('./core/Pipeline.js');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.type('text/plain');
  res.send('Hell , its about time!!');
});

var shellHelper = new ShellHelper();
var pipeline = new Pipeline();
var devopsTask = new DevopsTask(shellHelper, pipeline);

const job = schedule.scheduleJob('*/15 * * * * *', async function(){
    require('./common/LoggerHelper.js');
    console.log('\n\nrunning job every 15 seconds');
    var tinyDevopsStatusLocation = path.join(process.env.INIT_CWD, "tiny-devops.txt")
    var tinyDevopsStatus;
    try {
        tinyDevopsStatus = await fs.promises.readFile(tinyDevopsStatusLocation, "utf-8");
    }
    catch (e) {
        console.debug(e);
    }

    if(tinyDevopsStatus==="in-progress"){
        console.log("Another job is in progress")
        return;
    }
    
    try {
        await fs.promises.writeFile(tinyDevopsStatusLocation, "in-progress");
    }
    catch (e) {
        throw e;
    }

    var response = await devopsTask.start(process.env.GIT_URL, process.env.GIT_BRANCH, process.env.YAML_LOCATION);  

    try {
        await fs.promises.writeFile(tinyDevopsStatusLocation, response.code==0?"completed": "failed");
    }
    catch (e) {
        throw e;
    }

    console.log("completed")
});

app.listen(process.env.PORT || 9000);