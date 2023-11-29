var chai = require('chai');
const path = require('path');
var expect = chai.expect;var assert = chai.assert;
var Pipeline = require('../../../../main/node/core/Pipeline.js');

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

  it('should catch the error', async function() {
    var pipeline = new Pipeline();
    var response = await pipeline.executeFile(path.join(__dirname, "pipeline_with_error.yaml"));
    expect(response.code).to.equal(1);
    expect(response.step).to.equal('aaaa');
    expect(response.stderr.includes("'foo' is not recognized")).to.equal(true);
  });

  it('should parse the key value variables', async function() {
    var pipeline = new Pipeline();
    var response = await pipeline.executeFile(path.join(__dirname, "pipeline_propage_key_value.yaml"));
    console.log(response)
    expect(response.code).to.equal(0);
    expect(response.finalVariables.baz).to.equal("bar");
    expect(response.finalVariables.foo).to.equal("bar");
  });

  it('should execute a simple code', async function() {
    var pipeline = new Pipeline();
    var response = await pipeline.executeFile(path.join(__dirname, "pipeline_code_simple.yaml"));
    console.log(response)
    expect(response.code).to.equal(0);
    expect(response.finalVariables.bar).to.equal(3);
    expect(response.finalVariables.foo).to.equal(2);
  });

  it('should execute a simple code with skipError', async function() {
    var pipeline = new Pipeline();
    var response = await pipeline.executeFile(path.join(__dirname, "pipeline_simple_with_error.yaml"));
    console.log(response)
    expect(response.code).to.equal(0);
    expect(response.stdout.includes(new Date().getFullYear())).to.equal(true);
  });  

});
