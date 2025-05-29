const customLevels = {
  spam: 6,
  trace: 5,
  debug: 4,
  info: 3,
  warn: 2,
  error: 1,
  none: 0
};

function parseArgs(argv = process.argv) {
  let properties = null;
  let logLevel = 'none';
  let maxCalls = 5;
  let host = null;

  argv.forEach((val) => {
    if (val.startsWith('--PROPS=')) {
      // get the properties
      const inputVal = val.split('=')[1];
      properties = JSON.parse(inputVal);
    } else if (val.startsWith('--LOG=')) {
      // get the desired log level
      const level = val.split('=')[1];
      // validate the log level is supported, if so set it
      if (Object.hasOwnProperty.call(customLevels, level)) {
        logLevel = level;
      }
    } else if (val.startsWith('--MAXCALLS=')) {
      const override = parseInt(val.split('=')[1], 10);
      if (!Number.isNaN(override) && override > 0) {
        maxCalls = override;
      }
    } else if (val.startsWith('--HOST=')) {
      [, host] = val.split('=');
    }
  });

  return {
    properties, logLevel, maxCalls, host
  };
}

module.exports = { parseArgs };
