const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const Logger = require('../../../main/node/common/Logger.js');

describe('Logger', function() {

  it('should work the logger', async function() {
    new Logger();//only for coverage
    Logger.info("im the info")
    Logger.debug("im the debug")
    Logger.info({foo:"bar"})
    Logger.debug({foo:"bar"})
    Logger.error({foo:"bar"})
    Logger.error({foo:"bar"})    
    assert(Logger);
  });

  it('should create the file', async function() {
    var logFile = path.join(os.tmpdir(), uuidv4());
    Logger.init({loggerFileLocation: logFile});
    Logger.info("im the info")
    var logContent = await fs.promises.readFile(logFile, "utf-8");
    console.log(logContent)
    expect(logContent.includes("im the info")).to.eq(true);
  });  

  it('should work the debug', async function() {
    Logger.init({loggerLevel: "debug"});
    Logger.debug("im the debug")    
  });

});