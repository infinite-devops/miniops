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

const os = require('os');
var chai = require('chai');
const path = require('path');
const sinon = require('sinon');
var expect = chai.expect;var assert = chai.assert;
var DevopsTask = require('../../../main/node/core/DevopsTask.js');
const ShellHelper = require('../../../main/node/common/ShellHelper.js');
const Pipeline = require('../../../main/node/core/Pipeline.js');
const { v4: uuidv4 } = require('uuid');

describe('DevopsTask', function() {
  it('should work', async function() {
    var shellHelperMock = new function(){
      this.executeSingleLine = async (rawStatement) => {
        return {stdout: `aaaa refs/heads/develop`}
      }
    };

    var pipelineMock = new function(){
      this.executeFile = async (rawStatement) => {
        return {stdout: `foo`, change: true}
      }
    };    
    var devopsTask = new DevopsTask(shellHelperMock, pipelineMock);

    var response = await devopsTask.start("foo/bar.git", uuidv4(), "/some/unicorn.yaml");
    console.log(response)
    expect(response.changed).to.equal(true);
    expect(response.stdout).to.equal("foo");
  });

  it('real test : win32', async function() {

    if(os.platform()!=="win32"){
      return;
    }  

    var shellHelper = new ShellHelper();
    var pipeline = new Pipeline();
    var devopsTask = new DevopsTask(shellHelper, pipeline);

    var response = await devopsTask.start("http://192.168.0.46:6000/asp-wacala", "develop", path.join(__dirname, "real_001.yaml"));
    expect(response.finalVariables.rawPayload.includes('"demo1" successfully started')).to.equal(true);
  }); 

});
