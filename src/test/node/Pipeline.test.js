var chai = require('chai');
const path = require('path');
var expect = chai.expect;var assert = chai.assert;
var Pipeline = require('../../main/node/Pipeline.js');

describe('Pipeline', function() {
  it('should execute a simple yaml', async function() {
    var pipeline = new Pipeline();
    var response = await pipeline.executeFile(path.join(__dirname, "pipeline_simple.yaml"));
    console.log(response)
    expect(response.stdout.includes(new Date().getFullYear())).to.equal(true);
  });
  it('should execute a script with several lines', async function() {
    var pipeline = new Pipeline();
    var response = await pipeline.executeFile(path.join(__dirname, "pipeline_several_lines.yaml"));
    console.log(response)
    expect(response.stdout.includes("package.json")).to.equal(true);
  });

});
