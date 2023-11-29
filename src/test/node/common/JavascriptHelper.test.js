var chai = require('chai');
var expect = chai.expect;
var JavascriptHelper = require('../../../main/node/common/JavascriptHelper.js');

describe('JavascriptHelper : executeSingleFunction', function() {

  it('should throw an exception if parameters are missing', async function() {
    var ex;
    try{
      var javascriptHelper = new JavascriptHelper();
      await javascriptHelper.executeSingleFunction();
    }catch(e){
      ex = e;
    };
    expect(ex !== undefined, "exception was expected if alias is null").to.eql(true);

    ex;
    try{
      var javascriptHelper = new JavascriptHelper();
      await javascriptHelper.executeSingleFunction("foo");
    }catch(e){
      ex = e;
    };
    expect(ex !== undefined, "exception was expected if script is null").to.eql(true);

  });

  it('should execute a function with math return', async function() {
    var javascriptHelper = new JavascriptHelper();
    var variables = {
      a:5,
      b:6
    }
    var response = await javascriptHelper.executeSingleFunction("foo", "return params.a+params.b;", variables);
    expect(response).to.eql(11);
  });

  it('should execute a function with string return', async function() {
    var javascriptHelper = new JavascriptHelper();
    var variables = {
      a:"5",
      b:"6"
    }
    var response = await javascriptHelper.executeSingleFunction("foo", "return params.a+params.b;", variables);
    expect(response).to.eql("56");
  });

  it('should execute a function with boolean return', async function() {
    var javascriptHelper = new JavascriptHelper();
    var variables = {
      a:false,
      b:"6"
    }
    var response = await javascriptHelper.executeSingleFunction("foo", "return params.a", variables);
    expect(typeof response).to.eql("boolean");
    expect(response).to.eql(false);
  });
});
