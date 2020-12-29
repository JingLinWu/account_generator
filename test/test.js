var {Logger, Constants} = require('../utils/Logger');

var logger = new Logger();
console.log( "Logger.INFO:" + Constants.LEVEL.INFO);
logger.setLogLevel(Constants.LEVEL.WARN);

logger.info("print info");
logger.debug("print debug");
logger.warn("print warn");
logger.error("print error");
