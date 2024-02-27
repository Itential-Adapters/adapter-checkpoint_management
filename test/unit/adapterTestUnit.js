/* @copyright Itential, LLC 2019 (pre-modifications) */

// Set globals
/* global describe it log pronghornProps */
/* eslint global-require: warn */
/* eslint no-unused-vars: warn */
/* eslint import/no-dynamic-require:warn */

// include required items for testing & logging
const assert = require('assert');
const path = require('path');
const util = require('util');
const execute = require('child_process').execSync;
const fs = require('fs-extra');
const mocha = require('mocha');
const winston = require('winston');
const { expect } = require('chai');
const { use } = require('chai');
const td = require('testdouble');
const Ajv = require('ajv');

const ajv = new Ajv({ strictSchema: false, allErrors: true, allowUnionTypes: true });
const anything = td.matchers.anything();
let logLevel = 'none';
const isRapidFail = false;

// read in the properties from the sampleProperties files
let adaptdir = __dirname;
if (adaptdir.endsWith('/test/integration')) {
  adaptdir = adaptdir.substring(0, adaptdir.length - 17);
} else if (adaptdir.endsWith('/test/unit')) {
  adaptdir = adaptdir.substring(0, adaptdir.length - 10);
}
const samProps = require(`${adaptdir}/sampleProperties.json`).properties;

// these variables can be changed to run in integrated mode so easier to set them here
// always check these in with bogus data!!!
samProps.stub = true;
samProps.host = 'replace.hostorip.here';
samProps.authentication.username = 'username';
samProps.authentication.password = 'password';
samProps.protocol = 'http';
samProps.port = 80;
samProps.ssl.enabled = false;
samProps.ssl.accept_invalid_cert = false;
samProps.request.attempt_timeout = 1200000;
const attemptTimeout = samProps.request.attempt_timeout;
const { stub } = samProps;

// these are the adapter properties. You generally should not need to alter
// any of these after they are initially set up
global.pronghornProps = {
  pathProps: {
    encrypted: false
  },
  adapterProps: {
    adapters: [{
      id: 'Test-checkpoint_management',
      type: 'CheckpointManagement',
      properties: samProps
    }]
  }
};

global.$HOME = `${__dirname}/../..`;

// set the log levels that Pronghorn uses, spam and trace are not defaulted in so without
// this you may error on log.trace calls.
const myCustomLevels = {
  levels: {
    spam: 6,
    trace: 5,
    debug: 4,
    info: 3,
    warn: 2,
    error: 1,
    none: 0
  }
};

// need to see if there is a log level passed in
process.argv.forEach((val) => {
  // is there a log level defined to be passed in?
  if (val.indexOf('--LOG') === 0) {
    // get the desired log level
    const inputVal = val.split('=')[1];

    // validate the log level is supported, if so set it
    if (Object.hasOwnProperty.call(myCustomLevels.levels, inputVal)) {
      logLevel = inputVal;
    }
  }
});

// need to set global logging
global.log = winston.createLogger({
  level: logLevel,
  levels: myCustomLevels.levels,
  transports: [
    new winston.transports.Console()
  ]
});

/**
 * Runs the error asserts for the test
 */
function runErrorAsserts(data, error, code, origin, displayStr) {
  assert.equal(null, data);
  assert.notEqual(undefined, error);
  assert.notEqual(null, error);
  assert.notEqual(undefined, error.IAPerror);
  assert.notEqual(null, error.IAPerror);
  assert.notEqual(undefined, error.IAPerror.displayString);
  assert.notEqual(null, error.IAPerror.displayString);
  assert.equal(code, error.icode);
  assert.equal(origin, error.IAPerror.origin);
  assert.equal(displayStr, error.IAPerror.displayString);
}

// require the adapter that we are going to be using
const CheckpointManagement = require('../../adapter');

// delete the .DS_Store directory in entities -- otherwise this will cause errors
const dirPath = path.join(__dirname, '../../entities/.DS_Store');
if (fs.existsSync(dirPath)) {
  try {
    fs.removeSync(dirPath);
    console.log('.DS_Store deleted');
  } catch (e) {
    console.log('Error when deleting .DS_Store:', e);
  }
}

