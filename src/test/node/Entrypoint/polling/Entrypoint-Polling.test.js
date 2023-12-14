const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const sinon = require("sinon");
const fs = require("fs");
const path = require("path");
const http = require("http");
const os = require("os");
const GitServer = require("node-git-server");
const Entrypoint = require("../../../../main/node/Entrypoint.js");

describe("Entrypoint - Polling", function () {

  var server;
  var entrypoint;

  before(async () => {

    const repos = new GitServer.Git(path.join(__dirname, "git_server_mock"), {
      autoCreate: true,
    });

    const port = 6000;
    server = await http
      .createServer((req, res) => {
        repos.handle(req, res);
      })
      .listen(port);
  });

  after(async () => {
    await server.close();
  });  

  afterEach(async () => {
    try {
      await entrypoint.stop();
    } catch (error) {
      console.log("Failed to stop the miniops server", error)
    }
  });   
  
  it("should validate an invalid action", async function () {
    sinon
      .stub(process, "argv")
      .value([
        "/home/foo/.nvm/versions/node/v16.20.2/bin/node",
        "/home/foo/Github/miniops/bin/miniops",
        "--action=foo"
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

    entrypoint = new Entrypoint();
    await entrypoint.start();

    //restore
    console.log = initialLog;
    console.error = initialLogError;

    console.log(log);
    expect(
      log.slice(-1).pop().includes("--action has an invalid value")
    ).to.eq(true);

    sinon.restore();
  });  
  
  it("should validate the required polling parameter: git_url", async function () {

    sinon
    .stub(process, "argv")
    .value([
      "/home/foo/.nvm/versions/node/v16.20.2/bin/node",
      "/home/foo/Github/miniops/bin/miniops",
      "--action=start"
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

    entrypoint = new Entrypoint();
    
    //git_url parameter
    await entrypoint.start();
    await new Promise(r => setTimeout(r, 2000))
    //restore
    console.log = initialLog;
    console.error = initialLogError;

    console.log(log);

    expect(
      log.slice(-1).pop().includes("git_url parameter is required")
    ).to.eq(true);

    sinon.restore();
  });   

  it("should validate the required polling parameter: git_branch", async function () {

    sinon
      .stub(process, "argv")
      .value([
        "/home/foo/.nvm/versions/node/v16.20.2/bin/node",
        "/home/foo/Github/miniops/bin/miniops",
        "--action=start",
        "--git_url=http://localhost:6000/bar"
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

    entrypoint = new Entrypoint();
    
    //git_url parameter
    await entrypoint.start();
    await new Promise(r => setTimeout(r, 2000))
    //restore
    console.log = initialLog;
    console.error = initialLogError;

    console.log(log);

    expect(
      log.slice(-1).pop().includes("git_branch parameter is required")
    ).to.eq(true);

    sinon.restore();
  });    
  
  it("should validate the required polling parameter: yaml_location", async function () {

    sinon
      .stub(process, "argv")
      .value([
        "/home/foo/.nvm/versions/node/v16.20.2/bin/node",
        "/home/foo/Github/miniops/bin/miniops",
        "--action=start",
        "--git_url=http://localhost:6000/bar",
        "--git_branch=foo"
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

    entrypoint = new Entrypoint();
    
    //git_url parameter
    await entrypoint.start();
    await new Promise(r => setTimeout(r, 2000))
    //restore
    console.log = initialLog;
    console.error = initialLogError;

    console.log(log);

    expect(
      log.slice(-1).pop().includes("yaml_full_location parameter is required")
    ).to.eq(true);

    await entrypoint.stop();
    sinon.restore();
  });   

  it("should validate the required polling parameter: cron_expression", async function () {

    sinon
      .stub(process, "argv")
      .value([
        "/home/foo/.nvm/versions/node/v16.20.2/bin/node",
        "/home/foo/Github/miniops/bin/miniops",
        "--action=start",
        "--git_url=http://localhost:6000/bar",
        "--git_branch=foo",
        "--yaml_full_location=/bar.yaml"
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
    
    //git_url parameter
    await entrypoint.start();
    await new Promise(r => setTimeout(r, 2000))
    //restore
    console.log = initialLog;
    console.error = initialLogError;

    console.log(log);

    expect(
      log.slice(-1).pop().includes("cron_expression parameter is required")
    ).to.eq(true);

    await entrypoint.stop();
    sinon.restore();
  }); 

  //at this point all the params are entered
  it("should detect that git repository did not chage", async function () {

    sinon
      .stub(process, "argv")
      .value([
        "/home/foo/.nvm/versions/node/v16.20.2/bin/node",
        "/home/foo/Github/miniops/bin/miniops",
        "--action=start",
        "--git_url=http://localhost:6000/bar",
        "--git_branch=master",
        "--yaml_full_location="+path.join(__dirname, "simple.yaml"),
        "--cron_expression=*/30 * * * * *"
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

    //force the "has not changed"
    var fileInfoLocation = path.join(os.tmpdir(), `bar-master`)
    var miniopsInfoLocation = path.join(os.tmpdir(), `miniops.txt`)

    try {
      await fs.promises.rm(fileInfoLocation, { recursive: true });
    } catch (error) {
    }
    try {
      await fs.promises.rm(miniopsInfoLocation, { recursive: true });
    } catch (error) {      
    }
    await fs.promises.writeFile(fileInfoLocation, "d964d9971db23fa86b44b93c85d9691918cd0cea");

    entrypoint = new Entrypoint();
    
    //git_url parameter
    await entrypoint.start();
    await new Promise(r => setTimeout(r, 20000))
    //restore
    console.log = initialLog;
    console.error = initialLogError;

    console.log(log);
    var count = (log.join(" ").match(/branch has not changed/g) || []).length;
    expect(count).to.eq(1);

    await entrypoint.stop();
    sinon.restore();
  });   

  it("should execute the task if branch changed", async function () {

    sinon
      .stub(process, "argv")
      .value([
        "/home/foo/.nvm/versions/node/v16.20.2/bin/node",
        "/home/foo/Github/miniops/bin/miniops",
        "--action=start",
        "--git_url=http://localhost:6000/bar",
        "--git_branch=master",
        "--yaml_full_location="+path.join(__dirname, "simple.yaml"),
        "--cron_expression=*/30 * * * * *"
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

    var fileInfoLocation = path.join(os.tmpdir(), `bar-master`)
    var miniopsInfoLocation = path.join(os.tmpdir(), `miniops.txt`)

    try {
      await fs.promises.rm(fileInfoLocation, { recursive: true });
    } catch (error) {
    }
    try {
      await fs.promises.rm(miniopsInfoLocation, { recursive: true });
    } catch (error) {      
    }

    entrypoint = new Entrypoint();
    
    //git_url parameter
    await entrypoint.start();
    await new Promise(r => setTimeout(r, 20000))
    //restore
    console.log = initialLog;
    console.error = initialLogError;

    console.log(log);
    var allLog = log.join(" ");
    var uuid = allLog.match(/-\s+.+:\s+starting/g)[0].trim().split(/\s+/)[6].replace(":", "").trim();
    console.log(`Searching in log >> ${uuid}: completed`)
    expect(allLog.includes(`${uuid}: completed`)).to.eq(true);

    await entrypoint.stop();
    sinon.restore();
  });     

});
