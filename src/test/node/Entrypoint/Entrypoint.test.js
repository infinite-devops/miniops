const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const sinon = require("sinon");
const fs = require("fs");
const path = require("path");
const http = require("http");
const GitServer = require("node-git-server");

const Entrypoint = require("../../../main/node/Entrypoint.js");
const HttpHelper = require("../../../main/node/common/HttpHelper.js");

describe("Entrypoint", function () {

  it("should start the direct", async function () {
    sinon
      .stub(process, "argv")
      .value([
        "/home/foo/.nvm/versions/node/v16.20.2/bin/node",
        "/home/foo/Github/miniops/bin/miniops",
        "--mode=direct",
        "--git_url=http://localhost:6000/bar",
        "--git_branch=master",
        "--yaml_location="+path.join(__dirname, "simple.yaml")
      ]);

    const repos = new GitServer.Git(path.join(__dirname, "git_server_mock"), {
      autoCreate: true,
    });
    const port = 6000;
    const server = http
      .createServer((req, res) => {
        repos.handle(req, res);
      })
      .listen(port);


    var entrypoint = new Entrypoint();
    var response = await entrypoint.start();

    console.log(response);
    expect(response.stdout.includes("im_a_commited_file.txt")).to.eq(true)

    sinon.restore();
  });  
  
  it("should validate an invalid mode", async function () {
    sinon
      .stub(process, "argv")
      .value([
        "/home/foo/.nvm/versions/node/v16.20.2/bin/node",
        "/home/foo/Github/miniops/bin/miniops",
        "--mode=foo"
      ]);

    var initialLog = console.log;
    var initialLogError = console.error;
    var log = [];
    console.log = function (d) {
      log.push(d);
      process.stdout.write(d + "\n");
    };
    console.error = function (d) {
      log.push(d);
      process.stdout.write(d + "\n");
    };

    var entrypoint = new Entrypoint();
    entrypoint.start();

    //restore
    console.log = initialLog;
    console.error = initialLogError;

    console.log(log);
    expect(
      log.slice(-1).pop().includes("--mode has an invalid value")
    ).to.eq(true);

    sinon.restore();
  });  
  
  
  it("should validate the --action param if polling mode is chosen", async function () {

    sinon
      .stub(process, "argv")
      .value([
        "/home/foo/.nvm/versions/node/v16.20.2/bin/node",
        "/home/foo/Github/miniops/bin/miniops",
        "--git_url=http://localhost:6000/bar",
        "--git_branch=master",
        "--yaml_location="+path.join(__dirname, "simple.yaml")
      ]);

    var initialLog = console.log;
    var initialLogError = console.error;
    var log = [];
    console.log = function (d) {
      log.push(d);
      process.stdout.write(d + "\n");
    };
    console.error = function (d) {
      log.push(d);
      process.stdout.write(d + "\n");
    };

    var entrypoint = new Entrypoint();
    entrypoint.start();

    //restore
    console.log = initialLog;
    console.error = initialLogError;

    console.log(log);
    expect(
      log.slice(-1).pop().includes("--action parameter is required")
    ).to.eq(true);

    sinon.restore();

  });  

  it("should not be stopped if is already stopped", async function () {

    var initialLog = console.log;
    var initialLogError = console.error;
    var log = [];
    console.log = function (d) {
      log.push(d);
      initialLog(d);
    };
    console.error = function (d) {
      log.push(d);
      initialLog(d);
    };

    sinon
      .stub(process, "argv")
      .value([
        "/home/foo/.nvm/versions/node/v16.20.2/bin/node",
        "/home/foo/Github/miniops/bin/miniops",
        "--action=stop",
        "--git_url=http://localhost:6000/bar",
        "--git_branch=master",
        "--yaml_location="+path.join(__dirname, "simple.yaml")
      ]);

    var entrypoint = new Entrypoint();
    await entrypoint.start();

    //restore
    console.log = initialLog;
    console.error = initialLogError;

    console.log(log);
    expect(log.slice(-1).pop().includes("miniops is already stopped")).to.eq(true);

    sinon.restore();
  });

});
