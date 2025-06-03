/* @copyright Itential, LLC 2020 */
/* eslint global-require: warn */
/* eslint no-console: warn */
/* eslint import/no-unresolved: warn */
/* eslint import/no-dynamic-require: warn */

const path = require('path');
const rls = require('readline-sync');

const tbUtils = require(path.join(__dirname, 'tbUtils'));
const { name } = require(path.join(__dirname, '..', 'package.json'));
const sampleProperties = require(path.join(__dirname, '..', 'sampleProperties.json'));

// send interactive questions and collection answers
// return updated connection object
const collectAnswersSync = (questions, props) => {
  const answers = [];
  questions.forEach((q) => {
    const answer = rls.question(q);
    answers.push(answer);
  });
  return tbUtils.getNewProps(answers, props);
};

// change object into array of questions
const confirm = (props) => {
  const questions = Object.keys(props).map((key) => `${key}: (${props[key]}) `);
  return collectAnswersSync(questions, props);
};

// allow user to change auth_method
const confirmAuthOptions = (authentication) => {
  const authOptions = ['basic user_password', 'request_token', 'static_token', 'no_authentication'];
  const displayAuthOptions = tbUtils.getDisplayAuthOptions(authentication.auth_method, authOptions);
  const index = rls.keyInSelect(displayAuthOptions, 'Which authentication?');
  if (index === -1) {
    return authentication.auth_method;
  }
  console.log(`${authOptions[index]} is selected.`);
  return authOptions[index];
};

// helper function to update auth properties
const confirmAndUpdate = (auth, config) => {
  const newAuth = confirm(auth);
  return tbUtils.updateAuth(newAuth, auth, config);
};

// extract basic auth properties
const updateBasicAuth = (config, authentication) => {
  const auth = {
    username: authentication.username,
    password: authentication.password
  };
  return confirmAndUpdate(auth, config);
};

// extract static auth properties
const updateStaticAuth = (config, authentication) => {
  const auth = {
    token: authentication.token,
    auth_field: authentication.auth_field,
    auth_field_format: authentication.auth_field_format
  };
  return confirmAndUpdate(auth, config);
};

// troubleshooting connection and healthcheck endpoint setting of adapter
const VerifyHealthCheckEndpoint = (serviceItem, props, scriptFlag) => {
  let connConfig;
  const result = {};

  if (scriptFlag) {
    const connection = tbUtils.getConnection(serviceItem.properties);
    const newConnection = confirm(connection);
    tbUtils.runConnectivity(newConnection.host, scriptFlag);
    connConfig = tbUtils.updateNewConnection(serviceItem, newConnection);
  } else {
    let { properties: { properties: { host } } } = serviceItem;

    connConfig = props.connProps
      ? tbUtils.updateNewConnection(serviceItem, props.connProps)
      : serviceItem;

    if (props.connProps) {
      host = connConfig.properties.properties.host;
    }

    result.connectivity = tbUtils.runConnectivity(host, scriptFlag);
  }

  // Updates the healthcheck endpoint
  const healthcheck = require(path.resolve(__dirname, '../entities/.system/action.json'));
  const healthCheckEndpoint = tbUtils.getHealthCheckEndpoint(healthcheck);
  let newHealthCheckEndpoint = healthCheckEndpoint;

  if (scriptFlag) {
    newHealthCheckEndpoint = confirm(healthCheckEndpoint);
    tbUtils.getHealthCheckEndpointURL(newHealthCheckEndpoint, connConfig);
  } else if (props.healthCheckEndpoint) {
    newHealthCheckEndpoint = props.healthCheckEndpoint;
  }

  // Updates the authorization params
  const { authentication } = connConfig.properties.properties;
  let updatedAdapter = connConfig;
  if (scriptFlag) {
    authentication.auth_method = confirmAuthOptions(authentication);
    if (authentication.auth_method === 'basic user_password') {
      updatedAdapter = updateBasicAuth(connConfig, authentication);
    } else if (authentication.auth_method === 'static_token') {
      updatedAdapter = updateStaticAuth(connConfig, authentication);
    } else if (authentication.auth_method === 'request_token') {
      console.log('current troubleshooting script does not support updating request_token authentication');
    }
  } else if (props.auth) {
    updatedAdapter = tbUtils.updateAuth(props.auth, authentication, connConfig);
  }
  return { result, updatedAdapter };
};

const troubleshoot = async (props, scriptFlag, adapter) => {
  let serviceItem;

  if (adapter && adapter.allProps) {
    serviceItem = { properties: { properties: adapter.allProps } };
  } else if (adapter && adapter.properties && adapter.properties.properties) {
    serviceItem = adapter.properties;
  } else {
    serviceItem = { properties: sampleProperties };
  }

  if (!serviceItem) {
    console.log(`${name} not installed`);
    console.log('run `npm run install:adapter` to install current adapter to IAP first. Exiting...');
    if (scriptFlag) {
      process.exit(1);
    }
    return null;
  }

  const shouldRun = !scriptFlag || rls.keyInYN(`Start verifying the connection and authentication properties for ${name}?`);
  if (!shouldRun) {
    console.log('You can update healthCheckEndpoint in ./entities/.system/action.json');
    console.log('You can update authentication credientials under Settings/Services');
    if (scriptFlag) {
      process.exit(0);
    }
    return null;
  }

  const { result, updatedAdapter } = VerifyHealthCheckEndpoint(serviceItem, props, scriptFlag);
  const a = scriptFlag ? tbUtils.getAdapterInstance(updatedAdapter) : adapter;

  const healthRes = await tbUtils.healthCheck(a);
  result.healthCheck = healthRes;

  if (scriptFlag && !healthRes) {
    console.log('run `npm run troubleshoot` again to update settings');
    process.exit(1);
  }

  if (scriptFlag) {
    if (rls.keyInYN('Test with more GET request')) {
      await tbUtils.runBasicGet(serviceItem.properties.properties, true);
    } else {
      console.log('Exiting');
    }
    process.exit(0);
  }

  result.basicGet = await tbUtils.runBasicGet(serviceItem.properties.properties, false);

  return result;
};

module.exports = { troubleshoot };
