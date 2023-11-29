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

const logger = require('../common/LoggerHelper.js');
const DevopsTask = require('../core/DevopsTask.js');
const ShellHelper = require('../common/ShellHelper.js');
const Pipeline = require('../core/Pipeline.js');
const schedule = require('node-schedule');
const fs = require('fs');
const os = require('os');
const path = require('path');
var express = require('express');

function PullingStrategy(){

    this.start = async(params) => {
        var app = express();

        app.get('/health', function(req, res) {
          res.type('text/plain');
          res.send('King Bob!');
        });
        
        var shellHelper = new ShellHelper();
        var pipeline = new Pipeline();
        var devopsTask = new DevopsTask(shellHelper, pipeline);
        
        const job = schedule.scheduleJob(params.cron_expression, async function(){
            
            logger.info('\n\Starting job');
            var miniopsStatusLocation = path.join(os.tmpdir(), "miniops.txt")
            var miniopsStatus;
            try {
                miniopsStatus = await fs.promises.readFile(miniopsStatusLocation, "utf-8");
            }
            catch (e) {
                logger.debug(e);
            }
        
            if(miniopsStatus==="in-progress"){
                logger.info("Another job is in progress")
                return;
            }
            
            try {
                await fs.promises.writeFile(miniopsStatusLocation, "in-progress");
            }
            catch (e) {
                throw e;
            }
        
            var response = await devopsTask.start(params.git_url, params.git_branch, params.yaml_location);  
        
            try {
                await fs.promises.writeFile(miniopsStatusLocation, response.code==0?"completed": "failed");
            }
            catch (e) {
                throw e;
            }
        
            logger.info("completed")
        });
        
        app.listen(process.env.PORT || 9000);
    }

}

module.exports = PullingStrategy;