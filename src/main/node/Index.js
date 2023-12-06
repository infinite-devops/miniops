const args = require("args-parser")(process.argv);
const logger = require("./common/Logger.js");
const HttpHelper = require("./common/HttpHelper.js");
const express = require("express");
const PullingStrategy = require("./strategy/PollingStrategy.js");

function Index() {

  const port = process.env.PORT || 2708;

  this.start = async () => {

    logger.info("arguments");
    logger.info(args);

    if (typeof args.action === "undefined") {
      logger.error("--action parameter is required");
      return;
    }

    var status;
    try {
      await HttpHelper.get(
        `http://localhost:${port}/manage/status`
      );
      status = "online";
    } catch (err) {
      logger.debug(err);
      status = "offline";
    }

    if (args.action === "stop") {
      if (status == "online") {
        //get the current status
        try {
          var response = await HttpHelper.get(
            `http://localhost:${port}/manage/stop`
          );
          logger.info(response);
          return;
        } catch (err) {
          logger.debug(err);
          logger.info("miniops is already stopped");
          return;
        }
      }
    }

    if (args.action !== "start") {
        logger.error("allowed --action values are: start , stop");
        return;
    }

    logger.info("miniops will start");

    var app = express();

    app.get("/manage/status", function (req, res) {
      res.type("text/html");
      res.send(`
          <!DOCTYPE html>
          <img id="pic" src="https://raw.githubusercontent.com/usil/miniops/1.0.0-snapshot/.assets/logo.png" width=200>
          <script>
          let x = document.getElementById("pic");
          var angles = [45, 90, 270, 360]
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

    app.listen(port, function (){
        var host = "localhost";
        logger.info(`miniops listening at http://${host}:${port}`);
    });

    if (args.mode === "polling") {
      var pullingStrategy = new PullingStrategy();
      var params = {
        git_url: process.env.git_url || args.git_url,
        git_branch: process.env.git_branch || args.git_branch,
        yaml_location: process.env.yaml_location || args.yaml_location,
        cron_expression: process.env.cron_expression || args.cron_expression,
      };
      pullingStrategy.start(params);
    }
  };
}

var index = new Index();
index.start();
