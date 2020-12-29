var SecMail = require("./clients/secmail")
var CognitoServiceProvider = require('./services/cognito')
var MagicService  = require('./services/magicservice')
var {Logger, Constants} = require('./utils/logger');
var logger = new Logger();
logger.setLogLevel(Constants.LEVEL.INFO);


module.exports.SecMail = SecMail;
module.exports.CognitoServiceProvider = CognitoServiceProvider;
module.exports.MagicService = MagicService
