#!/usr/bin/env node

const args = require("args-parser")(process.argv)
const logger = require('./common/Logger.js');
const PullingStrategy = require("./strategy/PollingStrategy.js")

logger.info("arguments")
logger.info(args)

if(typeof args.mode === 'undefined'){
    logger.error(args)
    return;
}

if(args.mode==="polling") {
    var pullingStrategy= new PullingStrategy();
    var params = {
        git_url:process.env.git_url || args.git_url,
        git_branch:process.env.git_branch || args.git_branch,
        yaml_location:process.env.yaml_location || args.yaml_location,
        cron_expression:process.env.cron_expression || args.cron_expression
    };
    pullingStrategy.start(params);
}