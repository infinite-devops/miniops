var chai = require('chai');
var assert = chai.assert;

describe('Logger', function() {

  it('should work the logger', async function() {
    var Logger = require('../../../main/node/common/Logger.js');
    new Logger();
    Logger.info("im the info")
    Logger.debug("im the debug")
    Logger.info({foo:"bar"})
    Logger.debug({foo:"bar"})
    assert(Logger);
  });
});
