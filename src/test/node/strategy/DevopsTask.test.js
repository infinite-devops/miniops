var chai = require('chai');
const path = require('path');
const sinon = require('sinon');
var expect = chai.expect;var assert = chai.assert;
var DevopsTask = require('../../../main/node/strategy/DevopsTask.js');
const ShellHelper = require('../../../main/node/common/ShellHelper.js');
const Pipeline = require('../../../main/node/Pipeline.js');
const { v4: uuidv4 } = require('uuid');

describe.only('DevopsTask', function() {
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

});
