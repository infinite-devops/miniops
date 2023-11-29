#!/usr/bin/env node

const args = require("args-parser")(process.argv)
const PullingStrategy = require("./strategy/PullingStrategy.js")

if(args.mode==="polling") {
    var pullingStrategy= new PullingStrategy();
    pullingStrategy.start();
}