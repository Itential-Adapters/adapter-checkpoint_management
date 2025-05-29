// utils/logger.js
const winston = require('winston');
const { parseArgs } = require('./argParser');

const customLevels = {
  spam: 6,
  trace: 5,
  debug: 4,
  info: 3,
  warn: 2,
  error: 1,
  none: 0
};

// Only set global logger if it doesn't already exist (i.e., not provided by app)
if (!global.log) {
  const { logLevel = 'info' } = parseArgs();

  global.log = winston.createLogger({
    level: logLevel,
    levels: customLevels,
    transports: [new winston.transports.Console()]
  });
}

module.exports = global.log;