// begin the testing - these should be pretty well defined between the describe and the it!
describe('[unit] Checkpoint_Management Adapter Test', () => {
  describe('CheckpointManagement Class Tests', () => {
    const a = new CheckpointManagement(
      pronghornProps.adapterProps.adapters[0].id,
      pronghornProps.adapterProps.adapters[0].properties
    );

    if (isRapidFail) {
      const state = {};
      state.passed = true;

      mocha.afterEach(function x() {
        state.passed = state.passed
        && (this.currentTest.state === 'passed');
      });
      mocha.beforeEach(function x() {
        if (!state.passed) {
          return this.currentTest.skip();
        }
        return true;
      });
    }

    describe('#class instance created', () => {
      it('should be a class with properties', (done) => {
        try {
          assert.notEqual(null, a);
          assert.notEqual(undefined, a);
          const checkId = global.pronghornProps.adapterProps.adapters[0].id;
          assert.equal(checkId, a.id);
          assert.notEqual(null, a.allProps);
          const check = global.pronghornProps.adapterProps.adapters[0].properties.healthcheck.type;
          assert.equal(check, a.healthcheckType);
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('adapterBase.js', () => {
      it('should have an adapterBase.js', (done) => {
        try {
          fs.exists('adapterBase.js', (val) => {
            assert.equal(true, val);
            done();
          });
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    let wffunctions = [];
    describe('#iapGetAdapterWorkflowFunctions', () => {
      it('should retrieve workflow functions', (done) => {
        try {
          wffunctions = a.iapGetAdapterWorkflowFunctions([]);

          try {
            assert.notEqual(0, wffunctions.length);
            done();
          } catch (err) {
            log.error(`Test Failure: ${err}`);
            done(err);
          }
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('package.json', () => {
      it('should have a package.json', (done) => {
        try {
          fs.exists('package.json', (val) => {
            assert.equal(true, val);
            done();
          });
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('package.json should be validated', (done) => {
        try {
          const packageDotJson = require('../../package.json');
          // Define the JSON schema for package.json
          const packageJsonSchema = {
            type: 'object',
            properties: {
              name: { type: 'string' },
              version: { type: 'string' }
              // May need to add more properties as needed
            },
            required: ['name', 'version']
          };
          const validate = ajv.compile(packageJsonSchema);
          const isValid = validate(packageDotJson);

          if (isValid === false) {
            log.error('The package.json contains errors');
            assert.equal(true, isValid);
          } else {
            assert.equal(true, isValid);
          }

          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('package.json standard fields should be customized', (done) => {
        try {
          const packageDotJson = require('../../package.json');
          assert.notEqual(-1, packageDotJson.name.indexOf('checkpoint_management'));
          assert.notEqual(undefined, packageDotJson.version);
          assert.notEqual(null, packageDotJson.version);
          assert.notEqual('', packageDotJson.version);
          assert.notEqual(undefined, packageDotJson.description);
          assert.notEqual(null, packageDotJson.description);
          assert.notEqual('', packageDotJson.description);
          assert.equal('adapter.js', packageDotJson.main);
          assert.notEqual(undefined, packageDotJson.wizardVersion);
          assert.notEqual(null, packageDotJson.wizardVersion);
          assert.notEqual('', packageDotJson.wizardVersion);
          assert.notEqual(undefined, packageDotJson.engineVersion);
          assert.notEqual(null, packageDotJson.engineVersion);
          assert.notEqual('', packageDotJson.engineVersion);
          assert.equal('http', packageDotJson.adapterType);
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('package.json proper scripts should be provided', (done) => {
        try {
          const packageDotJson = require('../../package.json');
          assert.notEqual(undefined, packageDotJson.scripts);
          assert.notEqual(null, packageDotJson.scripts);
          assert.notEqual('', packageDotJson.scripts);
          assert.equal('node utils/setup.js', packageDotJson.scripts.preinstall);
          assert.equal('node --max_old_space_size=4096 ./node_modules/eslint/bin/eslint.js . --ext .json --ext .js', packageDotJson.scripts.lint);
          assert.equal('node --max_old_space_size=4096 ./node_modules/eslint/bin/eslint.js . --ext .json --ext .js --quiet', packageDotJson.scripts['lint:errors']);
          assert.equal('mocha test/unit/adapterBaseTestUnit.js --LOG=error', packageDotJson.scripts['test:baseunit']);
          assert.equal('mocha test/unit/adapterTestUnit.js --LOG=error', packageDotJson.scripts['test:unit']);
          assert.equal('mocha test/integration/adapterTestIntegration.js --LOG=error', packageDotJson.scripts['test:integration']);
          assert.equal('nyc --reporter html --reporter text mocha --reporter dot test/*', packageDotJson.scripts['test:cover']);
          assert.equal('npm run test:baseunit && npm run test:unit && npm run test:integration', packageDotJson.scripts.test);
          assert.equal('npm publish --registry=https://registry.npmjs.org --access=public', packageDotJson.scripts.deploy);
          assert.equal('npm run deploy', packageDotJson.scripts.build);
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('package.json proper directories should be provided', (done) => {
        try {
          const packageDotJson = require('../../package.json');
          assert.notEqual(undefined, packageDotJson.repository);
          assert.notEqual(null, packageDotJson.repository);
          assert.notEqual('', packageDotJson.repository);
          assert.equal('git', packageDotJson.repository.type);
          assert.equal('git@gitlab.com:itentialopensource/adapters/', packageDotJson.repository.url.substring(0, 43));
          assert.equal('https://gitlab.com/itentialopensource/adapters/', packageDotJson.homepage.substring(0, 47));
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('package.json proper dependencies should be provided', (done) => {
        try {
          const packageDotJson = require('../../package.json');
          assert.notEqual(undefined, packageDotJson.dependencies);
          assert.notEqual(null, packageDotJson.dependencies);
          assert.notEqual('', packageDotJson.dependencies);
          assert.equal('^8.12.0', packageDotJson.dependencies.ajv);
          assert.equal('^1.6.7', packageDotJson.dependencies.axios);
          assert.equal('^11.0.0', packageDotJson.dependencies.commander);
          assert.equal('^11.1.1', packageDotJson.dependencies['fs-extra']);
          assert.equal('^10.3.0', packageDotJson.dependencies.mocha);
          assert.equal('^2.0.1', packageDotJson.dependencies['mocha-param']);
          assert.equal('^15.1.0', packageDotJson.dependencies.nyc);
          assert.equal('^0.4.4', packageDotJson.dependencies.ping);
          assert.equal('^1.4.10', packageDotJson.dependencies['readline-sync']);
          assert.equal('^7.5.3', packageDotJson.dependencies.semver);
          assert.equal('^3.9.0', packageDotJson.dependencies.winston);
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('package.json proper dev dependencies should be provided', (done) => {
        try {
          const packageDotJson = require('../../package.json');
          assert.notEqual(undefined, packageDotJson.devDependencies);
          assert.notEqual(null, packageDotJson.devDependencies);
          assert.notEqual('', packageDotJson.devDependencies);
          assert.equal('^4.3.7', packageDotJson.devDependencies.chai);
          assert.equal('^8.44.0', packageDotJson.devDependencies.eslint);
          assert.equal('^15.0.0', packageDotJson.devDependencies['eslint-config-airbnb-base']);
          assert.equal('^2.27.5', packageDotJson.devDependencies['eslint-plugin-import']);
          assert.equal('^3.1.0', packageDotJson.devDependencies['eslint-plugin-json']);
          assert.equal('^3.18.0', packageDotJson.devDependencies.testdouble);
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('pronghorn.json', () => {
      it('should have a pronghorn.json', (done) => {
        try {
          fs.exists('pronghorn.json', (val) => {
            assert.equal(true, val);
            done();
          });
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('pronghorn.json should be customized', (done) => {
        try {
          const pronghornDotJson = require('../../pronghorn.json');
          assert.notEqual(-1, pronghornDotJson.id.indexOf('checkpoint_management'));
          assert.equal('Adapter', pronghornDotJson.type);
          assert.equal('CheckpointManagement', pronghornDotJson.export);
          assert.equal('Checkpoint_Management', pronghornDotJson.title);
          assert.equal('adapter.js', pronghornDotJson.src);
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('pronghorn.json should contain generic adapter methods', (done) => {
        try {
          const pronghornDotJson = require('../../pronghorn.json');
          assert.notEqual(undefined, pronghornDotJson.methods);
          assert.notEqual(null, pronghornDotJson.methods);
          assert.notEqual('', pronghornDotJson.methods);
          assert.equal(true, Array.isArray(pronghornDotJson.methods));
          assert.notEqual(0, pronghornDotJson.methods.length);
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapUpdateAdapterConfiguration'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapSuspendAdapter'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapUnsuspendAdapter'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapGetAdapterQueue'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapFindAdapterPath'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapTroubleshootAdapter'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapRunAdapterHealthcheck'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapRunAdapterConnectivity'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapRunAdapterBasicGet'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapMoveAdapterEntitiesToDB'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapDeactivateTasks'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapActivateTasks'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapPopulateEntityCache'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapRetrieveEntitiesCache'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'getDevice'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'getDevicesFiltered'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'isAlive'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'getConfig'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapGetDeviceCount'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapExpandedGenericAdapterRequest'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'genericAdapterRequest'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'genericAdapterRequestNoBasePath'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapRunAdapterLint'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapRunAdapterTests'));
          assert.notEqual(undefined, pronghornDotJson.methods.find((e) => e.name === 'iapGetAdapterInventory'));
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('pronghorn.json should only expose workflow functions', (done) => {
        try {
          const pronghornDotJson = require('../../pronghorn.json');

          for (let m = 0; m < pronghornDotJson.methods.length; m += 1) {
            let found = false;
            let paramissue = false;

            for (let w = 0; w < wffunctions.length; w += 1) {
              if (pronghornDotJson.methods[m].name === wffunctions[w]) {
                found = true;
                const methLine = execute(`grep "  ${wffunctions[w]}(" adapter.js | grep "callback) {"`).toString();
                let wfparams = [];

                if (methLine && methLine.indexOf('(') >= 0 && methLine.indexOf(')') >= 0) {
                  const temp = methLine.substring(methLine.indexOf('(') + 1, methLine.lastIndexOf(')'));
                  wfparams = temp.split(',');

                  for (let t = 0; t < wfparams.length; t += 1) {
                    // remove default value from the parameter name
                    wfparams[t] = wfparams[t].substring(0, wfparams[t].search(/=/) > 0 ? wfparams[t].search(/#|\?|=/) : wfparams[t].length);
                    // remove spaces
                    wfparams[t] = wfparams[t].trim();

                    if (wfparams[t] === 'callback') {
                      wfparams.splice(t, 1);
                    }
                  }
                }

                // if there are inputs defined but not on the method line
                if (wfparams.length === 0 && (pronghornDotJson.methods[m].input
                    && pronghornDotJson.methods[m].input.length > 0)) {
                  paramissue = true;
                } else if (wfparams.length > 0 && (!pronghornDotJson.methods[m].input
                    || pronghornDotJson.methods[m].input.length === 0)) {
                  // if there are no inputs defined but there are on the method line
                  paramissue = true;
                } else {
                  for (let p = 0; p < pronghornDotJson.methods[m].input.length; p += 1) {
                    let pfound = false;
                    for (let wfp = 0; wfp < wfparams.length; wfp += 1) {
                      if (pronghornDotJson.methods[m].input[p].name.toUpperCase() === wfparams[wfp].toUpperCase()) {
                        pfound = true;
                      }
                    }

                    if (!pfound) {
                      paramissue = true;
                    }
                  }
                  for (let wfp = 0; wfp < wfparams.length; wfp += 1) {
                    let pfound = false;
                    for (let p = 0; p < pronghornDotJson.methods[m].input.length; p += 1) {
                      if (pronghornDotJson.methods[m].input[p].name.toUpperCase() === wfparams[wfp].toUpperCase()) {
                        pfound = true;
                      }
                    }

                    if (!pfound) {
                      paramissue = true;
                    }
                  }
                }

                break;
              }
            }

            if (!found) {
              // this is the reason to go through both loops - log which ones are not found so
              // they can be worked
              log.error(`${pronghornDotJson.methods[m].name} not found in workflow functions`);
            }
            if (paramissue) {
              // this is the reason to go through both loops - log which ones are not found so
              // they can be worked
              log.error(`${pronghornDotJson.methods[m].name} has a parameter mismatch`);
            }
            assert.equal(true, found);
            assert.equal(false, paramissue);
          }
          done();
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('pronghorn.json should expose all workflow functions', (done) => {
        try {
          const pronghornDotJson = require('../../pronghorn.json');
          for (let w = 0; w < wffunctions.length; w += 1) {
            let found = false;

            for (let m = 0; m < pronghornDotJson.methods.length; m += 1) {
              if (pronghornDotJson.methods[m].name === wffunctions[w]) {
                found = true;
                break;
              }
            }

            if (!found) {
              // this is the reason to go through both loops - log which ones are not found so
              // they can be worked
              log.error(`${wffunctions[w]} not found in pronghorn.json`);
            }
            assert.equal(true, found);
          }
          done();
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      });
      it('pronghorn.json verify input/output schema objects', (done) => {
        const verifySchema = (methodName, schema) => {
          try {
            ajv.compile(schema);
          } catch (error) {
            const errorMessage = `Invalid schema found in '${methodName}' method.
          Schema => ${JSON.stringify(schema)}.
          Details => ${error.message}`;
            throw new Error(errorMessage);
          }
        };

        try {
          const pronghornDotJson = require('../../pronghorn.json');
          const { methods } = pronghornDotJson;
          for (let i = 0; i < methods.length; i += 1) {
            for (let j = 0; j < methods[i].input.length; j += 1) {
              const inputSchema = methods[i].input[j].schema;
              if (inputSchema) {
                verifySchema(methods[i].name, inputSchema);
              }
            }
            const outputSchema = methods[i].output.schema;
            if (outputSchema) {
              verifySchema(methods[i].name, outputSchema);
            }
          }
          done();
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      });
    });

    describe('propertiesSchema.json', () => {
      it('should have a propertiesSchema.json', (done) => {
        try {
          fs.exists('propertiesSchema.json', (val) => {
            assert.equal(true, val);
            done();
          });
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('propertiesSchema.json should be customized', (done) => {
        try {
          const propertiesDotJson = require('../../propertiesSchema.json');
          assert.equal('adapter-checkpoint_management', propertiesDotJson.$id);
          assert.equal('object', propertiesDotJson.type);
          assert.equal('http://json-schema.org/draft-07/schema#', propertiesDotJson.$schema);
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('propertiesSchema.json should contain generic adapter properties', (done) => {
        try {
          const propertiesDotJson = require('../../propertiesSchema.json');
          assert.notEqual(undefined, propertiesDotJson.properties);
          assert.notEqual(null, propertiesDotJson.properties);
          assert.notEqual('', propertiesDotJson.properties);
          assert.equal('string', propertiesDotJson.properties.host.type);
          assert.equal('integer', propertiesDotJson.properties.port.type);
          assert.equal('boolean', propertiesDotJson.properties.stub.type);
          assert.equal('string', propertiesDotJson.properties.protocol.type);
          assert.notEqual(undefined, propertiesDotJson.definitions.authentication);
          assert.notEqual(null, propertiesDotJson.definitions.authentication);
          assert.notEqual('', propertiesDotJson.definitions.authentication);
          assert.equal('string', propertiesDotJson.definitions.authentication.properties.auth_method.type);
          assert.equal('string', propertiesDotJson.definitions.authentication.properties.username.type);
          assert.equal('string', propertiesDotJson.definitions.authentication.properties.password.type);
          assert.equal('string', propertiesDotJson.definitions.authentication.properties.token.type);
          assert.equal('integer', propertiesDotJson.definitions.authentication.properties.invalid_token_error.type);
          assert.equal('integer', propertiesDotJson.definitions.authentication.properties.token_timeout.type);
          assert.equal('string', propertiesDotJson.definitions.authentication.properties.token_cache.type);
          assert.equal(true, Array.isArray(propertiesDotJson.definitions.authentication.properties.auth_field.type));
          assert.equal(true, Array.isArray(propertiesDotJson.definitions.authentication.properties.auth_field_format.type));
          assert.equal('boolean', propertiesDotJson.definitions.authentication.properties.auth_logging.type);
          assert.equal('string', propertiesDotJson.definitions.authentication.properties.client_id.type);
          assert.equal('string', propertiesDotJson.definitions.authentication.properties.client_secret.type);
          assert.equal('string', propertiesDotJson.definitions.authentication.properties.grant_type.type);
          assert.notEqual(undefined, propertiesDotJson.definitions.ssl);
          assert.notEqual(null, propertiesDotJson.definitions.ssl);
          assert.notEqual('', propertiesDotJson.definitions.ssl);
          assert.equal('string', propertiesDotJson.definitions.ssl.properties.ecdhCurve.type);
          assert.equal('boolean', propertiesDotJson.definitions.ssl.properties.enabled.type);
          assert.equal('boolean', propertiesDotJson.definitions.ssl.properties.accept_invalid_cert.type);
          assert.equal('string', propertiesDotJson.definitions.ssl.properties.ca_file.type);
          assert.equal('string', propertiesDotJson.definitions.ssl.properties.key_file.type);
          assert.equal('string', propertiesDotJson.definitions.ssl.properties.cert_file.type);
          assert.equal('string', propertiesDotJson.definitions.ssl.properties.secure_protocol.type);
          assert.equal('string', propertiesDotJson.definitions.ssl.properties.ciphers.type);
          assert.equal('string', propertiesDotJson.properties.base_path.type);
          assert.equal('string', propertiesDotJson.properties.version.type);
          assert.equal('string', propertiesDotJson.properties.cache_location.type);
          assert.equal('boolean', propertiesDotJson.properties.encode_pathvars.type);
          assert.equal('boolean', propertiesDotJson.properties.encode_queryvars.type);
          assert.equal(true, Array.isArray(propertiesDotJson.properties.save_metric.type));
          assert.notEqual(undefined, propertiesDotJson.definitions);
          assert.notEqual(null, propertiesDotJson.definitions);
          assert.notEqual('', propertiesDotJson.definitions);
          assert.notEqual(undefined, propertiesDotJson.definitions.healthcheck);
          assert.notEqual(null, propertiesDotJson.definitions.healthcheck);
          assert.notEqual('', propertiesDotJson.definitions.healthcheck);
          assert.equal('string', propertiesDotJson.definitions.healthcheck.properties.type.type);
          assert.equal('integer', propertiesDotJson.definitions.healthcheck.properties.frequency.type);
          assert.equal('object', propertiesDotJson.definitions.healthcheck.properties.query_object.type);
          assert.notEqual(undefined, propertiesDotJson.definitions.throttle);
          assert.notEqual(null, propertiesDotJson.definitions.throttle);
          assert.notEqual('', propertiesDotJson.definitions.throttle);
          assert.equal('boolean', propertiesDotJson.definitions.throttle.properties.throttle_enabled.type);
          assert.equal('integer', propertiesDotJson.definitions.throttle.properties.number_pronghorns.type);
          assert.equal('string', propertiesDotJson.definitions.throttle.properties.sync_async.type);
          assert.equal('integer', propertiesDotJson.definitions.throttle.properties.max_in_queue.type);
          assert.equal('integer', propertiesDotJson.definitions.throttle.properties.concurrent_max.type);
          assert.equal('integer', propertiesDotJson.definitions.throttle.properties.expire_timeout.type);
          assert.equal('integer', propertiesDotJson.definitions.throttle.properties.avg_runtime.type);
          assert.equal('array', propertiesDotJson.definitions.throttle.properties.priorities.type);
          assert.notEqual(undefined, propertiesDotJson.definitions.request);
          assert.notEqual(null, propertiesDotJson.definitions.request);
          assert.notEqual('', propertiesDotJson.definitions.request);
          assert.equal('integer', propertiesDotJson.definitions.request.properties.number_redirects.type);
          assert.equal('integer', propertiesDotJson.definitions.request.properties.number_retries.type);
          assert.equal(true, Array.isArray(propertiesDotJson.definitions.request.properties.limit_retry_error.type));
          assert.equal('array', propertiesDotJson.definitions.request.properties.failover_codes.type);
          assert.equal('integer', propertiesDotJson.definitions.request.properties.attempt_timeout.type);
          assert.equal('object', propertiesDotJson.definitions.request.properties.global_request.type);
          assert.equal('object', propertiesDotJson.definitions.request.properties.global_request.properties.payload.type);
          assert.equal('object', propertiesDotJson.definitions.request.properties.global_request.properties.uriOptions.type);
          assert.equal('object', propertiesDotJson.definitions.request.properties.global_request.properties.addlHeaders.type);
          assert.equal('object', propertiesDotJson.definitions.request.properties.global_request.properties.authData.type);
          assert.equal('boolean', propertiesDotJson.definitions.request.properties.healthcheck_on_timeout.type);
          assert.equal('boolean', propertiesDotJson.definitions.request.properties.return_raw.type);
          assert.equal('boolean', propertiesDotJson.definitions.request.properties.archiving.type);
          assert.equal('boolean', propertiesDotJson.definitions.request.properties.return_request.type);
          assert.notEqual(undefined, propertiesDotJson.definitions.proxy);
          assert.notEqual(null, propertiesDotJson.definitions.proxy);
          assert.notEqual('', propertiesDotJson.definitions.proxy);
          assert.equal('boolean', propertiesDotJson.definitions.proxy.properties.enabled.type);
          assert.equal('string', propertiesDotJson.definitions.proxy.properties.host.type);
          assert.equal('integer', propertiesDotJson.definitions.proxy.properties.port.type);
          assert.equal('string', propertiesDotJson.definitions.proxy.properties.protocol.type);
          assert.equal('string', propertiesDotJson.definitions.proxy.properties.username.type);
          assert.equal('string', propertiesDotJson.definitions.proxy.properties.password.type);
          assert.notEqual(undefined, propertiesDotJson.definitions.mongo);
          assert.notEqual(null, propertiesDotJson.definitions.mongo);
          assert.notEqual('', propertiesDotJson.definitions.mongo);
          assert.equal('string', propertiesDotJson.definitions.mongo.properties.host.type);
          assert.equal('integer', propertiesDotJson.definitions.mongo.properties.port.type);
          assert.equal('string', propertiesDotJson.definitions.mongo.properties.database.type);
          assert.equal('string', propertiesDotJson.definitions.mongo.properties.username.type);
          assert.equal('string', propertiesDotJson.definitions.mongo.properties.password.type);
          assert.equal('string', propertiesDotJson.definitions.mongo.properties.replSet.type);
          assert.equal('object', propertiesDotJson.definitions.mongo.properties.db_ssl.type);
          assert.equal('boolean', propertiesDotJson.definitions.mongo.properties.db_ssl.properties.enabled.type);
          assert.equal('boolean', propertiesDotJson.definitions.mongo.properties.db_ssl.properties.accept_invalid_cert.type);
          assert.equal('string', propertiesDotJson.definitions.mongo.properties.db_ssl.properties.ca_file.type);
          assert.equal('string', propertiesDotJson.definitions.mongo.properties.db_ssl.properties.key_file.type);
          assert.equal('string', propertiesDotJson.definitions.mongo.properties.db_ssl.properties.cert_file.type);
          assert.notEqual('', propertiesDotJson.definitions.devicebroker);
          assert.equal('array', propertiesDotJson.definitions.devicebroker.properties.getDevice.type);
          assert.equal('array', propertiesDotJson.definitions.devicebroker.properties.getDevicesFiltered.type);
          assert.equal('array', propertiesDotJson.definitions.devicebroker.properties.isAlive.type);
          assert.equal('array', propertiesDotJson.definitions.devicebroker.properties.getConfig.type);
          assert.equal('array', propertiesDotJson.definitions.devicebroker.properties.getCount.type);
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('error.json', () => {
      it('should have an error.json', (done) => {
        try {
          fs.exists('error.json', (val) => {
            assert.equal(true, val);
            done();
          });
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('error.json should have standard adapter errors', (done) => {
        try {
          const errorDotJson = require('../../error.json');
          assert.notEqual(undefined, errorDotJson.errors);
          assert.notEqual(null, errorDotJson.errors);
          assert.notEqual('', errorDotJson.errors);
          assert.equal(true, Array.isArray(errorDotJson.errors));
          assert.notEqual(0, errorDotJson.errors.length);
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.100'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.101'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.102'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.110'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.111'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.112'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.113'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.114'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.115'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.116'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.300'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.301'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.302'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.303'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.304'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.305'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.310'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.311'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.312'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.320'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.321'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.400'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.401'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.402'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.500'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.501'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.502'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.503'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.600'));
          assert.notEqual(undefined, errorDotJson.errors.find((e) => e.icode === 'AD.900'));
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('sampleProperties.json', () => {
      it('should have a sampleProperties.json', (done) => {
        try {
          fs.exists('sampleProperties.json', (val) => {
            assert.equal(true, val);
            done();
          });
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('sampleProperties.json should contain generic adapter properties', (done) => {
        try {
          const sampleDotJson = require('../../sampleProperties.json');
          assert.notEqual(-1, sampleDotJson.id.indexOf('checkpoint_management'));
          assert.equal('CheckpointManagement', sampleDotJson.type);
          assert.notEqual(undefined, sampleDotJson.properties);
          assert.notEqual(null, sampleDotJson.properties);
          assert.notEqual('', sampleDotJson.properties);
          assert.notEqual(undefined, sampleDotJson.properties.host);
          assert.notEqual(undefined, sampleDotJson.properties.port);
          assert.notEqual(undefined, sampleDotJson.properties.stub);
          assert.notEqual(undefined, sampleDotJson.properties.protocol);
          assert.notEqual(undefined, sampleDotJson.properties.authentication);
          assert.notEqual(null, sampleDotJson.properties.authentication);
          assert.notEqual('', sampleDotJson.properties.authentication);
          assert.notEqual(undefined, sampleDotJson.properties.authentication.auth_method);
          assert.notEqual(undefined, sampleDotJson.properties.authentication.username);
          assert.notEqual(undefined, sampleDotJson.properties.authentication.password);
          assert.notEqual(undefined, sampleDotJson.properties.authentication.token);
          assert.notEqual(undefined, sampleDotJson.properties.authentication.invalid_token_error);
          assert.notEqual(undefined, sampleDotJson.properties.authentication.token_timeout);
          assert.notEqual(undefined, sampleDotJson.properties.authentication.token_cache);
          assert.notEqual(undefined, sampleDotJson.properties.authentication.auth_field);
          assert.notEqual(undefined, sampleDotJson.properties.authentication.auth_field_format);
          assert.notEqual(undefined, sampleDotJson.properties.authentication.auth_logging);
          assert.notEqual(undefined, sampleDotJson.properties.authentication.client_id);
          assert.notEqual(undefined, sampleDotJson.properties.authentication.client_secret);
          assert.notEqual(undefined, sampleDotJson.properties.authentication.grant_type);
          assert.notEqual(undefined, sampleDotJson.properties.ssl);
          assert.notEqual(null, sampleDotJson.properties.ssl);
          assert.notEqual('', sampleDotJson.properties.ssl);
          assert.notEqual(undefined, sampleDotJson.properties.ssl.ecdhCurve);
          assert.notEqual(undefined, sampleDotJson.properties.ssl.enabled);
          assert.notEqual(undefined, sampleDotJson.properties.ssl.accept_invalid_cert);
          assert.notEqual(undefined, sampleDotJson.properties.ssl.ca_file);
          assert.notEqual(undefined, sampleDotJson.properties.ssl.key_file);
          assert.notEqual(undefined, sampleDotJson.properties.ssl.cert_file);
          assert.notEqual(undefined, sampleDotJson.properties.ssl.secure_protocol);
          assert.notEqual(undefined, sampleDotJson.properties.ssl.ciphers);
          assert.notEqual(undefined, sampleDotJson.properties.base_path);
          assert.notEqual(undefined, sampleDotJson.properties.version);
          assert.notEqual(undefined, sampleDotJson.properties.cache_location);
          assert.notEqual(undefined, sampleDotJson.properties.encode_pathvars);
          assert.notEqual(undefined, sampleDotJson.properties.encode_queryvars);
          assert.notEqual(undefined, sampleDotJson.properties.save_metric);
          assert.notEqual(undefined, sampleDotJson.properties.healthcheck);
          assert.notEqual(null, sampleDotJson.properties.healthcheck);
          assert.notEqual('', sampleDotJson.properties.healthcheck);
          assert.notEqual(undefined, sampleDotJson.properties.healthcheck.type);
          assert.notEqual(undefined, sampleDotJson.properties.healthcheck.frequency);
          assert.notEqual(undefined, sampleDotJson.properties.healthcheck.query_object);
          assert.notEqual(undefined, sampleDotJson.properties.throttle);
          assert.notEqual(null, sampleDotJson.properties.throttle);
          assert.notEqual('', sampleDotJson.properties.throttle);
          assert.notEqual(undefined, sampleDotJson.properties.throttle.throttle_enabled);
          assert.notEqual(undefined, sampleDotJson.properties.throttle.number_pronghorns);
          assert.notEqual(undefined, sampleDotJson.properties.throttle.sync_async);
          assert.notEqual(undefined, sampleDotJson.properties.throttle.max_in_queue);
          assert.notEqual(undefined, sampleDotJson.properties.throttle.concurrent_max);
          assert.notEqual(undefined, sampleDotJson.properties.throttle.expire_timeout);
          assert.notEqual(undefined, sampleDotJson.properties.throttle.avg_runtime);
          assert.notEqual(undefined, sampleDotJson.properties.throttle.priorities);
          assert.notEqual(undefined, sampleDotJson.properties.request);
          assert.notEqual(null, sampleDotJson.properties.request);
          assert.notEqual('', sampleDotJson.properties.request);
          assert.notEqual(undefined, sampleDotJson.properties.request.number_redirects);
          assert.notEqual(undefined, sampleDotJson.properties.request.number_retries);
          assert.notEqual(undefined, sampleDotJson.properties.request.limit_retry_error);
          assert.notEqual(undefined, sampleDotJson.properties.request.failover_codes);
          assert.notEqual(undefined, sampleDotJson.properties.request.attempt_timeout);
          assert.notEqual(undefined, sampleDotJson.properties.request.global_request);
          assert.notEqual(undefined, sampleDotJson.properties.request.global_request.payload);
          assert.notEqual(undefined, sampleDotJson.properties.request.global_request.uriOptions);
          assert.notEqual(undefined, sampleDotJson.properties.request.global_request.addlHeaders);
          assert.notEqual(undefined, sampleDotJson.properties.request.global_request.authData);
          assert.notEqual(undefined, sampleDotJson.properties.request.healthcheck_on_timeout);
          assert.notEqual(undefined, sampleDotJson.properties.request.return_raw);
          assert.notEqual(undefined, sampleDotJson.properties.request.archiving);
          assert.notEqual(undefined, sampleDotJson.properties.request.return_request);
          assert.notEqual(undefined, sampleDotJson.properties.proxy);
          assert.notEqual(null, sampleDotJson.properties.proxy);
          assert.notEqual('', sampleDotJson.properties.proxy);
          assert.notEqual(undefined, sampleDotJson.properties.proxy.enabled);
          assert.notEqual(undefined, sampleDotJson.properties.proxy.host);
          assert.notEqual(undefined, sampleDotJson.properties.proxy.port);
          assert.notEqual(undefined, sampleDotJson.properties.proxy.protocol);
          assert.notEqual(undefined, sampleDotJson.properties.proxy.username);
          assert.notEqual(undefined, sampleDotJson.properties.proxy.password);
          assert.notEqual(undefined, sampleDotJson.properties.mongo);
          assert.notEqual(null, sampleDotJson.properties.mongo);
          assert.notEqual('', sampleDotJson.properties.mongo);
          assert.notEqual(undefined, sampleDotJson.properties.mongo.host);
          assert.notEqual(undefined, sampleDotJson.properties.mongo.port);
          assert.notEqual(undefined, sampleDotJson.properties.mongo.database);
          assert.notEqual(undefined, sampleDotJson.properties.mongo.username);
          assert.notEqual(undefined, sampleDotJson.properties.mongo.password);
          assert.notEqual(undefined, sampleDotJson.properties.mongo.replSet);
          assert.notEqual(undefined, sampleDotJson.properties.mongo.db_ssl);
          assert.notEqual(undefined, sampleDotJson.properties.mongo.db_ssl.enabled);
          assert.notEqual(undefined, sampleDotJson.properties.mongo.db_ssl.accept_invalid_cert);
          assert.notEqual(undefined, sampleDotJson.properties.mongo.db_ssl.ca_file);
          assert.notEqual(undefined, sampleDotJson.properties.mongo.db_ssl.key_file);
          assert.notEqual(undefined, sampleDotJson.properties.mongo.db_ssl.cert_file);
          assert.notEqual(undefined, sampleDotJson.properties.devicebroker);
          assert.notEqual(undefined, sampleDotJson.properties.devicebroker.getDevice);
          assert.notEqual(undefined, sampleDotJson.properties.devicebroker.getDevicesFiltered);
          assert.notEqual(undefined, sampleDotJson.properties.devicebroker.isAlive);
          assert.notEqual(undefined, sampleDotJson.properties.devicebroker.getConfig);
          assert.notEqual(undefined, sampleDotJson.properties.devicebroker.getCount);
          assert.notEqual(undefined, sampleDotJson.properties.cache);
          assert.notEqual(undefined, sampleDotJson.properties.cache.entities);
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#checkProperties', () => {
      it('should have a checkProperties function', (done) => {
        try {
          assert.equal(true, typeof a.checkProperties === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('the sample properties should be good - if failure change the log level', (done) => {
        try {
          const samplePropsJson = require('../../sampleProperties.json');
          const clean = a.checkProperties(samplePropsJson.properties);

          try {
            assert.notEqual(0, Object.keys(clean));
            assert.equal(undefined, clean.exception);
            assert.notEqual(undefined, clean.host);
            assert.notEqual(null, clean.host);
            assert.notEqual('', clean.host);
            done();
          } catch (err) {
            log.error(`Test Failure: ${err}`);
            done(err);
          }
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('README.md', () => {
      it('should have a README', (done) => {
        try {
          fs.exists('README.md', (val) => {
            assert.equal(true, val);
            done();
          });
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('README.md should be customized', (done) => {
        try {
          fs.readFile('README.md', 'utf8', (err, data) => {
            assert.equal(-1, data.indexOf('[System]'));
            assert.equal(-1, data.indexOf('[system]'));
            assert.equal(-1, data.indexOf('[version]'));
            assert.equal(-1, data.indexOf('[namespace]'));
            done();
          });
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#connect', () => {
      it('should have a connect function', (done) => {
        try {
          assert.equal(true, typeof a.connect === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#healthCheck', () => {
      it('should have a healthCheck function', (done) => {
        try {
          assert.equal(true, typeof a.healthCheck === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#iapUpdateAdapterConfiguration', () => {
      it('should have a iapUpdateAdapterConfiguration function', (done) => {
        try {
          assert.equal(true, typeof a.iapUpdateAdapterConfiguration === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#iapSuspendAdapter', () => {
      it('should have a iapSuspendAdapter function', (done) => {
        try {
          assert.equal(true, typeof a.iapSuspendAdapter === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#iapUnsuspendAdapter', () => {
      it('should have a iapUnsuspendAdapter function', (done) => {
        try {
          assert.equal(true, typeof a.iapUnsuspendAdapter === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#iapGetAdapterQueue', () => {
      it('should have a iapGetAdapterQueue function', (done) => {
        try {
          assert.equal(true, typeof a.iapGetAdapterQueue === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#iapFindAdapterPath', () => {
      it('should have a iapFindAdapterPath function', (done) => {
        try {
          assert.equal(true, typeof a.iapFindAdapterPath === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('iapFindAdapterPath should find atleast one path that matches', (done) => {
        try {
          a.iapFindAdapterPath('{base_path}/{version}', (data, error) => {
            try {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(true, data.found);
              assert.notEqual(undefined, data.foundIn);
              assert.notEqual(null, data.foundIn);
              assert.notEqual(0, data.foundIn.length);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#iapTroubleshootAdapter', () => {
      it('should have a iapTroubleshootAdapter function', (done) => {
        try {
          assert.equal(true, typeof a.iapTroubleshootAdapter === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#iapRunAdapterHealthcheck', () => {
      it('should have a iapRunAdapterHealthcheck function', (done) => {
        try {
          assert.equal(true, typeof a.iapRunAdapterHealthcheck === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#iapRunAdapterConnectivity', () => {
      it('should have a iapRunAdapterConnectivity function', (done) => {
        try {
          assert.equal(true, typeof a.iapRunAdapterConnectivity === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#iapRunAdapterBasicGet', () => {
      it('should have a iapRunAdapterBasicGet function', (done) => {
        try {
          assert.equal(true, typeof a.iapRunAdapterBasicGet === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#iapMoveAdapterEntitiesToDB', () => {
      it('should have a iapMoveAdapterEntitiesToDB function', (done) => {
        try {
          assert.equal(true, typeof a.iapMoveAdapterEntitiesToDB === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#checkActionFiles', () => {
      it('should have a checkActionFiles function', (done) => {
        try {
          assert.equal(true, typeof a.checkActionFiles === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('the action files should be good - if failure change the log level as most issues are warnings', (done) => {
        try {
          const clean = a.checkActionFiles();

          try {
            for (let c = 0; c < clean.length; c += 1) {
              log.error(clean[c]);
            }
            assert.equal(0, clean.length);
            done();
          } catch (err) {
            log.error(`Test Failure: ${err}`);
            done(err);
          }
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#encryptProperty', () => {
      it('should have a encryptProperty function', (done) => {
        try {
          assert.equal(true, typeof a.encryptProperty === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('should get base64 encoded property', (done) => {
        try {
          a.encryptProperty('testing', 'base64', (data, error) => {
            try {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(undefined, data.response);
              assert.notEqual(null, data.response);
              assert.equal(0, data.response.indexOf('{code}'));
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should get encrypted property', (done) => {
        try {
          a.encryptProperty('testing', 'encrypt', (data, error) => {
            try {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(undefined, data.response);
              assert.notEqual(null, data.response);
              assert.equal(0, data.response.indexOf('{crypt}'));
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#iapDeactivateTasks', () => {
      it('should have a iapDeactivateTasks function', (done) => {
        try {
          assert.equal(true, typeof a.iapDeactivateTasks === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#iapActivateTasks', () => {
      it('should have a iapActivateTasks function', (done) => {
        try {
          assert.equal(true, typeof a.iapActivateTasks === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#iapPopulateEntityCache', () => {
      it('should have a iapPopulateEntityCache function', (done) => {
        try {
          assert.equal(true, typeof a.iapPopulateEntityCache === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#iapRetrieveEntitiesCache', () => {
      it('should have a iapRetrieveEntitiesCache function', (done) => {
        try {
          assert.equal(true, typeof a.iapRetrieveEntitiesCache === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#hasEntities', () => {
      it('should have a hasEntities function', (done) => {
        try {
          assert.equal(true, typeof a.hasEntities === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#getDevice', () => {
      it('should have a getDevice function', (done) => {
        try {
          assert.equal(true, typeof a.getDevice === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#getDevicesFiltered', () => {
      it('should have a getDevicesFiltered function', (done) => {
        try {
          assert.equal(true, typeof a.getDevicesFiltered === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#isAlive', () => {
      it('should have a isAlive function', (done) => {
        try {
          assert.equal(true, typeof a.isAlive === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#getConfig', () => {
      it('should have a getConfig function', (done) => {
        try {
          assert.equal(true, typeof a.getConfig === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#iapGetDeviceCount', () => {
      it('should have a iapGetDeviceCount function', (done) => {
        try {
          assert.equal(true, typeof a.iapGetDeviceCount === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#iapExpandedGenericAdapterRequest', () => {
      it('should have a iapExpandedGenericAdapterRequest function', (done) => {
        try {
          assert.equal(true, typeof a.iapExpandedGenericAdapterRequest === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#genericAdapterRequest', () => {
      it('should have a genericAdapterRequest function', (done) => {
        try {
          assert.equal(true, typeof a.genericAdapterRequest === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#genericAdapterRequestNoBasePath', () => {
      it('should have a genericAdapterRequestNoBasePath function', (done) => {
        try {
          assert.equal(true, typeof a.genericAdapterRequestNoBasePath === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#iapRunAdapterLint', () => {
      it('should have a iapRunAdapterLint function', (done) => {
        try {
          assert.equal(true, typeof a.iapRunAdapterLint === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('retrieve the lint results', (done) => {
        try {
          a.iapRunAdapterLint((data, error) => {
            try {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(undefined, data.status);
              assert.notEqual(null, data.status);
              assert.equal('SUCCESS', data.status);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#iapRunAdapterTests', () => {
      it('should have a iapRunAdapterTests function', (done) => {
        try {
          assert.equal(true, typeof a.iapRunAdapterTests === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });

    describe('#iapGetAdapterInventory', () => {
      it('should have a iapGetAdapterInventory function', (done) => {
        try {
          assert.equal(true, typeof a.iapGetAdapterInventory === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('retrieve the inventory', (done) => {
        try {
          a.iapGetAdapterInventory((data, error) => {
            try {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });
    describe('metadata.json', () => {
      it('should have a metadata.json', (done) => {
        try {
          fs.exists('metadata.json', (val) => {
            assert.equal(true, val);
            done();
          });
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('metadata.json is customized', (done) => {
        try {
          const metadataDotJson = require('../../metadata.json');
          assert.equal('adapter-checkpoint_management', metadataDotJson.name);
          assert.notEqual(undefined, metadataDotJson.webName);
          assert.notEqual(null, metadataDotJson.webName);
          assert.notEqual('', metadataDotJson.webName);
          assert.equal('Adapter', metadataDotJson.type);
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('metadata.json contains accurate documentation', (done) => {
        try {
          const metadataDotJson = require('../../metadata.json');
          assert.notEqual(undefined, metadataDotJson.documentation);
          assert.equal('https://www.npmjs.com/package/@itentialopensource/adapter-checkpoint_management', metadataDotJson.documentation.npmLink);
          assert.equal('https://docs.itential.com/opensource/docs/troubleshooting-an-adapter', metadataDotJson.documentation.faqLink);
          assert.equal('https://gitlab.com/itentialopensource/adapters/contributing-guide', metadataDotJson.documentation.contributeLink);
          assert.equal('https://itential.atlassian.net/servicedesk/customer/portals', metadataDotJson.documentation.issueLink);
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('metadata.json has related items', (done) => {
        try {
          const metadataDotJson = require('../../metadata.json');
          assert.notEqual(undefined, metadataDotJson.relatedItems);
          assert.notEqual(undefined, metadataDotJson.relatedItems.adapters);
          assert.notEqual(undefined, metadataDotJson.relatedItems.integrations);
          assert.notEqual(undefined, metadataDotJson.relatedItems.ecosystemApplications);
          assert.notEqual(undefined, metadataDotJson.relatedItems.workflowProjects);
          assert.notEqual(undefined, metadataDotJson.relatedItems.transformationProjects);
          assert.notEqual(undefined, metadataDotJson.relatedItems.exampleProjects);
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
    });
    /*
    -----------------------------------------------------------------------
    -----------------------------------------------------------------------
    *** All code above this comment will be replaced during a migration ***
    ******************* DO NOT REMOVE THIS COMMENT BLOCK ******************
    -----------------------------------------------------------------------
    -----------------------------------------------------------------------
    */

    describe('#login - errors', () => {
      it('should have a login function', (done) => {
        try {
          assert.equal(true, typeof a.login === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.login(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-login', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#publish - errors', () => {
      it('should have a publish function', (done) => {
        try {
          assert.equal(true, typeof a.publish === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.publish(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-publishWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#discard - errors', () => {
      it('should have a discard function', (done) => {
        try {
          assert.equal(true, typeof a.discard === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.discard(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-discardWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#logout - errors', () => {
      it('should have a logout function', (done) => {
        try {
          assert.equal(true, typeof a.logout === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.logout(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-logoutWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#disconnect - errors', () => {
      it('should have a disconnect function', (done) => {
        try {
          assert.equal(true, typeof a.disconnect === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.disconnect(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-disconnectWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#keepalive - errors', () => {
      it('should have a keepalive function', (done) => {
        try {
          assert.equal(true, typeof a.keepalive === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.keepalive(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-keepaliveWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showSession - errors', () => {
      it('should have a showSession function', (done) => {
        try {
          assert.equal(true, typeof a.showSession === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showSession(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showSessionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setSession - errors', () => {
      it('should have a setSession function', (done) => {
        try {
          assert.equal(true, typeof a.setSession === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setSession(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setSessionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#continueSessionInSmartconsole - errors', () => {
      it('should have a continueSessionInSmartconsole function', (done) => {
        try {
          assert.equal(true, typeof a.continueSessionInSmartconsole === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.continueSessionInSmartconsole(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-continueSessionInSmartconsoleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showLastPublishedSession - errors', () => {
      it('should have a showLastPublishedSession function', (done) => {
        try {
          assert.equal(true, typeof a.showLastPublishedSession === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showLastPublishedSession(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showLastPublishedSessionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#purgePublishedSessionsByCount - errors', () => {
      it('should have a purgePublishedSessionsByCount function', (done) => {
        try {
          assert.equal(true, typeof a.purgePublishedSessionsByCount === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.purgePublishedSessionsByCount(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-purgePublishedSessionsByCountWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#switchSession - errors', () => {
      it('should have a switchSession function', (done) => {
        try {
          assert.equal(true, typeof a.switchSession === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.switchSession(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-switchSessionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#assignSession - errors', () => {
      it('should have a assignSession function', (done) => {
        try {
          assert.equal(true, typeof a.assignSession === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.assignSession(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-assignSessionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#takeOverSession - errors', () => {
      it('should have a takeOverSession function', (done) => {
        try {
          assert.equal(true, typeof a.takeOverSession === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.takeOverSession(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-takeOverSessionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showSessions - errors', () => {
      it('should have a showSessions function', (done) => {
        try {
          assert.equal(true, typeof a.showSessions === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showSessions(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showSessionsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showLoginMessage - errors', () => {
      it('should have a showLoginMessage function', (done) => {
        try {
          assert.equal(true, typeof a.showLoginMessage === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showLoginMessage(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showLoginMessageWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setLoginMessage - errors', () => {
      it('should have a setLoginMessage function', (done) => {
        try {
          assert.equal(true, typeof a.setLoginMessage === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setLoginMessage(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setLoginMessageWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addHost - errors', () => {
      it('should have a addHost function', (done) => {
        try {
          assert.equal(true, typeof a.addHost === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addHost(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addHostWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showHost - errors', () => {
      it('should have a showHost function', (done) => {
        try {
          assert.equal(true, typeof a.showHost === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showHost(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showHostWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setHost - errors', () => {
      it('should have a setHost function', (done) => {
        try {
          assert.equal(true, typeof a.setHost === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setHost(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setHostWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteHost - errors', () => {
      it('should have a deleteHost function', (done) => {
        try {
          assert.equal(true, typeof a.deleteHost === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteHost(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteHostWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showHosts - errors', () => {
      it('should have a showHosts function', (done) => {
        try {
          assert.equal(true, typeof a.showHosts === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showHosts(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showHostsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addNetwork - errors', () => {
      it('should have a addNetwork function', (done) => {
        try {
          assert.equal(true, typeof a.addNetwork === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addNetwork(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addNetworkWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showNetwork - errors', () => {
      it('should have a showNetwork function', (done) => {
        try {
          assert.equal(true, typeof a.showNetwork === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showNetwork(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showNetworkWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setNetwork - errors', () => {
      it('should have a setNetwork function', (done) => {
        try {
          assert.equal(true, typeof a.setNetwork === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setNetwork(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setNetworkWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteNetwork - errors', () => {
      it('should have a deleteNetwork function', (done) => {
        try {
          assert.equal(true, typeof a.deleteNetwork === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteNetwork(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteNetworkWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showNetworks - errors', () => {
      it('should have a showNetworks function', (done) => {
        try {
          assert.equal(true, typeof a.showNetworks === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showNetworks(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showNetworksWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addWildcard - errors', () => {
      it('should have a addWildcard function', (done) => {
        try {
          assert.equal(true, typeof a.addWildcard === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addWildcard(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addWildcardWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showWildcard - errors', () => {
      it('should have a showWildcard function', (done) => {
        try {
          assert.equal(true, typeof a.showWildcard === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showWildcard(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showWildcardWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setWildcard - errors', () => {
      it('should have a setWildcard function', (done) => {
        try {
          assert.equal(true, typeof a.setWildcard === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setWildcard(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setWildcardWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteWildcard - errors', () => {
      it('should have a deleteWildcard function', (done) => {
        try {
          assert.equal(true, typeof a.deleteWildcard === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteWildcard(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteWildcardWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showWildcards - errors', () => {
      it('should have a showWildcards function', (done) => {
        try {
          assert.equal(true, typeof a.showWildcards === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showWildcards(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showWildcardsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addGroupWithGroup - errors', () => {
      it('should have a addGroupWithGroup function', (done) => {
        try {
          assert.equal(true, typeof a.addGroupWithGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addGroupWithGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addGroupWithGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showGroup - errors', () => {
      it('should have a showGroup function', (done) => {
        try {
          assert.equal(true, typeof a.showGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setGroup - errors', () => {
      it('should have a setGroup function', (done) => {
        try {
          assert.equal(true, typeof a.setGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteGroup - errors', () => {
      it('should have a deleteGroup function', (done) => {
        try {
          assert.equal(true, typeof a.deleteGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showGroups - errors', () => {
      it('should have a showGroups function', (done) => {
        try {
          assert.equal(true, typeof a.showGroups === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showGroups(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showGroupsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addAddressRange - errors', () => {
      it('should have a addAddressRange function', (done) => {
        try {
          assert.equal(true, typeof a.addAddressRange === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addAddressRange(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addAddressRangeWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showAddressRange - errors', () => {
      it('should have a showAddressRange function', (done) => {
        try {
          assert.equal(true, typeof a.showAddressRange === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showAddressRange(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showAddressRangeWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setAddressRange - errors', () => {
      it('should have a setAddressRange function', (done) => {
        try {
          assert.equal(true, typeof a.setAddressRange === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setAddressRange(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setAddressRangeWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteAddressRange - errors', () => {
      it('should have a deleteAddressRange function', (done) => {
        try {
          assert.equal(true, typeof a.deleteAddressRange === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteAddressRange(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteAddressRangeWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showAddressRanges - errors', () => {
      it('should have a showAddressRanges function', (done) => {
        try {
          assert.equal(true, typeof a.showAddressRanges === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showAddressRanges(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showAddressRangesWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addMulticastAddressRangeIpRange - errors', () => {
      it('should have a addMulticastAddressRangeIpRange function', (done) => {
        try {
          assert.equal(true, typeof a.addMulticastAddressRangeIpRange === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addMulticastAddressRangeIpRange(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addMulticastAddressRangeIpRangeWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showMulticastAddressRange - errors', () => {
      it('should have a showMulticastAddressRange function', (done) => {
        try {
          assert.equal(true, typeof a.showMulticastAddressRange === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showMulticastAddressRange(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showMulticastAddressRangeWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setMulticastAddressRange - errors', () => {
      it('should have a setMulticastAddressRange function', (done) => {
        try {
          assert.equal(true, typeof a.setMulticastAddressRange === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setMulticastAddressRange(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setMulticastAddressRangeWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteMulticastAddressRange - errors', () => {
      it('should have a deleteMulticastAddressRange function', (done) => {
        try {
          assert.equal(true, typeof a.deleteMulticastAddressRange === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteMulticastAddressRange(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteMulticastAddressRangeWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showMulticastAddressRanges - errors', () => {
      it('should have a showMulticastAddressRanges function', (done) => {
        try {
          assert.equal(true, typeof a.showMulticastAddressRanges === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showMulticastAddressRanges(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showMulticastAddressRangesWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addGroupWithExclusion - errors', () => {
      it('should have a addGroupWithExclusion function', (done) => {
        try {
          assert.equal(true, typeof a.addGroupWithExclusion === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addGroupWithExclusion(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addGroupWithExclusionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showGroupWithExclusion - errors', () => {
      it('should have a showGroupWithExclusion function', (done) => {
        try {
          assert.equal(true, typeof a.showGroupWithExclusion === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showGroupWithExclusion(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showGroupWithExclusionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setGroupWithExclusion - errors', () => {
      it('should have a setGroupWithExclusion function', (done) => {
        try {
          assert.equal(true, typeof a.setGroupWithExclusion === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setGroupWithExclusion(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setGroupWithExclusionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteGroupWithExclusion - errors', () => {
      it('should have a deleteGroupWithExclusion function', (done) => {
        try {
          assert.equal(true, typeof a.deleteGroupWithExclusion === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteGroupWithExclusion(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteGroupWithExclusionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showGroupsWithExclusion - errors', () => {
      it('should have a showGroupsWithExclusion function', (done) => {
        try {
          assert.equal(true, typeof a.showGroupsWithExclusion === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showGroupsWithExclusion(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showGroupsWithExclusionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addSimpleGateway - errors', () => {
      it('should have a addSimpleGateway function', (done) => {
        try {
          assert.equal(true, typeof a.addSimpleGateway === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addSimpleGateway(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addSimpleGatewayWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showSimpleGateway - errors', () => {
      it('should have a showSimpleGateway function', (done) => {
        try {
          assert.equal(true, typeof a.showSimpleGateway === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showSimpleGateway(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showSimpleGatewayWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setSimpleGateway - errors', () => {
      it('should have a setSimpleGateway function', (done) => {
        try {
          assert.equal(true, typeof a.setSimpleGateway === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setSimpleGateway(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setSimpleGatewayWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteSimpleGateway - errors', () => {
      it('should have a deleteSimpleGateway function', (done) => {
        try {
          assert.equal(true, typeof a.deleteSimpleGateway === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteSimpleGateway(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteSimpleGatewayWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showSimpleGateways - errors', () => {
      it('should have a showSimpleGateways function', (done) => {
        try {
          assert.equal(true, typeof a.showSimpleGateways === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showSimpleGateways(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showSimpleGatewaysWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addSecurityZone - errors', () => {
      it('should have a addSecurityZone function', (done) => {
        try {
          assert.equal(true, typeof a.addSecurityZone === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addSecurityZone(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addSecurityZoneWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showSecurityZone - errors', () => {
      it('should have a showSecurityZone function', (done) => {
        try {
          assert.equal(true, typeof a.showSecurityZone === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showSecurityZone(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showSecurityZoneWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setSecurityZone - errors', () => {
      it('should have a setSecurityZone function', (done) => {
        try {
          assert.equal(true, typeof a.setSecurityZone === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setSecurityZone(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setSecurityZoneWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteSecurityZone - errors', () => {
      it('should have a deleteSecurityZone function', (done) => {
        try {
          assert.equal(true, typeof a.deleteSecurityZone === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteSecurityZone(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteSecurityZoneWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showSecurityZones - errors', () => {
      it('should have a showSecurityZones function', (done) => {
        try {
          assert.equal(true, typeof a.showSecurityZones === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showSecurityZones(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showSecurityZonesWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addTime - errors', () => {
      it('should have a addTime function', (done) => {
        try {
          assert.equal(true, typeof a.addTime === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addTime(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addTimeWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showTime - errors', () => {
      it('should have a showTime function', (done) => {
        try {
          assert.equal(true, typeof a.showTime === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showTime(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showTimeWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setTime - errors', () => {
      it('should have a setTime function', (done) => {
        try {
          assert.equal(true, typeof a.setTime === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setTime(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setTimeWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteTime - errors', () => {
      it('should have a deleteTime function', (done) => {
        try {
          assert.equal(true, typeof a.deleteTime === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteTime(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteTimeWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showTimes - errors', () => {
      it('should have a showTimes function', (done) => {
        try {
          assert.equal(true, typeof a.showTimes === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showTimes(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showTimesWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addTimeGroup - errors', () => {
      it('should have a addTimeGroup function', (done) => {
        try {
          assert.equal(true, typeof a.addTimeGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addTimeGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addTimeGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showTimeGroup - errors', () => {
      it('should have a showTimeGroup function', (done) => {
        try {
          assert.equal(true, typeof a.showTimeGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showTimeGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showTimeGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setTimeGroup - errors', () => {
      it('should have a setTimeGroup function', (done) => {
        try {
          assert.equal(true, typeof a.setTimeGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setTimeGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setTimeGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteTimeGroup - errors', () => {
      it('should have a deleteTimeGroup function', (done) => {
        try {
          assert.equal(true, typeof a.deleteTimeGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteTimeGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteTimeGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showTimeGroups - errors', () => {
      it('should have a showTimeGroups function', (done) => {
        try {
          assert.equal(true, typeof a.showTimeGroups === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showTimeGroups(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showTimeGroupsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addAccessRole - errors', () => {
      it('should have a addAccessRole function', (done) => {
        try {
          assert.equal(true, typeof a.addAccessRole === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addAccessRole(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addAccessRoleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showAccessRole - errors', () => {
      it('should have a showAccessRole function', (done) => {
        try {
          assert.equal(true, typeof a.showAccessRole === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showAccessRole(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showAccessRoleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setAccessRole - errors', () => {
      it('should have a setAccessRole function', (done) => {
        try {
          assert.equal(true, typeof a.setAccessRole === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setAccessRole(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setAccessRoleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteAccessRole - errors', () => {
      it('should have a deleteAccessRole function', (done) => {
        try {
          assert.equal(true, typeof a.deleteAccessRole === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteAccessRole(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteAccessRoleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showAccessRoles - errors', () => {
      it('should have a showAccessRoles function', (done) => {
        try {
          assert.equal(true, typeof a.showAccessRoles === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showAccessRoles(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showAccessRolesWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addDynamicObject - errors', () => {
      it('should have a addDynamicObject function', (done) => {
        try {
          assert.equal(true, typeof a.addDynamicObject === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addDynamicObject(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addDynamicObjectWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showDynamicObject - errors', () => {
      it('should have a showDynamicObject function', (done) => {
        try {
          assert.equal(true, typeof a.showDynamicObject === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showDynamicObject(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showDynamicObjectWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setDynamicObject - errors', () => {
      it('should have a setDynamicObject function', (done) => {
        try {
          assert.equal(true, typeof a.setDynamicObject === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setDynamicObject(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setDynamicObjectWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteDynamicObject - errors', () => {
      it('should have a deleteDynamicObject function', (done) => {
        try {
          assert.equal(true, typeof a.deleteDynamicObject === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteDynamicObject(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteDynamicObjectWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showDynamicObjects - errors', () => {
      it('should have a showDynamicObjects function', (done) => {
        try {
          assert.equal(true, typeof a.showDynamicObjects === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showDynamicObjects(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showDynamicObjectsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addTrustedClient - errors', () => {
      it('should have a addTrustedClient function', (done) => {
        try {
          assert.equal(true, typeof a.addTrustedClient === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addTrustedClient(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addTrustedClientWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showTrustedClient - errors', () => {
      it('should have a showTrustedClient function', (done) => {
        try {
          assert.equal(true, typeof a.showTrustedClient === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showTrustedClient(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showTrustedClientWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setTrustedClient - errors', () => {
      it('should have a setTrustedClient function', (done) => {
        try {
          assert.equal(true, typeof a.setTrustedClient === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setTrustedClient(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setTrustedClientWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteTrustedClient - errors', () => {
      it('should have a deleteTrustedClient function', (done) => {
        try {
          assert.equal(true, typeof a.deleteTrustedClient === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteTrustedClient(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteTrustedClientWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showTrustedClients - errors', () => {
      it('should have a showTrustedClients function', (done) => {
        try {
          assert.equal(true, typeof a.showTrustedClients === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showTrustedClients(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showTrustedClientsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addTag - errors', () => {
      it('should have a addTag function', (done) => {
        try {
          assert.equal(true, typeof a.addTag === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addTag(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addTagWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showTag - errors', () => {
      it('should have a showTag function', (done) => {
        try {
          assert.equal(true, typeof a.showTag === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showTag(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showTagWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setTag - errors', () => {
      it('should have a setTag function', (done) => {
        try {
          assert.equal(true, typeof a.setTag === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setTag(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setTagWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteTag - errors', () => {
      it('should have a deleteTag function', (done) => {
        try {
          assert.equal(true, typeof a.deleteTag === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteTag(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteTagWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showTags - errors', () => {
      it('should have a showTags function', (done) => {
        try {
          assert.equal(true, typeof a.showTags === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showTags(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showTagsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addDnsDomain - errors', () => {
      it('should have a addDnsDomain function', (done) => {
        try {
          assert.equal(true, typeof a.addDnsDomain === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addDnsDomain(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addDnsDomainWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showDnsDomain - errors', () => {
      it('should have a showDnsDomain function', (done) => {
        try {
          assert.equal(true, typeof a.showDnsDomain === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showDnsDomain(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showDnsDomainWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setDnsDomain - errors', () => {
      it('should have a setDnsDomain function', (done) => {
        try {
          assert.equal(true, typeof a.setDnsDomain === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setDnsDomain(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setDnsDomainWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteDnsDomain - errors', () => {
      it('should have a deleteDnsDomain function', (done) => {
        try {
          assert.equal(true, typeof a.deleteDnsDomain === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteDnsDomain(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteDnsDomainWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showDnsDomains - errors', () => {
      it('should have a showDnsDomains function', (done) => {
        try {
          assert.equal(true, typeof a.showDnsDomains === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showDnsDomains(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showDnsDomainsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addOpsecApplication - errors', () => {
      it('should have a addOpsecApplication function', (done) => {
        try {
          assert.equal(true, typeof a.addOpsecApplication === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addOpsecApplication(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addOpsecApplicationWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showOpsecApplication - errors', () => {
      it('should have a showOpsecApplication function', (done) => {
        try {
          assert.equal(true, typeof a.showOpsecApplication === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showOpsecApplication(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showOpsecApplicationWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setOpsecApplication - errors', () => {
      it('should have a setOpsecApplication function', (done) => {
        try {
          assert.equal(true, typeof a.setOpsecApplication === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setOpsecApplication(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setOpsecApplicationWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteOpsecApplication - errors', () => {
      it('should have a deleteOpsecApplication function', (done) => {
        try {
          assert.equal(true, typeof a.deleteOpsecApplication === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteOpsecApplication(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteOpsecApplicationWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showOpsecApplications - errors', () => {
      it('should have a showOpsecApplications function', (done) => {
        try {
          assert.equal(true, typeof a.showOpsecApplications === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showOpsecApplications(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showOpsecApplicationsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showDataCenterContent - errors', () => {
      it('should have a showDataCenterContent function', (done) => {
        try {
          assert.equal(true, typeof a.showDataCenterContent === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showDataCenterContent(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showDataCenterContentWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showDataCenter - errors', () => {
      it('should have a showDataCenter function', (done) => {
        try {
          assert.equal(true, typeof a.showDataCenter === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showDataCenter(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showDataCenterWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showDataCenters - errors', () => {
      it('should have a showDataCenters function', (done) => {
        try {
          assert.equal(true, typeof a.showDataCenters === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showDataCenters(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showDataCentersWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addDataCenterObjectWithGroup - errors', () => {
      it('should have a addDataCenterObjectWithGroup function', (done) => {
        try {
          assert.equal(true, typeof a.addDataCenterObjectWithGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addDataCenterObjectWithGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addDataCenterObjectWithGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showDataCenterObject - errors', () => {
      it('should have a showDataCenterObject function', (done) => {
        try {
          assert.equal(true, typeof a.showDataCenterObject === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showDataCenterObject(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showDataCenterObjectWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteDataCenterObject - errors', () => {
      it('should have a deleteDataCenterObject function', (done) => {
        try {
          assert.equal(true, typeof a.deleteDataCenterObject === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteDataCenterObject(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteDataCenterObjectWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showDataCenterObjects - errors', () => {
      it('should have a showDataCenterObjects function', (done) => {
        try {
          assert.equal(true, typeof a.showDataCenterObjects === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showDataCenterObjects(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showDataCenterObjectsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showUpdatableObjectsRepositoryContent - errors', () => {
      it('should have a showUpdatableObjectsRepositoryContent function', (done) => {
        try {
          assert.equal(true, typeof a.showUpdatableObjectsRepositoryContent === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showUpdatableObjectsRepositoryContent(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showUpdatableObjectsRepositoryContentWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#updateUpdatableObjectsRepositoryContent - errors', () => {
      it('should have a updateUpdatableObjectsRepositoryContent function', (done) => {
        try {
          assert.equal(true, typeof a.updateUpdatableObjectsRepositoryContent === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.updateUpdatableObjectsRepositoryContent(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-updateUpdatableObjectsRepositoryContentWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addUpdatableObject - errors', () => {
      it('should have a addUpdatableObject function', (done) => {
        try {
          assert.equal(true, typeof a.addUpdatableObject === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addUpdatableObject(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addUpdatableObjectWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showUpdatableObject - errors', () => {
      it('should have a showUpdatableObject function', (done) => {
        try {
          assert.equal(true, typeof a.showUpdatableObject === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showUpdatableObject(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showUpdatableObjectWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteUpdatableObject - errors', () => {
      it('should have a deleteUpdatableObject function', (done) => {
        try {
          assert.equal(true, typeof a.deleteUpdatableObject === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteUpdatableObject(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteUpdatableObjectWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showUpdatableObjects - errors', () => {
      it('should have a showUpdatableObjects function', (done) => {
        try {
          assert.equal(true, typeof a.showUpdatableObjects === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showUpdatableObjects(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showUpdatableObjectsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addServiceTcp - errors', () => {
      it('should have a addServiceTcp function', (done) => {
        try {
          assert.equal(true, typeof a.addServiceTcp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addServiceTcp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addServiceTcpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServiceTcp - errors', () => {
      it('should have a showServiceTcp function', (done) => {
        try {
          assert.equal(true, typeof a.showServiceTcp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServiceTcp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServiceTcpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setServiceTcp - errors', () => {
      it('should have a setServiceTcp function', (done) => {
        try {
          assert.equal(true, typeof a.setServiceTcp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setServiceTcp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setServiceTcpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteServiceTcp - errors', () => {
      it('should have a deleteServiceTcp function', (done) => {
        try {
          assert.equal(true, typeof a.deleteServiceTcp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteServiceTcp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteServiceTcpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServicesTcp - errors', () => {
      it('should have a showServicesTcp function', (done) => {
        try {
          assert.equal(true, typeof a.showServicesTcp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServicesTcp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServicesTcpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addServiceUdp - errors', () => {
      it('should have a addServiceUdp function', (done) => {
        try {
          assert.equal(true, typeof a.addServiceUdp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addServiceUdp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addServiceUdpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServiceUdp - errors', () => {
      it('should have a showServiceUdp function', (done) => {
        try {
          assert.equal(true, typeof a.showServiceUdp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServiceUdp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServiceUdpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setServiceUdp - errors', () => {
      it('should have a setServiceUdp function', (done) => {
        try {
          assert.equal(true, typeof a.setServiceUdp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setServiceUdp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setServiceUdpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteServiceUdp - errors', () => {
      it('should have a deleteServiceUdp function', (done) => {
        try {
          assert.equal(true, typeof a.deleteServiceUdp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteServiceUdp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteServiceUdpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServicesUdp - errors', () => {
      it('should have a showServicesUdp function', (done) => {
        try {
          assert.equal(true, typeof a.showServicesUdp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServicesUdp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServicesUdpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addServiceIcmp - errors', () => {
      it('should have a addServiceIcmp function', (done) => {
        try {
          assert.equal(true, typeof a.addServiceIcmp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addServiceIcmp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addServiceIcmpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServiceIcmp - errors', () => {
      it('should have a showServiceIcmp function', (done) => {
        try {
          assert.equal(true, typeof a.showServiceIcmp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServiceIcmp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServiceIcmpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setServiceIcmp - errors', () => {
      it('should have a setServiceIcmp function', (done) => {
        try {
          assert.equal(true, typeof a.setServiceIcmp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setServiceIcmp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setServiceIcmpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteServiceIcmp - errors', () => {
      it('should have a deleteServiceIcmp function', (done) => {
        try {
          assert.equal(true, typeof a.deleteServiceIcmp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteServiceIcmp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteServiceIcmpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServicesIcmp - errors', () => {
      it('should have a showServicesIcmp function', (done) => {
        try {
          assert.equal(true, typeof a.showServicesIcmp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServicesIcmp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServicesIcmpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addServiceIcmp6 - errors', () => {
      it('should have a addServiceIcmp6 function', (done) => {
        try {
          assert.equal(true, typeof a.addServiceIcmp6 === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addServiceIcmp6(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addServiceIcmp6WithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServiceIcmp6 - errors', () => {
      it('should have a showServiceIcmp6 function', (done) => {
        try {
          assert.equal(true, typeof a.showServiceIcmp6 === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServiceIcmp6(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServiceIcmp6WithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setServiceIcmp6 - errors', () => {
      it('should have a setServiceIcmp6 function', (done) => {
        try {
          assert.equal(true, typeof a.setServiceIcmp6 === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setServiceIcmp6(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setServiceIcmp6WithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteServiceIcmp6 - errors', () => {
      it('should have a deleteServiceIcmp6 function', (done) => {
        try {
          assert.equal(true, typeof a.deleteServiceIcmp6 === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteServiceIcmp6(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteServiceIcmp6WithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServicesIcmp6 - errors', () => {
      it('should have a showServicesIcmp6 function', (done) => {
        try {
          assert.equal(true, typeof a.showServicesIcmp6 === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServicesIcmp6(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServicesIcmp6WithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addServiceSctp - errors', () => {
      it('should have a addServiceSctp function', (done) => {
        try {
          assert.equal(true, typeof a.addServiceSctp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addServiceSctp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addServiceSctpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServiceSctp - errors', () => {
      it('should have a showServiceSctp function', (done) => {
        try {
          assert.equal(true, typeof a.showServiceSctp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServiceSctp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServiceSctpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setServiceSctp - errors', () => {
      it('should have a setServiceSctp function', (done) => {
        try {
          assert.equal(true, typeof a.setServiceSctp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setServiceSctp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setServiceSctpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteServiceSctp - errors', () => {
      it('should have a deleteServiceSctp function', (done) => {
        try {
          assert.equal(true, typeof a.deleteServiceSctp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteServiceSctp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteServiceSctpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServicesSctp - errors', () => {
      it('should have a showServicesSctp function', (done) => {
        try {
          assert.equal(true, typeof a.showServicesSctp === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServicesSctp(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServicesSctpWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addServiceOther - errors', () => {
      it('should have a addServiceOther function', (done) => {
        try {
          assert.equal(true, typeof a.addServiceOther === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addServiceOther(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addServiceOtherWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServiceOther - errors', () => {
      it('should have a showServiceOther function', (done) => {
        try {
          assert.equal(true, typeof a.showServiceOther === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServiceOther(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServiceOtherWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setServiceOther - errors', () => {
      it('should have a setServiceOther function', (done) => {
        try {
          assert.equal(true, typeof a.setServiceOther === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setServiceOther(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setServiceOtherWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteServiceOther - errors', () => {
      it('should have a deleteServiceOther function', (done) => {
        try {
          assert.equal(true, typeof a.deleteServiceOther === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteServiceOther(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteServiceOtherWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServicesOther - errors', () => {
      it('should have a showServicesOther function', (done) => {
        try {
          assert.equal(true, typeof a.showServicesOther === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServicesOther(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServicesOtherWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addServiceGroup - errors', () => {
      it('should have a addServiceGroup function', (done) => {
        try {
          assert.equal(true, typeof a.addServiceGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addServiceGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addServiceGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServiceGroup - errors', () => {
      it('should have a showServiceGroup function', (done) => {
        try {
          assert.equal(true, typeof a.showServiceGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServiceGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServiceGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setServiceGroup - errors', () => {
      it('should have a setServiceGroup function', (done) => {
        try {
          assert.equal(true, typeof a.setServiceGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setServiceGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setServiceGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteServiceGroup - errors', () => {
      it('should have a deleteServiceGroup function', (done) => {
        try {
          assert.equal(true, typeof a.deleteServiceGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteServiceGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteServiceGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServiceGroups - errors', () => {
      it('should have a showServiceGroups function', (done) => {
        try {
          assert.equal(true, typeof a.showServiceGroups === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServiceGroups(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServiceGroupsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addApplicationSite - errors', () => {
      it('should have a addApplicationSite function', (done) => {
        try {
          assert.equal(true, typeof a.addApplicationSite === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addApplicationSite(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addApplicationSiteWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showApplicationSite - errors', () => {
      it('should have a showApplicationSite function', (done) => {
        try {
          assert.equal(true, typeof a.showApplicationSite === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showApplicationSite(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showApplicationSiteWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setApplicationSite - errors', () => {
      it('should have a setApplicationSite function', (done) => {
        try {
          assert.equal(true, typeof a.setApplicationSite === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setApplicationSite(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setApplicationSiteWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteApplicationSite - errors', () => {
      it('should have a deleteApplicationSite function', (done) => {
        try {
          assert.equal(true, typeof a.deleteApplicationSite === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteApplicationSite(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteApplicationSiteWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showApplicationSites - errors', () => {
      it('should have a showApplicationSites function', (done) => {
        try {
          assert.equal(true, typeof a.showApplicationSites === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showApplicationSites(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showApplicationSitesWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addApplicationSiteCategory - errors', () => {
      it('should have a addApplicationSiteCategory function', (done) => {
        try {
          assert.equal(true, typeof a.addApplicationSiteCategory === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addApplicationSiteCategory(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addApplicationSiteCategoryWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showApplicationSiteCategory - errors', () => {
      it('should have a showApplicationSiteCategory function', (done) => {
        try {
          assert.equal(true, typeof a.showApplicationSiteCategory === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showApplicationSiteCategory(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showApplicationSiteCategoryWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setApplicationSiteCategory - errors', () => {
      it('should have a setApplicationSiteCategory function', (done) => {
        try {
          assert.equal(true, typeof a.setApplicationSiteCategory === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setApplicationSiteCategory(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setApplicationSiteCategoryWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteApplicationSiteCategory - errors', () => {
      it('should have a deleteApplicationSiteCategory function', (done) => {
        try {
          assert.equal(true, typeof a.deleteApplicationSiteCategory === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteApplicationSiteCategory(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteApplicationSiteCategoryWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showApplicationSiteCategories - errors', () => {
      it('should have a showApplicationSiteCategories function', (done) => {
        try {
          assert.equal(true, typeof a.showApplicationSiteCategories === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showApplicationSiteCategories(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showApplicationSiteCategoriesWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addApplicationSiteGroup - errors', () => {
      it('should have a addApplicationSiteGroup function', (done) => {
        try {
          assert.equal(true, typeof a.addApplicationSiteGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addApplicationSiteGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addApplicationSiteGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showApplicationSiteGroup - errors', () => {
      it('should have a showApplicationSiteGroup function', (done) => {
        try {
          assert.equal(true, typeof a.showApplicationSiteGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showApplicationSiteGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showApplicationSiteGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setApplicationSiteGroup - errors', () => {
      it('should have a setApplicationSiteGroup function', (done) => {
        try {
          assert.equal(true, typeof a.setApplicationSiteGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setApplicationSiteGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setApplicationSiteGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteApplicationSiteGroup - errors', () => {
      it('should have a deleteApplicationSiteGroup function', (done) => {
        try {
          assert.equal(true, typeof a.deleteApplicationSiteGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteApplicationSiteGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteApplicationSiteGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showApplicationSiteGroups - errors', () => {
      it('should have a showApplicationSiteGroups function', (done) => {
        try {
          assert.equal(true, typeof a.showApplicationSiteGroups === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showApplicationSiteGroups(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showApplicationSiteGroupsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addServiceDceRpc - errors', () => {
      it('should have a addServiceDceRpc function', (done) => {
        try {
          assert.equal(true, typeof a.addServiceDceRpc === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addServiceDceRpc(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addServiceDceRpcWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServiceDceRpc - errors', () => {
      it('should have a showServiceDceRpc function', (done) => {
        try {
          assert.equal(true, typeof a.showServiceDceRpc === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServiceDceRpc(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServiceDceRpcWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setServiceDceRpc - errors', () => {
      it('should have a setServiceDceRpc function', (done) => {
        try {
          assert.equal(true, typeof a.setServiceDceRpc === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setServiceDceRpc(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setServiceDceRpcWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteServiceDceRpc - errors', () => {
      it('should have a deleteServiceDceRpc function', (done) => {
        try {
          assert.equal(true, typeof a.deleteServiceDceRpc === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteServiceDceRpc(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteServiceDceRpcWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServicesDceRpc - errors', () => {
      it('should have a showServicesDceRpc function', (done) => {
        try {
          assert.equal(true, typeof a.showServicesDceRpc === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServicesDceRpc(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServicesDceRpcWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addServiceRpc - errors', () => {
      it('should have a addServiceRpc function', (done) => {
        try {
          assert.equal(true, typeof a.addServiceRpc === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addServiceRpc(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addServiceRpcWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServiceRpc - errors', () => {
      it('should have a showServiceRpc function', (done) => {
        try {
          assert.equal(true, typeof a.showServiceRpc === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServiceRpc(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServiceRpcWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setServiceRpc - errors', () => {
      it('should have a setServiceRpc function', (done) => {
        try {
          assert.equal(true, typeof a.setServiceRpc === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setServiceRpc(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setServiceRpcWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteServiceRpc - errors', () => {
      it('should have a deleteServiceRpc function', (done) => {
        try {
          assert.equal(true, typeof a.deleteServiceRpc === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteServiceRpc(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteServiceRpcWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showServicesRpc - errors', () => {
      it('should have a showServicesRpc function', (done) => {
        try {
          assert.equal(true, typeof a.showServicesRpc === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showServicesRpc(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showServicesRpcWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addAccessRule - errors', () => {
      it('should have a addAccessRule function', (done) => {
        try {
          assert.equal(true, typeof a.addAccessRule === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addAccessRule(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addAccessRuleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showAccessRulebase - errors', () => {
      it('should have a showAccessRulebase function', (done) => {
        try {
          assert.equal(true, typeof a.showAccessRulebase === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showAccessRulebase(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showAccessRulebaseWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showAccessRule - errors', () => {
      it('should have a showAccessRule function', (done) => {
        try {
          assert.equal(true, typeof a.showAccessRule === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showAccessRule(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showAccessRuleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setAccessRule - errors', () => {
      it('should have a setAccessRule function', (done) => {
        try {
          assert.equal(true, typeof a.setAccessRule === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setAccessRule(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setAccessRuleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteAccessRule - errors', () => {
      it('should have a deleteAccessRule function', (done) => {
        try {
          assert.equal(true, typeof a.deleteAccessRule === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteAccessRule(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteAccessRuleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addAccessSection - errors', () => {
      it('should have a addAccessSection function', (done) => {
        try {
          assert.equal(true, typeof a.addAccessSection === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addAccessSection(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addAccessSectionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showAccessSection - errors', () => {
      it('should have a showAccessSection function', (done) => {
        try {
          assert.equal(true, typeof a.showAccessSection === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showAccessSection(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showAccessSectionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setAccessSection - errors', () => {
      it('should have a setAccessSection function', (done) => {
        try {
          assert.equal(true, typeof a.setAccessSection === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setAccessSection(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setAccessSectionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteAccessSection - errors', () => {
      it('should have a deleteAccessSection function', (done) => {
        try {
          assert.equal(true, typeof a.deleteAccessSection === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteAccessSection(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteAccessSectionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addAccessLayer - errors', () => {
      it('should have a addAccessLayer function', (done) => {
        try {
          assert.equal(true, typeof a.addAccessLayer === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addAccessLayer(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addAccessLayerWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showAccessLayer - errors', () => {
      it('should have a showAccessLayer function', (done) => {
        try {
          assert.equal(true, typeof a.showAccessLayer === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showAccessLayer(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showAccessLayerWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setAccessLayer - errors', () => {
      it('should have a setAccessLayer function', (done) => {
        try {
          assert.equal(true, typeof a.setAccessLayer === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setAccessLayer(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setAccessLayerWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteAccessLayer - errors', () => {
      it('should have a deleteAccessLayer function', (done) => {
        try {
          assert.equal(true, typeof a.deleteAccessLayer === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteAccessLayer(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteAccessLayerWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showAccessLayers - errors', () => {
      it('should have a showAccessLayers function', (done) => {
        try {
          assert.equal(true, typeof a.showAccessLayers === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showAccessLayers(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showAccessLayersWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addNatRule - errors', () => {
      it('should have a addNatRule function', (done) => {
        try {
          assert.equal(true, typeof a.addNatRule === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addNatRule(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addNatRuleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showNatRulebase - errors', () => {
      it('should have a showNatRulebase function', (done) => {
        try {
          assert.equal(true, typeof a.showNatRulebase === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showNatRulebase(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showNatRulebaseWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showNatRule - errors', () => {
      it('should have a showNatRule function', (done) => {
        try {
          assert.equal(true, typeof a.showNatRule === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showNatRule(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showNatRuleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setNatRule - errors', () => {
      it('should have a setNatRule function', (done) => {
        try {
          assert.equal(true, typeof a.setNatRule === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setNatRule(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setNatRuleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteNatRule - errors', () => {
      it('should have a deleteNatRule function', (done) => {
        try {
          assert.equal(true, typeof a.deleteNatRule === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteNatRule(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteNatRuleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addNatSection - errors', () => {
      it('should have a addNatSection function', (done) => {
        try {
          assert.equal(true, typeof a.addNatSection === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addNatSection(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addNatSectionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showNatSection - errors', () => {
      it('should have a showNatSection function', (done) => {
        try {
          assert.equal(true, typeof a.showNatSection === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showNatSection(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showNatSectionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setNatSection - errors', () => {
      it('should have a setNatSection function', (done) => {
        try {
          assert.equal(true, typeof a.setNatSection === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setNatSection(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setNatSectionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteNatSection - errors', () => {
      it('should have a deleteNatSection function', (done) => {
        try {
          assert.equal(true, typeof a.deleteNatSection === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteNatSection(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteNatSectionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addVpnCommunityMeshed - errors', () => {
      it('should have a addVpnCommunityMeshed function', (done) => {
        try {
          assert.equal(true, typeof a.addVpnCommunityMeshed === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addVpnCommunityMeshed(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addVpnCommunityMeshedWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showVpnCommunityMeshed - errors', () => {
      it('should have a showVpnCommunityMeshed function', (done) => {
        try {
          assert.equal(true, typeof a.showVpnCommunityMeshed === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showVpnCommunityMeshed(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showVpnCommunityMeshedWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setVpnCommunityMeshed - errors', () => {
      it('should have a setVpnCommunityMeshed function', (done) => {
        try {
          assert.equal(true, typeof a.setVpnCommunityMeshed === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setVpnCommunityMeshed(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setVpnCommunityMeshedWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteVpnCommunityMeshed - errors', () => {
      it('should have a deleteVpnCommunityMeshed function', (done) => {
        try {
          assert.equal(true, typeof a.deleteVpnCommunityMeshed === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteVpnCommunityMeshed(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteVpnCommunityMeshedWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showVpnCommunitiesMeshed - errors', () => {
      it('should have a showVpnCommunitiesMeshed function', (done) => {
        try {
          assert.equal(true, typeof a.showVpnCommunitiesMeshed === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showVpnCommunitiesMeshed(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showVpnCommunitiesMeshedWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addVpnCommunityStar - errors', () => {
      it('should have a addVpnCommunityStar function', (done) => {
        try {
          assert.equal(true, typeof a.addVpnCommunityStar === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addVpnCommunityStar(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addVpnCommunityStarWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showVpnCommunityStar - errors', () => {
      it('should have a showVpnCommunityStar function', (done) => {
        try {
          assert.equal(true, typeof a.showVpnCommunityStar === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showVpnCommunityStar(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showVpnCommunityStarWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setVpnCommunityStar - errors', () => {
      it('should have a setVpnCommunityStar function', (done) => {
        try {
          assert.equal(true, typeof a.setVpnCommunityStar === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setVpnCommunityStar(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setVpnCommunityStarWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteVpnCommunityStar - errors', () => {
      it('should have a deleteVpnCommunityStar function', (done) => {
        try {
          assert.equal(true, typeof a.deleteVpnCommunityStar === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteVpnCommunityStar(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteVpnCommunityStarWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showVpnCommunitiesStar - errors', () => {
      it('should have a showVpnCommunitiesStar function', (done) => {
        try {
          assert.equal(true, typeof a.showVpnCommunitiesStar === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showVpnCommunitiesStar(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showVpnCommunitiesStarWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addThreatRule - errors', () => {
      it('should have a addThreatRule function', (done) => {
        try {
          assert.equal(true, typeof a.addThreatRule === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addThreatRule(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addThreatRuleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showThreatRulebase - errors', () => {
      it('should have a showThreatRulebase function', (done) => {
        try {
          assert.equal(true, typeof a.showThreatRulebase === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showThreatRulebase(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showThreatRulebaseWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showThreatRule - errors', () => {
      it('should have a showThreatRule function', (done) => {
        try {
          assert.equal(true, typeof a.showThreatRule === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showThreatRule(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showThreatRuleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setThreatRule - errors', () => {
      it('should have a setThreatRule function', (done) => {
        try {
          assert.equal(true, typeof a.setThreatRule === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setThreatRule(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setThreatRuleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteThreatRule - errors', () => {
      it('should have a deleteThreatRule function', (done) => {
        try {
          assert.equal(true, typeof a.deleteThreatRule === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteThreatRule(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteThreatRuleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addThreatException - errors', () => {
      it('should have a addThreatException function', (done) => {
        try {
          assert.equal(true, typeof a.addThreatException === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addThreatException(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addThreatExceptionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showThreatRuleExceptionRulebase - errors', () => {
      it('should have a showThreatRuleExceptionRulebase function', (done) => {
        try {
          assert.equal(true, typeof a.showThreatRuleExceptionRulebase === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showThreatRuleExceptionRulebase(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showThreatRuleExceptionRulebaseWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showThreatException - errors', () => {
      it('should have a showThreatException function', (done) => {
        try {
          assert.equal(true, typeof a.showThreatException === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showThreatException(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showThreatExceptionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setThreatException - errors', () => {
      it('should have a setThreatException function', (done) => {
        try {
          assert.equal(true, typeof a.setThreatException === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setThreatException(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setThreatExceptionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteThreatException - errors', () => {
      it('should have a deleteThreatException function', (done) => {
        try {
          assert.equal(true, typeof a.deleteThreatException === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteThreatException(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteThreatExceptionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addExceptionGroup - errors', () => {
      it('should have a addExceptionGroup function', (done) => {
        try {
          assert.equal(true, typeof a.addExceptionGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addExceptionGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addExceptionGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showExceptionGroup - errors', () => {
      it('should have a showExceptionGroup function', (done) => {
        try {
          assert.equal(true, typeof a.showExceptionGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showExceptionGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showExceptionGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setExceptionGroup - errors', () => {
      it('should have a setExceptionGroup function', (done) => {
        try {
          assert.equal(true, typeof a.setExceptionGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setExceptionGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setExceptionGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteExceptionGroup - errors', () => {
      it('should have a deleteExceptionGroup function', (done) => {
        try {
          assert.equal(true, typeof a.deleteExceptionGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteExceptionGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteExceptionGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showExceptionGroups - errors', () => {
      it('should have a showExceptionGroups function', (done) => {
        try {
          assert.equal(true, typeof a.showExceptionGroups === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showExceptionGroups(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showExceptionGroupsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showThreatProtection - errors', () => {
      it('should have a showThreatProtection function', (done) => {
        try {
          assert.equal(true, typeof a.showThreatProtection === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showThreatProtection(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showThreatProtectionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setThreatProtection - errors', () => {
      it('should have a setThreatProtection function', (done) => {
        try {
          assert.equal(true, typeof a.setThreatProtection === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setThreatProtection(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setThreatProtectionWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showThreatProtections - errors', () => {
      it('should have a showThreatProtections function', (done) => {
        try {
          assert.equal(true, typeof a.showThreatProtections === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showThreatProtections(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showThreatProtectionsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addThreatProtections - errors', () => {
      it('should have a addThreatProtections function', (done) => {
        try {
          assert.equal(true, typeof a.addThreatProtections === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addThreatProtections(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addThreatProtectionsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteThreatProtections - errors', () => {
      it('should have a deleteThreatProtections function', (done) => {
        try {
          assert.equal(true, typeof a.deleteThreatProtections === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteThreatProtections(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteThreatProtectionsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addThreatProfile - errors', () => {
      it('should have a addThreatProfile function', (done) => {
        try {
          assert.equal(true, typeof a.addThreatProfile === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addThreatProfile(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addThreatProfileWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showThreatProfile - errors', () => {
      it('should have a showThreatProfile function', (done) => {
        try {
          assert.equal(true, typeof a.showThreatProfile === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showThreatProfile(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showThreatProfileWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setThreatProfile - errors', () => {
      it('should have a setThreatProfile function', (done) => {
        try {
          assert.equal(true, typeof a.setThreatProfile === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setThreatProfile(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setThreatProfileWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteThreatProfile - errors', () => {
      it('should have a deleteThreatProfile function', (done) => {
        try {
          assert.equal(true, typeof a.deleteThreatProfile === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteThreatProfile(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteThreatProfileWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showThreatProfiles - errors', () => {
      it('should have a showThreatProfiles function', (done) => {
        try {
          assert.equal(true, typeof a.showThreatProfiles === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showThreatProfiles(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showThreatProfilesWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addThreatIndicator - errors', () => {
      it('should have a addThreatIndicator function', (done) => {
        try {
          assert.equal(true, typeof a.addThreatIndicator === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addThreatIndicator(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addThreatIndicatorWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showThreatIndicator - errors', () => {
      it('should have a showThreatIndicator function', (done) => {
        try {
          assert.equal(true, typeof a.showThreatIndicator === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showThreatIndicator(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showThreatIndicatorWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setThreatIndicator - errors', () => {
      it('should have a setThreatIndicator function', (done) => {
        try {
          assert.equal(true, typeof a.setThreatIndicator === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setThreatIndicator(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setThreatIndicatorWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteThreatIndicator - errors', () => {
      it('should have a deleteThreatIndicator function', (done) => {
        try {
          assert.equal(true, typeof a.deleteThreatIndicator === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteThreatIndicator(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteThreatIndicatorWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showThreatIndicators - errors', () => {
      it('should have a showThreatIndicators function', (done) => {
        try {
          assert.equal(true, typeof a.showThreatIndicators === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showThreatIndicators(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showThreatIndicatorsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addThreatLayer - errors', () => {
      it('should have a addThreatLayer function', (done) => {
        try {
          assert.equal(true, typeof a.addThreatLayer === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addThreatLayer(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addThreatLayerWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showThreatLayer - errors', () => {
      it('should have a showThreatLayer function', (done) => {
        try {
          assert.equal(true, typeof a.showThreatLayer === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showThreatLayer(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showThreatLayerWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setThreatLayer - errors', () => {
      it('should have a setThreatLayer function', (done) => {
        try {
          assert.equal(true, typeof a.setThreatLayer === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setThreatLayer(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setThreatLayerWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteThreatLayer - errors', () => {
      it('should have a deleteThreatLayer function', (done) => {
        try {
          assert.equal(true, typeof a.deleteThreatLayer === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteThreatLayer(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteThreatLayerWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showThreatLayers - errors', () => {
      it('should have a showThreatLayers function', (done) => {
        try {
          assert.equal(true, typeof a.showThreatLayers === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showThreatLayers(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showThreatLayersWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showIpsUpdateSchedule - errors', () => {
      it('should have a showIpsUpdateSchedule function', (done) => {
        try {
          assert.equal(true, typeof a.showIpsUpdateSchedule === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showIpsUpdateSchedule(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showIpsUpdateScheduleWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setIpsUpdateScheduleInterval - errors', () => {
      it('should have a setIpsUpdateScheduleInterval function', (done) => {
        try {
          assert.equal(true, typeof a.setIpsUpdateScheduleInterval === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setIpsUpdateScheduleInterval(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setIpsUpdateScheduleIntervalWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#runIpsUpdate - errors', () => {
      it('should have a runIpsUpdate function', (done) => {
        try {
          assert.equal(true, typeof a.runIpsUpdate === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.runIpsUpdate(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-runIpsUpdateWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showIpsStatus - errors', () => {
      it('should have a showIpsStatus function', (done) => {
        try {
          assert.equal(true, typeof a.showIpsStatus === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showIpsStatus(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showIpsStatusWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showIpsProtectionExtendedAttribute - errors', () => {
      it('should have a showIpsProtectionExtendedAttribute function', (done) => {
        try {
          assert.equal(true, typeof a.showIpsProtectionExtendedAttribute === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showIpsProtectionExtendedAttribute(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showIpsProtectionExtendedAttributeWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showIpsProtectionExtendedAttributes - errors', () => {
      it('should have a showIpsProtectionExtendedAttributes function', (done) => {
        try {
          assert.equal(true, typeof a.showIpsProtectionExtendedAttributes === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showIpsProtectionExtendedAttributes(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showIpsProtectionExtendedAttributesWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#runThreatEmulationFileTypesOfflineUpdate - errors', () => {
      it('should have a runThreatEmulationFileTypesOfflineUpdate function', (done) => {
        try {
          assert.equal(true, typeof a.runThreatEmulationFileTypesOfflineUpdate === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.runThreatEmulationFileTypesOfflineUpdate(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-runThreatEmulationFileTypesOfflineUpdateWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#verifyPolicy - errors', () => {
      it('should have a verifyPolicy function', (done) => {
        try {
          assert.equal(true, typeof a.verifyPolicy === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.verifyPolicy(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-verifyPolicyWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#installPolicy - errors', () => {
      it('should have a installPolicy function', (done) => {
        try {
          assert.equal(true, typeof a.installPolicy === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.installPolicy(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-installPolicyWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addPackage - errors', () => {
      it('should have a addPackage function', (done) => {
        try {
          assert.equal(true, typeof a.addPackage === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addPackage(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addPackageWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showPackage - errors', () => {
      it('should have a showPackage function', (done) => {
        try {
          assert.equal(true, typeof a.showPackage === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showPackage(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showPackageWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setPackage - errors', () => {
      it('should have a setPackage function', (done) => {
        try {
          assert.equal(true, typeof a.setPackage === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setPackage(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setPackageWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deletePackage - errors', () => {
      it('should have a deletePackage function', (done) => {
        try {
          assert.equal(true, typeof a.deletePackage === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deletePackage(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deletePackageWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showPackages - errors', () => {
      it('should have a showPackages function', (done) => {
        try {
          assert.equal(true, typeof a.showPackages === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showPackages(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showPackagesWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addDomain - errors', () => {
      it('should have a addDomain function', (done) => {
        try {
          assert.equal(true, typeof a.addDomain === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addDomain(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addDomainWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showDomain - errors', () => {
      it('should have a showDomain function', (done) => {
        try {
          assert.equal(true, typeof a.showDomain === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showDomain(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showDomainWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setDomain - errors', () => {
      it('should have a setDomain function', (done) => {
        try {
          assert.equal(true, typeof a.setDomain === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setDomain(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setDomainWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteDomain - errors', () => {
      it('should have a deleteDomain function', (done) => {
        try {
          assert.equal(true, typeof a.deleteDomain === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteDomain(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteDomainWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showDomains - errors', () => {
      it('should have a showDomains function', (done) => {
        try {
          assert.equal(true, typeof a.showDomains === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showDomains(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showDomainsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showGlobalDomain - errors', () => {
      it('should have a showGlobalDomain function', (done) => {
        try {
          assert.equal(true, typeof a.showGlobalDomain === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showGlobalDomain(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showGlobalDomainWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setGlobalDomain - errors', () => {
      it('should have a setGlobalDomain function', (done) => {
        try {
          assert.equal(true, typeof a.setGlobalDomain === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setGlobalDomain(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setGlobalDomainWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showMds - errors', () => {
      it('should have a showMds function', (done) => {
        try {
          assert.equal(true, typeof a.showMds === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showMds(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showMdsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showMdss - errors', () => {
      it('should have a showMdss function', (done) => {
        try {
          assert.equal(true, typeof a.showMdss === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showMdss(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showMdssWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showPlaceHolder - errors', () => {
      it('should have a showPlaceHolder function', (done) => {
        try {
          assert.equal(true, typeof a.showPlaceHolder === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showPlaceHolder(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showPlaceHolderWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addGlobalAssignment - errors', () => {
      it('should have a addGlobalAssignment function', (done) => {
        try {
          assert.equal(true, typeof a.addGlobalAssignment === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addGlobalAssignment(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addGlobalAssignmentWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showGlobalAssignment - errors', () => {
      it('should have a showGlobalAssignment function', (done) => {
        try {
          assert.equal(true, typeof a.showGlobalAssignment === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showGlobalAssignment(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showGlobalAssignmentWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setGlobalAssignment - errors', () => {
      it('should have a setGlobalAssignment function', (done) => {
        try {
          assert.equal(true, typeof a.setGlobalAssignment === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setGlobalAssignment(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setGlobalAssignmentWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteGlobalAssignment - errors', () => {
      it('should have a deleteGlobalAssignment function', (done) => {
        try {
          assert.equal(true, typeof a.deleteGlobalAssignment === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteGlobalAssignment(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteGlobalAssignmentWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showGlobalAssignments - errors', () => {
      it('should have a showGlobalAssignments function', (done) => {
        try {
          assert.equal(true, typeof a.showGlobalAssignments === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showGlobalAssignments(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showGlobalAssignmentsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#assignGlobalAssignment - errors', () => {
      it('should have a assignGlobalAssignment function', (done) => {
        try {
          assert.equal(true, typeof a.assignGlobalAssignment === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.assignGlobalAssignment(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-assignGlobalAssignmentWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#whereUsed - errors', () => {
      it('should have a whereUsed function', (done) => {
        try {
          assert.equal(true, typeof a.whereUsed === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.whereUsed(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-whereUsedWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showTask - errors', () => {
      it('should have a showTask function', (done) => {
        try {
          assert.equal(true, typeof a.showTask === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showTask(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showTaskWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#runScript - errors', () => {
      it('should have a runScript function', (done) => {
        try {
          assert.equal(true, typeof a.runScript === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.runScript(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-runScriptWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showUnusedObjects - errors', () => {
      it('should have a showUnusedObjects function', (done) => {
        try {
          assert.equal(true, typeof a.showUnusedObjects === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showUnusedObjects(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showUnusedObjectsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#export - errors', () => {
      it('should have a export function', (done) => {
        try {
          assert.equal(true, typeof a.export === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.export(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-exportWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showChangesBetweenTheDates - errors', () => {
      it('should have a showChangesBetweenTheDates function', (done) => {
        try {
          assert.equal(true, typeof a.showChangesBetweenTheDates === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showChangesBetweenTheDates(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showChangesBetweenTheDatesWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showGatewaysAndServers - errors', () => {
      it('should have a showGatewaysAndServers function', (done) => {
        try {
          assert.equal(true, typeof a.showGatewaysAndServers === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showGatewaysAndServers(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showGatewaysAndServersWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showObjectsOfTypeGroup - errors', () => {
      it('should have a showObjectsOfTypeGroup function', (done) => {
        try {
          assert.equal(true, typeof a.showObjectsOfTypeGroup === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showObjectsOfTypeGroup(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showObjectsOfTypeGroupWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showValidations - errors', () => {
      it('should have a showValidations function', (done) => {
        try {
          assert.equal(true, typeof a.showValidations === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showValidations(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showValidationsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showTasks - errors', () => {
      it('should have a showTasks function', (done) => {
        try {
          assert.equal(true, typeof a.showTasks === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showTasks(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showTasksWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showApiVersions - errors', () => {
      it('should have a showApiVersions function', (done) => {
        try {
          assert.equal(true, typeof a.showApiVersions === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showApiVersions(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showApiVersionsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showObject - errors', () => {
      it('should have a showObject function', (done) => {
        try {
          assert.equal(true, typeof a.showObject === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showObject(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showObjectWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showCommands - errors', () => {
      it('should have a showCommands function', (done) => {
        try {
          assert.equal(true, typeof a.showCommands === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showCommands(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showCommandsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#putFile - errors', () => {
      it('should have a putFile function', (done) => {
        try {
          assert.equal(true, typeof a.putFile === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.putFile(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-putFileWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#addAdministrator - errors', () => {
      it('should have a addAdministrator function', (done) => {
        try {
          assert.equal(true, typeof a.addAdministrator === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.addAdministrator(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-addAdministratorWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showAdministrator - errors', () => {
      it('should have a showAdministrator function', (done) => {
        try {
          assert.equal(true, typeof a.showAdministrator === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showAdministrator(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showAdministratorWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setAdministrator - errors', () => {
      it('should have a setAdministrator function', (done) => {
        try {
          assert.equal(true, typeof a.setAdministrator === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setAdministrator(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setAdministratorWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#deleteAdministrator - errors', () => {
      it('should have a deleteAdministrator function', (done) => {
        try {
          assert.equal(true, typeof a.deleteAdministrator === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.deleteAdministrator(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-deleteAdministratorWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showAdministrators - errors', () => {
      it('should have a showAdministrators function', (done) => {
        try {
          assert.equal(true, typeof a.showAdministrators === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showAdministrators(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showAdministratorsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#unlockAdministrator - errors', () => {
      it('should have a unlockAdministrator function', (done) => {
        try {
          assert.equal(true, typeof a.unlockAdministrator === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.unlockAdministrator(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-unlockAdministratorWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#showApiSettings - errors', () => {
      it('should have a showApiSettings function', (done) => {
        try {
          assert.equal(true, typeof a.showApiSettings === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.showApiSettings(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-showApiSettingsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#setApiSettings - errors', () => {
      it('should have a setApiSettings function', (done) => {
        try {
          assert.equal(true, typeof a.setApiSettings === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        try {
          a.setApiSettings(null, (data, error) => {
            try {
              const displayE = 'body is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-checkpoint_management-adapter-setApiSettingsWithSid', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });
  });
});
