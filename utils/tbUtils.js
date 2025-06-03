/* @copyright Itential, LLC 2025 */

/* eslint import/no-extraneous-dependencies: warn */
/* eslint global-require: warn */
/* eslint import/no-dynamic-require: warn */
/* eslint-disable no-console */

/**
 * This script contains manhy of the basic troubleshooting scripts. In addition, it contains helper functions
 * that are utilized by other utilities.
 *
 * This utility is utilized by tbScript when the troubleshooting scripts are run via the CLI. It is also utilized
 * by the adapterBase.js when the troubleshooting scripts are exposed by the adapter and run through Platform
 * Workflow or any other Platform component.
 */

const path = require('path');
const cp = require('child_process');
const axios = require('axios');
const log = require('./logger');
const MongoDBConnection = require('./mongoDbConnection');

module.exports = {
  SERVICE_CONFIGS_COLLECTION: 'service_configs',
  IAP_PROFILES_COLLECTION: 'iap_profiles',

  /**
   * @summary create Adapter instance
   *
   * @function getAdapterInstance
   * @param {Object} adapter - adaper configuration object required by IAP
   */
  getAdapterInstance: (adapter) => {
    const Adapter = require('../adapter');
    const adapterProps = JSON.parse(JSON.stringify(adapter.properties.properties));
    adapterProps.stub = false;
    return new Adapter(
      adapter.id,
      adapterProps
    );
  },

  /**
   * @summary Makes a GET call using axios
   *
   * @function get
   * @param {String} url - url to make the call to
   */
  get: (url) => {
    const config = {
      method: 'get',
      url
    };
    return axios(config);
  },

  /**
   * @summary update newConnection properties in adapter config
   *
   * @function updateNewConnection
   * @param {Object} config - adaper configuration object required by IAP
   * @param {Object} newConnection - connection related property collection from user
   */
  updateNewConnection: (config, newConnection) => {
    const updatedConfig = JSON.parse(JSON.stringify(config));
    Object.keys(newConnection).forEach((key) => {
      updatedConfig.properties.properties[key] = newConnection[key];
    });
    return updatedConfig;
  },

  /**
   * @summary assemble heathcheck endpoint into an URL
   *
   * @function getHealthCheckEndpointURL
   * @param {Object} endpoint - user updated healthcheck endpoint object
   * @param {Object} config - adaper configuration object required by IAP
   */
  getHealthCheckEndpointURL: (endpoint, config) => {
    const p = config.properties.properties;
    // Handle base_path and version properly
    let basePath = '';
    if (p.base_path && p.base_path !== '/') {
      basePath = p.base_path.startsWith('/') ? p.base_path : `/${p.base_path}`;
    }

    let version = '';
    if (p.version) {
      version = p.version.startsWith('/') ? p.version : `/${p.version}`;
    }

    const healthCheckEndpointURL = `${p.protocol}://${p.host}${basePath}${version}${endpoint.healthCheckEndpoint}`;
    log.info({ healthCheckEndpointURL });
    return healthCheckEndpointURL;
  },

  /**
   * @summary update authentication property given new input value from user
   *          compare values from auth and newAuth, if there's difference
   *          update adapter config
   * @function updateAuth
   * @param {Object} newAuth - user confirmed authentication object
   * @param {Object} auth - existing authentication object
   * @param {Object} config - adaper configuration object required by IAP
   */
  updateAuth: (newAuth, auth, config) => {
    const updatedConfig = JSON.parse(JSON.stringify(config));
    if (Object.keys(newAuth).every((key) => newAuth[key] === auth[key])) {
      return config;
    }
    Object.keys(newAuth).forEach((key) => {
      updatedConfig.properties.properties.authentication[key] = newAuth[key];
    });
    log.info(updatedConfig.properties.properties.authentication);
    return updatedConfig;
  },

  /**
   * @summary add mark current auth_method with `(current)`
   *
   * @function getDisplayAuthOptions
   * @param {String} currentAuth - current auth method in adapter config
   * @param {Array} authOptions - available auth method
   */
  getDisplayAuthOptions: (currentAuth, authOptions) => {
    const displayAuthOptions = JSON.parse(JSON.stringify(authOptions));
    displayAuthOptions[authOptions.indexOf(currentAuth)] += ' (current)';
    return displayAuthOptions;
  },

  /**
   * @summary create connection object for verification
   *
   * @function getConnection
   * @param {Object} props - adapter config.properties
   */
  getConnection: (props) => {
    const connection = {
      host: props.properties.host,
      base_path: props.properties.base_path,
      protocol: props.properties.protocol,
      version: props.properties.version,
      port: props.properties.port
    };
    return connection;
  },

  /**
   * @summary update connection properties based on user answer
   *
   * @function getNewProps
   * @param {Array} answers - values collected from CLI
   * @param {Object} connection - connection property verified by user
   */
  getNewProps: (answers, connection) => {
    if (answers.every((answer) => answer === '')) {
      return connection;
    }
    const newConnection = {};
    const properties = Object.keys(connection);
    for (let i = 0; i < answers.length; i += 1) {
      if (answers[i]) {
        newConnection[properties[i]] = Number.isNaN(Number(answers[i])) ? answers[i] : Number(answers[i]);
      } else {
        newConnection[properties[i]] = connection[properties[i]];
      }
    }
    return newConnection;
  },

  /**
   * @summary extract endpoint string from healthcheck object
   *
   * @function getHealthCheckEndpoint
   * @param {Object} healthcheck - {Object} healthcheck - ./entities/.system/action.json object
   */
  getHealthCheckEndpoint: (healthcheck) => {
    const endpoint = healthcheck.actions[1].entitypath.slice(21, healthcheck.actions[1].entitypath.length - 8);
    return { healthCheckEndpoint: endpoint };
  },

  /**
   * @summary execute command and preserve the output the same as run command in shell
   *
   * @function systemSync
   * @param {String} cmd - Command to execute
   * @param {boolean} process - Whether stdout should be processed and returned
   */
  systemSync: function systemSync(cmd, process) {
    if (process) {
      let stdout;
      try {
        stdout = cp.execSync(cmd).toString();
      } catch (error) {
        log.info('execute command error', error.stdout.toString(), error.stderr.toString());
        stdout = error.stdout.toString();
      }
      const output = this.getTestCount(stdout);
      output.stdout = stdout;
      return output;
    }
    try {
      return cp.execSync(cmd, { stdio: 'inherit' });
    } catch (error) {
      return console.error(error.stdout);
    }
  },

  /**
   * @summary parses a string and returns the number parsed from startIndex backwards
   *
   * @function parseNum
   * @param {String} inputStr - Any String
   * @param {Number} startIndex - Index to begin parsing
   */
  parseNum: function parseNum(inputStr, startIndex) {
    let count = '';
    let currChar;
    let start = startIndex;
    while (currChar !== ' ') {
      currChar = inputStr.charAt(start);
      count = currChar + count;
      start -= 1;
    }
    return parseInt(count, 10);
  },

  /**
   * @summary Parses a mocha test result and returns the count of passing and failing tests
   *
   * @function getTestCount
   * @param {String} testStr - Output from mocha test
   */
  getTestCount: function getTestCount(testStr) {
    const passIndex = testStr.search('passing');
    const failIndex = testStr.search('failing');
    const passCount = passIndex >= 0 ? this.parseNum(testStr, passIndex - 2) : 0;
    const failCount = failIndex >= 0 ? this.parseNum(testStr, failIndex - 2) : 0;
    return { passCount, failCount };
  },

  /**
   * @summary run lint, unit test and integration test
   * print result to stdout
   */
  runTest: function runTest() {
    this.systemSync('npm run lint:errors');
    this.systemSync('npm run test:unit');
    this.systemSync('npm run test:integration');
  },

  /**
   * @summary run basicget with mocha
   * @param {boolean} scriptFlag - whether the function is ran from a script
   * @param {number} maxCalls - how many GETs to run (defaults to 5)
   * print result to stdout
   * returns mocha test results otherwise
   */
  runBasicGet: function runBasicGet(props, scriptFlag, maxCalls = 5) {
    let testPath = 'test/integration/adapterTestBasicGet.js';
    let executable = 'mocha';
    if (!scriptFlag) {
      testPath = path.resolve(__dirname, '..', testPath);
      executable = path.join(__dirname, '..', 'node_modules/mocha/bin/mocha.js');
    }
    // if caller passed a number, add the flag
    const mcFlag = Number.isInteger(maxCalls) ? ` --MAXCALLS=${maxCalls}` : '';
    const cmd = `${executable} ${testPath} --PROPS='${JSON.stringify(props)}'${mcFlag} --timeout 60000 --exit`;
    return this.systemSync(cmd, !scriptFlag);
  },

  /**
   * @summary run connectivity with mocha
   * @param {String} host - Host url to run healthcheck
   * @param {boolean} scriptFlag - Whether the function is ran from a script
   * print result to stdout if ran from script
   * returns mocha test results otherwise
   */
  runConnectivity: function runConnectivity(host, scriptFlag) {
    let testPath = 'test/integration/adapterTestConnectivity.js';
    let executable = 'mocha';
    if (!scriptFlag) {
      testPath = path.resolve(__dirname, '..', testPath);
      executable = path.join(__dirname, '..', 'node_modules/mocha/bin/mocha.js');
    }
    return this.systemSync(`${executable} ${testPath} --HOST=${host} --timeout 10000 --exit`, !scriptFlag);
  },

  /**
   * @summary return async healthcheck result as a Promise
   *
   * @function request
   * @param {Adapter} a - Adapter instance
   */
  request: function request(a) {
    return new Promise((resolve, reject) => {
      a.healthCheck(null, (data) => {
        if (!data) reject(new Error('healthCheckEndpoint failed'));
        resolve(data);
      });
    });
  },

  /**
   * @summary deal with healthcheck response returned from adapter instace
   *
   * @function healthCheck
   * @param {Adapter} a - Adapter instance
   */
  healthCheck: async function healthCheck(a) {
    const result = await this.request(a)
      .then((res) => {
        log.info('healthCheckEndpoint OK');
        return res;
      })
      .catch((error) => {
        console.error(error.message);
        return false;
      });
    return result;
  },

  /**
   * @summary connect to mongodb
   *
   * @function connect
   * @param {Object} properties - pronghornProps
   */
  connect: async function connect(properties) {
    const connection = new MongoDBConnection(properties);
    const database = await connection.connect();
    return database;
  },

  /**
   * @summary close mongodb connection
   *
   * @function closeConnection
   * @param {Object} connection - MongoDB connection instance
   */
  closeConnection: async function closeConnection(connection) {
    if (connection && connection.closeConnection) {
      await connection.closeConnection();
    }
  }

};
