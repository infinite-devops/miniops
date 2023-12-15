const logger = require("../../../../main/node/common/Logger.js");
const os = require("os");
var chai = require("chai");
const path = require("path");
var expect = chai.expect;
var assert = chai.assert;
var Pipeline = require("../../../../main/node/core/Pipeline.js");
const testSmtpServer = require("test-smtp-server").testSmtpServer;

describe("Pipeline", function () {
  it("should execute a simple yaml", async function () {
    var pipeline = new Pipeline();
    var response = await pipeline.executeFile(
      path.join(__dirname, os.platform() + "_pipeline_simple.yaml")
    );
    logger.info(response);
    expect(response.stdout.includes(new Date().getFullYear())).to.equal(true);
  });
  it("should execute a script with several lines", async function () {
    var pipeline = new Pipeline();
    var response = await pipeline.executeFile(
      path.join(__dirname, os.platform() + "_pipeline_several_lines.yaml")
    );
    logger.info(response);
    expect(response.stdout.includes("package.json")).to.equal(true);
  });

  it("should catch the error", async function () {
    var pipeline = new Pipeline();
    var response = await pipeline.executeFile(
      path.join(__dirname, "pipeline_with_error.yaml")
    );

    if (os.platform() === "win32") {
      expect(response.code).to.equal(1);
      expect(response.step).to.equal("aaaa");
      expect(response.stderr.includes("'foo' is not recognized")).to.equal(
        true
      );
    } else if (os.platform() === "linux") {
      expect(response.code).to.equal(127);
      expect(response.step).to.equal("aaaa");
      expect(response.stderr.includes("foo: not found")).to.equal(true);
    }
  });

  it("should parse the key value variables", async function () {
    var pipeline = new Pipeline();
    var response = await pipeline.executeFile(
      path.join(__dirname, os.platform() + "_pipeline_propage_key_value.yaml")
    );
    logger.info(response);
    expect(response.code).to.equal(0);
    expect(response.finalVariables.baz).to.equal("bar");
    expect(response.finalVariables.foo).to.equal("bar");
  });

  it("should execute a simple code", async function () {
    var pipeline = new Pipeline();
    var response = await pipeline.executeFile(
      path.join(__dirname, "pipeline_code_simple.yaml")
    );
    logger.info(response);
    expect(response.code).to.equal(0);
    expect(response.finalVariables.bar).to.equal(3);
    expect(response.finalVariables.foo).to.equal(2);
  });

  it("should execute a simple code with skipError", async function () {
    var pipeline = new Pipeline();
    var response = await pipeline.executeFile(
      path.join(__dirname, os.platform() + "_pipeline_simple_with_error.yaml")
    );
    logger.info(response);
    expect(response.code).to.equal(0);
    expect(response.stdout.includes(new Date().getFullYear())).to.equal(true);
  });

  it("should send the mails: start and error", async function () {
    const smtpserver = new testSmtpServer({
      localhostOnly: true,
      debug: false,
      smtpPort: 2526,
    });

    smtpserver.startServer();

    var pipeline = new Pipeline();
    var response = await pipeline.executeFile(
      path.join(__dirname, "pipeline_with_error_and_mail.yaml"),
      { repositoryName: "acme-api" },
      {
        smtpHost: "localhost",
        smtpPort: 2526,
        smtpUser: "foo",
        smtpPassword: "****",
        smtpSecure: "true",
        rejectUnauthorized: "false",
        from: "foo@mail.com",
      },
      666
    );

    // console.log(response);
    const mails = smtpserver.getEmails();
    await smtpserver.stopServer();
    expect(mails.length).to.eq(2)
    
    var rawMail1Content = mails[0].buffer.toString();
    expect(rawMail1Content.includes("Subject: Build #666: acme-api - started")).to.eq(true)

    var rawMail2Content = mails[1].buffer.toString();
    expect(rawMail2Content.includes("Subject: Build #666: acme-api - failed")).to.eq(true)
    //should contain the error
    expect(rawMail2Content.includes("foo: not found")).to.eq(true)
    
  });

  it("should send the mails: start and completed", async function () {
    const smtpserver = new testSmtpServer({
      localhostOnly: true,
      debug: false,
      smtpPort: 2526,
    });

    smtpserver.startServer();

    var pipeline = new Pipeline();
    var response = await pipeline.executeFile(
      path.join(__dirname, "pipeline_with_success_and_mail.yaml"),
      { repositoryName: "acme-api" },
      {
        smtpHost: "localhost",
        smtpPort: 2526,
        smtpUser: "foo",
        smtpPassword: "****",
        smtpSecure: "true",
        rejectUnauthorized: "false",
        from: "foo@mail.com",
      },
      666
    );

    // console.log(response);
    const mails = smtpserver.getEmails();
    await smtpserver.stopServer();
    expect(mails.length).to.eq(2)
    
    var rawMail1Content = mails[0].buffer.toString();
    expect(rawMail1Content.includes("Subject: Build #666: acme-api - started")).to.eq(true)

    var rawMail2Content = mails[1].buffer.toString();
    expect(rawMail2Content.includes("Subject: Build #666: acme-api - success")).to.eq(true)
    
  });  
});
