const logger = require("../../../main/node/common/Logger.js");
const os = require("os");
const chai = require("chai");
const expect = chai.expect;
var assert = chai.assert;
const testSmtpServer = require("test-smtp-server").testSmtpServer;
const MailService = require("../../../main/node/service/MailService.js");

describe("MailService", function () {

  it("should return failed  on error", async function () {
 
    const mailService = new MailService();
    mailService.initialize({
      smtpHost: "localhost",
      smtpPort: 25261,
      from: "foo@mail.com",
      smtpUser: "foo",
      smtpPassword: "bar",
      smtpSecure: "true",
      rejectUnauthorized: "false",
      smtpTlsCiphers: "SSLv3"      
    });
    
    try {
        await mailService.sendMail({
            to: "jane@mail.com",
            subject: "I'm the email",
            html: "<h2>I'm the body</h2>",
          });        
    } catch (error) {
        expect(error.status).to.eq("failed")
    }
    
  });

  it("should send the email", async function () {
    const smtpserver = new testSmtpServer({
      localhostOnly: true,
      debug: false,
      smtpPort: 2526,
    });

    smtpserver.startServer();    
    const mailService = new MailService();
    mailService.initialize({
      smtpHost: "localhost",
      smtpPort: 2526,
      smtpUser: "foo",
      smtpPassword: "****",
      smtpSecure: "true",
      rejectUnauthorized: "false",
      from: "foo@mail.com",
    });
    
    await mailService.sendMail({
      to: "jane@mail.com",
      subject: "I'm the email",
      html: "<h2>I'm the body</h2>",
    });
    
    await smtpserver.stopServer();

    const mails = smtpserver.getEmails();

    console.log(mails[0].buffer.toString());

    /*
    Content-Type: text/html; charset=utf-8
    From: foo@mail.com
    To: jane@mail.com
    Subject: I'm the email
    Message-ID: <4628d87b-2483-428a-0c0b-552409168915@mail.com>
    Content-Transfer-Encoding: 7bit
    Date: Thu, 14 Dec 2023 20:07:08 +0000
    MIME-Version: 1.0
    
    <h2>I'm the body</h2>
    */    

    //last line should contain the mail body
    expect(mails[0].buffer.toString().trim().split("\n").pop()).to.eq("<h2>I'm the body</h2>")
  });  
});
