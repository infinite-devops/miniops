const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const sinon = require("sinon");
const fs = require("fs");
const path = require("path");
const http = require("http");
const GitServer = require("node-git-server");
const express = require('express')
const Entrypoint = require("../../../../main/node/Entrypoint.js");

describe("Entrypoint - Direct", function () {

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
    await server.close();
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

  it("should return the offline status", async function () {

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
        "--action=status"
      ]);

    var entrypoint = new Entrypoint();
    await entrypoint.start();

    //restore
    console.log = initialLog;
    console.error = initialLogError;

    console.log(log);
    expect(log.slice(-1).pop().includes("status: offline")).to.eq(true);

    sinon.restore();
  });  

  it("should return the online status", async function () {

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
        "--action=status"
      ]);

    const app = express()

    app.get('/manage/status', (req, res) => {
      res.send('Hi!')
    });

    var server = app.listen(2708);

    await (  // use await to wait
      async() => {
        console.log("http dummy server ready for unit test");
      }
    )();      

    var entrypoint = new Entrypoint();
    await entrypoint.start();

    //restore
    console.log = initialLog;
    console.error = initialLogError;

    console.log(log);
    expect(log.slice(-1).pop().includes("status: online")).to.eq(true);

    sinon.restore();
    await server.close();
  });    

  it("should fail if /manage/stop is wrong", async function () {

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
        "--action=stop"
      ]);

    const app = express()

    app.get('/manage/status', (req, res) => {
      res.send('Hi!')
    });

    var server = app.listen(2708);

    await (  // use await to wait
      async() => {
        console.log("http dummy server ready for unit test");
      }
    )();      

    var entrypoint = new Entrypoint();
    await entrypoint.start();

    //restore
    console.log = initialLog;
    console.error = initialLogError;

    console.log(log);
    expect(log.slice(-1).pop().includes("failed to stop miniops")).to.eq(true);

    sinon.restore();
    await server.close();
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

  it("should stop the server", async function () {

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
        "--action=stop"
      ]);

    const app = express()

    app.get('/manage/status', (req, res) => {
      res.send('Hi!')
    });

    app.get('/manage/stop', (req, res) => {
      res.send('miniops will be stopped in 3 seconds')
    });    

    var server = app.listen(2708);

    await (  // use await to wait
      async() => {
        console.log("http dummy server ready for unit test");
      }
    )();      

    var entrypoint = new Entrypoint();
    await entrypoint.start();

    expect(log.slice(-1).pop().includes("miniops will be stopped")).to.eq(true);

    //restore
    console.log = initialLog;
    console.error = initialLogError;

    sinon.restore();
    await server.close();
  });  

});
