const logger = require('../../../main/node/common/Logger.js');
var os = require('os');
var chai = require('chai');
var expect = chai.expect;var assert = chai.assert;
var ShellHelper = require('../../../main/node/common/ShellHelper.js');

describe('ShellHelper', function() {
  it('should execute a single line', async function() {
    var shellHelper = new ShellHelper();
    if(os.platform()==="win32"){
      var response = await shellHelper.executeSingleLine("dir /a /b");
      expect(response.stdout.includes("package.json")).to.equal(true);
    }else if(os.platform()==="linux"){
      var response = await shellHelper.executeSingleLine("ls -la");
      expect(response.stdout.includes("package.json")).to.equal(true);
    }    
  });

  it('should stop if is started the iis site', async function() {
    var shellHelper = new ShellHelper();
    var status;
    if(os.platform()==="win32"){
      try{
        var rawStatus = await shellHelper.executeSingleLine(`%systemroot%/system32/inetsrv/appcmd list site /name:"unmundosincsharp"`);
        logger.info(rawStatus)
        status = /state:[^\)]+/.exec(rawStatus.stdout)[0].split(":")[1]
      }catch(err){
        logger.info(err)
        status="unknown"
      }
      if(status=="Started"){
        var response = await shellHelper.executeSingleLine(`%systemroot%/system32/inetsrv/appcmd stop site /site.name:unmundosincsharp`);
        logger.info(response)
        expect(response.stdout.includes("successfully stopped")).to.equal(true);
      }
    }else if(os.platform()==="linux"){
      logger.debug("coming soon")
    }
  });

  it('should execute one line as multiple lines', async function() {
    var shellHelper = new ShellHelper();

    if(os.platform()==="win32"){
      var response = await shellHelper.executeSeveralLines(`ipconfig | findstr /i "ipv4"`);
      logger.info(response)
      expect(response.stdout.includes("192.168")).to.equal(true);
    }else if(os.platform()==="linux"){
      var response = await shellHelper.executeSeveralLines(`hostname -I`);
      logger.info(response)
      expect(response.stdout.includes("192.168")).to.equal(true);
    }  

  });

  it('should execute multiple lines', async function() {
    var shellHelper = new ShellHelper();
    if(os.platform()==="win32"){
      var response = await shellHelper.executeSeveralLines(`
      date /t 
      ipconfig | findstr /i "ipv4"
      `);
      logger.info(response)
      expect(response.stdout.includes("192.168")).to.equal(true);        
    }else if(os.platform()==="linux"){
      var response = await shellHelper.executeSeveralLines(`
      ls -la
      hostname -I
      `);
      logger.info(response)
      expect(response.stdout.includes("192.168")).to.equal(true);
    }
  });

});
