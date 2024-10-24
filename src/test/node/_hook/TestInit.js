const { logConfig} = require('override-console-log'); 
logConfig.logDate = true; 
logConfig.enableLogD = process.env.VERBOSE_LOG;