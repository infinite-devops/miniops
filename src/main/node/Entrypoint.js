const argsParser = require("args-parser");
const logger = require("./common/Logger.js");
const HttpHelper = require("./common/HttpHelper.js");
const DevopsTask = require('./core/DevopsTask.js');
const ShellHelper = require('./common/ShellHelper.js');
const Pipeline = require('./core/Pipeline.js');
const express = require("express");
const { once } = require('events');
const { v4: uuidv4 } = require('uuid');
const PullingStrategy = require("./strategy/PollingStrategy.js");

function Entrypoint() {
  const port = process.env.PORT || 2708;
  const args = argsParser(process.argv);
  var server;
  var pullingStrategy;

  this.start = async () => {

    logger.init({loggerFileLocation: process.env.log_file_location, loggerLevel: process.env.logger_level});

    logger.info("arguments");
    logger.info(args);

    var params = {
      git_url: process.env.git_url || args.git_url,
      git_branch: process.env.git_branch || args.git_branch,
      yaml_full_location: process.env.yaml_full_location || args.yaml_full_location,
      cron_expression: process.env.cron_expression || args.cron_expression,
    };

    logger.info('mode: '+args.mode);

    if (args.mode === "direct") {

      var uuidExecution = uuidv4();
      logger.info('Starting job: '+uuidExecution);
      var response;

      var shellHelper = new ShellHelper();
      var pipeline = new Pipeline();
      var devopsTask = new DevopsTask(shellHelper, pipeline);

      response = await devopsTask.start({
        gitUrl: params.git_url,
        branchName: params.git_branch,
        yamlFullLocation: params.yaml_full_location,
        disableOnChageValidation: true      
      });
      logger.info("completed: "+uuidExecution)      
      logger.info(response.code==0?"completed : "+uuidExecution: "failed : "+uuidExecution)
      return response;
    }
    
    if (typeof args.mode !== 'undefined' && args.mode !== "direct") {
      logger.error("--mode has an invalid value. Allowed: direct");
      return;
    }    

    //by default if mode is not entered, polling mode is chosen
    //pooling mode needs an action

    if (typeof args.action === "undefined") {
      logger.error("--action parameter is required");
      return;
    }

    logger.info('action: '+args.action);

    var status;
    try {
      await HttpHelper.get(`http://localhost:${port}/manage/status`);
      status = "online";
    } catch (err) {
      logger.debug(err);
      status = "offline";
    }

    if (args.action === "status") {
      logger.info(`status: ${status}`);
      return;
    }else if (args.action === "stop") {
      logger.info(`status: ${status}`);
      if (status == "online") {
        //get the current status
        try {
          var response = await HttpHelper.get(
            `http://localhost:${port}/manage/stop`
          );
          logger.info(response);
          return;
        } catch (err) {
          logger.error(err);
          logger.info("failed to stop miniops");
          return;
        }
      } else {
        logger.info("miniops is already stopped");
        return;
      }
    }

    if (args.action !== "start" && args.action !== "stop") {
      logger.error("--action has an invalid value. Allowed: start , stop");
      return;
    }

    if (status == "online") {
      logger.info("miniops is already started");
      return;
    }  

    //we are in the action=start
    logger.info("miniops will start");

    var app = express();

    app.get("/manage/status", function (req, res) {
      res.type("text/html");
      res.send(`
          <!DOCTYPE html>
          <img id="pic" src="https://raw.githubusercontent.com/usil/miniops/1.0.0-snapshot/.assets/logo.png" width=200>
          <script>
          let x = document.getElementById("pic");
          var angles = [45, 90, 270, 360, -45, -90, -270, -360]
          var rand = Math.floor(Math.random() * angles.length)
          x.style.transform = "rotate("+ (angles[rand]) +"deg)"          
          </script>
          `);
    });

    app.get("/manage/stop", function (req, res) {
      logger.info("stop is requested");
      setTimeout(() => {
        process.exit(0);
      }, 3000);

      res.type("text/plain");
      res.send("miniops will be stopped in 3 seconds");
    });

    server = app.listen(port);
    await once(server, 'listening');
    logger.info(`miniops listening at http://localhost:${port}`);    

    //delay some seconds
    logger.info(`miniops polling started`);   
    pullingStrategy = new PullingStrategy();
    pullingStrategy.start(params);
    
  };

  this.stop = async () => {
    await server.close();
    await pullingStrategy.stop();
  }  
}

module.exports = Entrypoint;
