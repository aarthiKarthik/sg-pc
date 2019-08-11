var appRoot = require('app-root-path');
var winston = require('winston');
const fs = require('fs')
const dir = `${appRoot.path}/logs/app.log`
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
console.log("appRoot", appRoot.path)
// define the custom settings for each transport (file, console)
var options = {
  file: {
    level: 'info',
    filename: `${appRoot.path}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    silent: false
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    silent: false
  },
};

// instantiate a new Winston Logger with the settings defined above
var logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console)
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function (message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

module.exports = logger;