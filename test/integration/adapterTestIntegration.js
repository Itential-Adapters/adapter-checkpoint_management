/* @copyright Itential, LLC 2019 (pre-modifications) */

// Set globals
/* global describe it log pronghornProps */
/* eslint no-unused-vars: warn */

// include required items for testing & logging
const assert = require('assert');
const fs = require('fs');
const mocha = require('mocha');
const path = require('path');
const winston = require('winston');
const { expect } = require('chai');
const { use } = require('chai');
const td = require('testdouble');

const anything = td.matchers.anything();

// stub and attemptTimeout are used throughout the code so set them here
let logLevel = 'none';
const stub = true;
const isRapidFail = false;
const isSaveMockData = false;
const attemptTimeout = 30000;

// these variables can be changed to run in integrated mode so easier to set them here
// always check these in with bogus data!!!
const host = 'replace.hostorip.here';
const username = 'username';
const password = 'password';
const protocol = 'http';
const port = 80;
const sslenable = false;
const sslinvalid = false;

// these are the adapter properties. You generally should not need to alter
// any of these after they are initially set up
global.pronghornProps = {
  pathProps: {
    encrypted: false
  },
  adapterProps: {
    adapters: [{
      id: 'Test-checkpoint_Management',
      type: 'CheckpointManagement',
      properties: {
        host,
        port,
        base_path: '/api',
        version: 'v1.0',
        cache_location: 'none',
        save_metric: false,
        stub,
        protocol,
        authentication: {
          auth_method: 'basic user_password',
          username,
          password,
          token: '',
          invalid_token_error: 401,
          token_timeout: -1,
          token_cache: 'local',
          auth_field: 'header.headers.Authorization',
          auth_field_format: 'Basic {b64}{username}:{password}{/b64}'
        },
        healthcheck: {
          type: 'startup',
          frequency: 60000
        },
        throttle: {
          throttle_enabled: false,
          number_pronghorns: 1,
          sync_async: 'sync',
          max_in_queue: 1000,
          concurrent_max: 1,
          expire_timeout: 0,
          avg_runtime: 200
        },
        request: {
          number_redirects: 0,
          number_retries: 3,
          limit_retry_error: 0,
          failover_codes: [],
          attempt_timeout: attemptTimeout,
          global_request: {
            payload: {},
            uriOptions: {},
            addlHeaders: {},
            authData: {}
          },
          healthcheck_on_timeout: false,
          return_raw: true,
          archiving: false
        },
        proxy: {
          enabled: false,
          host: '',
          port: 1,
          protocol: 'http'
        },
        ssl: {
          ecdhCurve: '',
          enabled: sslenable,
          accept_invalid_cert: sslinvalid,
          ca_file: '',
          secure_protocol: '',
          ciphers: ''
        },
        mongo: {
          host: '',
          port: 0,
          database: '',
          username,
          password: ''
        }
      }
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
global.log = new (winston.Logger)({
  level: logLevel,
  levels: myCustomLevels.levels,
  transports: [
    new winston.transports.Console()
  ]
});

/**
 * Runs the common asserts for test
 */
function runCommonAsserts(data, error) {
  assert.equal(undefined, error);
  assert.notEqual(undefined, data);
  assert.notEqual(null, data);
  assert.notEqual(undefined, data.response);
  assert.notEqual(null, data.response);
}

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

/**
 * @function saveMockData
 * Attempts to take data from responses and place them in MockDataFiles to help create Mockdata.
 * Note, this was built based on entity file structure for Adapter-Engine 1.6.x
 * @param {string} entityName - Name of the entity saving mock data for
 * @param {string} actionName -  Name of the action saving mock data for
 * @param {string} descriptor -  Something to describe this test (used as a type)
 * @param {string or object} responseData - The data to put in the mock file.
 */
function saveMockData(entityName, actionName, descriptor, responseData) {
  // do not need to save mockdata if we are running in stub mode (already has mock data) or if told not to save
  if (stub || !isSaveMockData) {
    return false;
  }

  // must have a response in order to store the response
  if (responseData && responseData.response) {
    let data = responseData.response;

    // if there was a raw response that one is better as it is untranslated
    if (responseData.raw) {
      data = responseData.raw;

      try {
        const temp = JSON.parse(data);
        data = temp;
      } catch (pex) {
        // do not care if it did not parse as we will just use data
      }
    }

    try {
      const base = path.join(__dirname, `../../entities/${entityName}/`);
      const mockdatafolder = 'mockdatafiles';
      const filename = `mockdatafiles/${actionName}-${descriptor}.json`;

      if (!fs.existsSync(base + mockdatafolder)) {
        fs.mkdirSync(base + mockdatafolder);
      }

      // write the data we retrieved
      fs.writeFile(base + filename, JSON.stringify(data, null, 2), 'utf8', (errWritingMock) => {
        if (errWritingMock) throw errWritingMock;

        // update the action file to reflect the changes. Note: We're replacing the default object for now!
        fs.readFile(`${base}action.json`, (errRead, content) => {
          if (errRead) throw errRead;

          // parse the action file into JSON
          const parsedJson = JSON.parse(content);

          // The object update we'll write in.
          const responseObj = {
            type: descriptor,
            key: '',
            mockFile: filename
          };

          // get the object for method we're trying to change.
          const currentMethodAction = parsedJson.actions.find(obj => obj.name === actionName);

          // if the method was not found - should never happen but...
          if (!currentMethodAction) {
            throw Error('Can\'t find an action for this method in the provided entity.');
          }

          // if there is a response object, we want to replace the Response object. Otherwise we'll create one.
          const actionResponseObj = currentMethodAction.responseObjects.find(obj => obj.type === descriptor);

          // Add the action responseObj back into the array of response objects.
          if (!actionResponseObj) {
            // if there is a default response object, we want to get the key.
            const defaultResponseObj = currentMethodAction.responseObjects.find(obj => obj.type === 'default');

            // save the default key into the new response object
            if (defaultResponseObj) {
              responseObj.key = defaultResponseObj.key;
            }

            // save the new response object
            currentMethodAction.responseObjects = [responseObj];
          } else {
            // update the location of the mock data file
            actionResponseObj.mockFile = responseObj.mockFile;
          }

          // Save results
          fs.writeFile(`${base}action.json`, JSON.stringify(parsedJson, null, 2), (err) => {
            if (err) throw err;
          });
        });
      });
    } catch (e) {
      log.debug(`Failed to save mock data for ${actionName}. ${e.message}`);
      return false;
    }
  }

  // no response to save
  log.debug(`No data passed to save into mockdata for ${actionName}`);
  return false;
}


// require the adapter that we are going to be using
const CheckpointManagement = require('../../adapter.js');

// begin the testing - these should be pretty well defined between the describe and the it!
describe('[integration] Checkpoint_Management Adapter Test', () => {
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

    describe('#connect', () => {
      it('should get connected - no healthcheck', (done) => {
        try {
          a.healthcheckType = 'none';
          a.connect();

          try {
            assert.equal(true, a.alive);
            done();
          } catch (error) {
            log.error(`Test Failure: ${error}`);
            done(error);
          }
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      });
      it('should get connected - startup healthcheck', (done) => {
        try {
          a.healthcheckType = 'startup';
          a.connect();

          try {
            assert.equal(true, a.alive);
            done();
          } catch (error) {
            log.error(`Test Failure: ${error}`);
            done(error);
          }
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      });
    });

    describe('#healthCheck', () => {
      it('should be healthy', (done) => {
        try {
          a.healthCheck(null, (data) => {
            try {
              assert.equal(true, a.healthy);
              saveMockData('system', 'healthcheck', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    /*
    -----------------------------------------------------------------------
    -----------------------------------------------------------------------
    *** All code above this comment will be replaced during a migration ***
    ******************* DO NOT REMOVE THIS COMMENT BLOCK ******************
    -----------------------------------------------------------------------
    -----------------------------------------------------------------------
    */

    const sessionManagementDiscardBodyParam = {};
    describe('#discard - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.discard(sessionManagementDiscardBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
                assert.equal(0, data.response['number-of-discarded-changes']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('SessionManagement', 'discard', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const sessionManagementDisconnectBodyParam = {
      uid: 'string'
    };
    describe('#disconnect - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.disconnect(sessionManagementDisconnectBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('SessionManagement', 'disconnect', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const sessionManagementKeepaliveBodyParam = {};
    describe('#keepalive - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.keepalive(sessionManagementKeepaliveBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('SessionManagement', 'keepalive', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const sessionManagementLoginBodyParam = {
      user: 'string',
      password: 'string'
    };
    describe('#login - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.login(sessionManagementLoginBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('97BVpRfN4j81ogN-V2XqGYmw3DDwIhoSn0og8PiKDiM', data.response.sid);
                assert.equal('https://192.0.2.1:443/web_api', data.response.url);
                assert.equal('7a13a360-9b24-40d7-acd3-5b50247be33e', data.response.uid);
                assert.equal(600, data.response['session-timeout']);
                assert.equal('object', typeof data.response['last-login-was-at']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('SessionManagement', 'login', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const sessionManagementLogoutBodyParam = {};
    describe('#logout - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.logout(sessionManagementLogoutBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('SessionManagement', 'logout', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const sessionManagementPublishBodyParam = {};
    describe('#publish - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.publish(sessionManagementPublishBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('01234567-89ab-cdef-a930-8c37a59972b3', data.response['task-id']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('SessionManagement', 'publish', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const sessionAssignSessionBodyParam = {
      uid: 'string'
    };
    describe('#assignSession - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.assignSession(sessionAssignSessionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Session', 'assignSession', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const sessionContinueSessionInSmartconsoleBodyParam = {
      uid: 'string'
    };
    describe('#continueSessionInSmartconsole - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.continueSessionInSmartconsole(sessionContinueSessionInSmartconsoleBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Session', 'continueSessionInSmartconsole', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const sessionPurgePublishedSessionsByCountBodyParam = {
      'number-of-sessions-to-preserve': 'string'
    };
    describe('#purgePublishedSessionsByCount - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.purgePublishedSessionsByCount(sessionPurgePublishedSessionsByCountBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Session', 'purgePublishedSessionsByCount', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const sessionSetSessionBodyParam = {
      description: 'string'
    };
    describe('#setSession - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setSession(sessionSetSessionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Session', 'setSession', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const sessionShowLastPublishedSessionBodyParam = {};
    describe('#showLastPublishedSession - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showLastPublishedSession(sessionShowLastPublishedSessionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Session', 'showLastPublishedSession', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const sessionShowSessionBodyParam = {};
    describe('#showSession - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showSession(sessionShowSessionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Session', 'showSession', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const sessionShowSessionsBodyParam = {
      limit: 6,
      offset: 2,
      'details-level': 'string'
    };
    describe('#showSessions - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showSessions(sessionShowSessionsBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(16, data.response.to);
                assert.equal(16, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Session', 'showSessions', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const sessionSwitchSessionBodyParam = {
      uid: 'string'
    };
    describe('#switchSession - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.switchSession(sessionSwitchSessionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Session', 'switchSession', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const sessionTakeOverSessionBodyParam = {
      uid: 'string',
      'disconnect-active-session': false
    };
    describe('#takeOverSession - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.takeOverSession(sessionTakeOverSessionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Session', 'takeOverSession', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const loginMessageSetLoginMessageBodyParam = {
      'show-message': 'string',
      header: 'string',
      message: 'string',
      warning: 'string'
    };
    describe('#setLoginMessage - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setLoginMessage(loginMessageSetLoginMessageBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('LoginMessage', 'setLoginMessage', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const loginMessageShowLoginMessageBodyParam = {};
    describe('#showLoginMessage - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showLoginMessage(loginMessageShowLoginMessageBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('LoginMessage', 'showLoginMessage', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const hostAddHostBodyParam = {
      name: 'string',
      'ip-address': 'string'
    };
    describe('#addHost - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addHost(hostAddHostBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('9423d36f-2d66-4754-b9e2-e7f4493756d4', data.response.uid);
                assert.equal('object', typeof data.response.folder);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('New Host 4', data.response.name);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Objects/host', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal('object', typeof data.response['nat-settings']);
                assert.equal('192.0.2.1', data.response['ipv4-address']);
                assert.equal('', data.response['ipv6-address']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Host', 'addHost', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const hostDeleteHostBodyParam = {
      name: 'string'
    };
    describe('#deleteHost - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteHost(hostDeleteHostBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Host', 'deleteHost', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const hostSetHostBodyParam = {
      name: 'string',
      'ipv4-address': 'string',
      color: 'string'
    };
    describe('#setHost - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setHost(hostSetHostBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Host', 'setHost', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const hostShowHostBodyParam = {
      name: 'string'
    };
    describe('#showHost - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showHost(hostShowHostBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Host', 'showHost', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const hostShowHostsBodyParam = {
      limit: 2,
      offset: 9,
      'details-level': 'string'
    };
    describe('#showHosts - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showHosts(hostShowHostsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Host', 'showHosts', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const networkAddNetworkBodyParam = {
      name: 'string',
      subnet: 'string',
      'subnet-mask': 'string'
    };
    describe('#addNetwork - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addNetwork(networkAddNetworkBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Network', 'addNetwork', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const networkDeleteNetworkBodyParam = {
      name: 'string'
    };
    describe('#deleteNetwork - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteNetwork(networkDeleteNetworkBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Network', 'deleteNetwork', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const networkSetNetworkBodyParam = {
      name: 'string',
      'new-name': 'string',
      color: 'string',
      subnet: 'string',
      'mask-length': 9,
      groups: 'string'
    };
    describe('#setNetwork - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setNetwork(networkSetNetworkBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Network', 'setNetwork', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const networkShowNetworkBodyParam = {
      name: 'string'
    };
    describe('#showNetwork - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showNetwork(networkShowNetworkBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Network', 'showNetwork', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const networkShowNetworksBodyParam = {
      limit: 9,
      offset: 10,
      'details-level': 'string'
    };
    describe('#showNetworks - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showNetworks(networkShowNetworksBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Network', 'showNetworks', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const wildcardAddWildcardBodyParam = {
      name: 'string',
      'ipv4-address': 'string',
      'ipv4-mask-wildcard': 'string'
    };
    describe('#addWildcard - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addWildcard(wildcardAddWildcardBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Wildcard', 'addWildcard', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const wildcardDeleteWildcardBodyParam = {
      name: 'string'
    };
    describe('#deleteWildcard - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteWildcard(wildcardDeleteWildcardBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Wildcard', 'deleteWildcard', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const wildcardSetWildcardBodyParam = {
      name: 'string',
      'new-name': 'string',
      color: 'string',
      'ipv6-address': 'string',
      'ipv6-mask-wildcard': 'string',
      groups: 'string'
    };
    describe('#setWildcard - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setWildcard(wildcardSetWildcardBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Wildcard', 'setWildcard', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const wildcardShowWildcardBodyParam = {
      name: 'string'
    };
    describe('#showWildcard - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showWildcard(wildcardShowWildcardBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Wildcard', 'showWildcard', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const wildcardShowWildcardsBodyParam = {
      limit: 5,
      offset: 7,
      'details-level': 'string'
    };
    describe('#showWildcards - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showWildcards(wildcardShowWildcardsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Wildcard', 'showWildcards', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const groupAddGroupWithGroupBodyParam = {
      name: 'string',
      members: [
        'string'
      ],
      groups: [
        'string'
      ]
    };
    describe('#addGroupWithGroup - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addGroupWithGroup(groupAddGroupWithGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('ed997ff8-6709-4d71-a713-99bf01711cd5', data.response.uid);
                assert.equal('object', typeof data.response.folder);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('New Group 3', data.response.name);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('General/group', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(true, Array.isArray(data.response.members));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Group', 'addGroupWithGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const groupDeleteGroupBodyParam = {
      name: 'string'
    };
    describe('#deleteGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteGroup(groupDeleteGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Group', 'deleteGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const groupSetGroupBodyParam = {
      name: 'string',
      members: {
        add: 'New Host 2'
      },
      groups: 'string'
    };
    describe('#setGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setGroup(groupSetGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Group', 'setGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const groupShowGroupBodyParam = {
      name: 'string'
    };
    describe('#showGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showGroup(groupShowGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Group', 'showGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const groupShowGroupsBodyParam = {
      limit: 2,
      offset: 10,
      'details-level': 'string'
    };
    describe('#showGroups - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showGroups(groupShowGroupsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Group', 'showGroups', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const addressRangeAddAddressRangeBodyParam = {
      name: 'string',
      'ip-address-first': 'string',
      'ip-address-last': 'string'
    };
    describe('#addAddressRange - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addAddressRange(addressRangeAddAddressRangeBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AddressRange', 'addAddressRange', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const addressRangeDeleteAddressRangeBodyParam = {
      name: 'string'
    };
    describe('#deleteAddressRange - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteAddressRange(addressRangeDeleteAddressRangeBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AddressRange', 'deleteAddressRange', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const addressRangeSetAddressRangeBodyParam = {
      name: 'string',
      'new-name': 'string',
      color: 'string',
      'ip-address-first': 'string',
      'ip-address-last': 'string',
      groups: 'string'
    };
    describe('#setAddressRange - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setAddressRange(addressRangeSetAddressRangeBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AddressRange', 'setAddressRange', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const addressRangeShowAddressRangeBodyParam = {
      name: 'string'
    };
    describe('#showAddressRange - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showAddressRange(addressRangeShowAddressRangeBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AddressRange', 'showAddressRange', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const addressRangeShowAddressRangesBodyParam = {
      limit: 10,
      offset: 3,
      'details-level': 'string'
    };
    describe('#showAddressRanges - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showAddressRanges(addressRangeShowAddressRangesBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AddressRange', 'showAddressRanges', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const multicastAddressRangeAddMulticastAddressRangeIpRangeBodyParam = {
      name: 'string',
      'ip-address-first': 'string',
      'ip-address-last': 'string'
    };
    describe('#addMulticastAddressRangeIpRange - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addMulticastAddressRangeIpRange(multicastAddressRangeAddMulticastAddressRangeIpRangeBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('faff3fdf-01b9-4c58-97dc-176c409b5bc1', data.response.uid);
                assert.equal('New Multicast Address Range', data.response.name);
                assert.equal('multicast-address-range', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Objects/ip', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal('224.0.0.1', data.response['ipv4-address-first']);
                assert.equal('224.0.0.4', data.response['ipv4-address-last']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('MulticastAddressRange', 'addMulticastAddressRangeIpRange', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const multicastAddressRangeDeleteMulticastAddressRangeBodyParam = {
      name: 'string'
    };
    describe('#deleteMulticastAddressRange - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.deleteMulticastAddressRange(multicastAddressRangeDeleteMulticastAddressRangeBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('MulticastAddressRange', 'deleteMulticastAddressRange', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const multicastAddressRangeSetMulticastAddressRangeBodyParam = {
      name: 'string',
      'ip-address-first': 'string',
      'ip-address-last': 'string'
    };
    describe('#setMulticastAddressRange - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setMulticastAddressRange(multicastAddressRangeSetMulticastAddressRangeBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('77c85c47-0fff-4c36-afab-6c04fc118bc7', data.response.uid);
                assert.equal('New Multicast Address Range', data.response.name);
                assert.equal('multicast-address-range', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Objects/ip', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal('224.0.0.7', data.response['ipv4-address-first']);
                assert.equal('224.0.0.10', data.response['ipv4-address-last']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('MulticastAddressRange', 'setMulticastAddressRange', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const multicastAddressRangeShowMulticastAddressRangeBodyParam = {
      name: 'string'
    };
    describe('#showMulticastAddressRange - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showMulticastAddressRange(multicastAddressRangeShowMulticastAddressRangeBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('81d9cfda-c7c9-4a72-9a35-10cacc2dc0a3', data.response.uid);
                assert.equal('New Multicast Address Range', data.response.name);
                assert.equal('multicast-address-range', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(false, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Objects/ip', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal('224.0.0.7', data.response['ipv4-address-first']);
                assert.equal('224.0.0.10', data.response['ipv4-address-last']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('MulticastAddressRange', 'showMulticastAddressRange', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const multicastAddressRangeShowMulticastAddressRangesBodyParam = {
      'details-level': 'string'
    };
    describe('#showMulticastAddressRanges - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showMulticastAddressRanges(multicastAddressRangeShowMulticastAddressRangesBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(2, data.response.to);
                assert.equal(2, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('MulticastAddressRange', 'showMulticastAddressRanges', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const groupWithExclusionAddGroupWithExclusionBodyParam = {
      name: 'string',
      include: 'string',
      except: 'string'
    };
    describe('#addGroupWithExclusion - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addGroupWithExclusion(groupWithExclusionAddGroupWithExclusionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('GroupWithExclusion', 'addGroupWithExclusion', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const groupWithExclusionDeleteGroupWithExclusionBodyParam = {
      name: 'string'
    };
    describe('#deleteGroupWithExclusion - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteGroupWithExclusion(groupWithExclusionDeleteGroupWithExclusionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('GroupWithExclusion', 'deleteGroupWithExclusion', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const groupWithExclusionSetGroupWithExclusionBodyParam = {
      name: 'string',
      include: 'string',
      except: 'string'
    };
    describe('#setGroupWithExclusion - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setGroupWithExclusion(groupWithExclusionSetGroupWithExclusionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('GroupWithExclusion', 'setGroupWithExclusion', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const groupWithExclusionShowGroupWithExclusionBodyParam = {
      name: 'string'
    };
    describe('#showGroupWithExclusion - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showGroupWithExclusion(groupWithExclusionShowGroupWithExclusionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('GroupWithExclusion', 'showGroupWithExclusion', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const groupWithExclusionShowGroupsWithExclusionBodyParam = {
      limit: 5,
      offset: 6,
      'details-level': 'string'
    };
    describe('#showGroupsWithExclusion - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showGroupsWithExclusion(groupWithExclusionShowGroupsWithExclusionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('GroupWithExclusion', 'showGroupsWithExclusion', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const simpleGatewayAddSimpleGatewayBodyParam = {
      name: 'string',
      'ip-address': 'string'
    };
    describe('#addSimpleGateway - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addSimpleGateway(simpleGatewayAddSimpleGatewayBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('99457705-dc26-40ce-b9cd-5633eb09b1aa', data.response.uid);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('gw1', data.response.name);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('General/globalsNa', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal('::0', data.response['ipv6-address']);
                assert.equal(false, data.response['dynamic-ip']);
                assert.equal('R80', data.response.version);
                assert.equal('Gaia', data.response['os-name']);
                assert.equal('Open server', data.response.hardware);
                assert.equal('', data.response['sic-name']);
                assert.equal('uninitialized', data.response['sic-state']);
                assert.equal(true, Array.isArray(data.response.interfaces));
                assert.equal(true, data.response.firewall);
                assert.equal('object', typeof data.response['firewall-settings']);
                assert.equal(false, data.response.vpn);
                assert.equal(false, data.response['application-control']);
                assert.equal(false, data.response['url-filtering']);
                assert.equal(false, data.response['data-awareness']);
                assert.equal(false, data.response.ips);
                assert.equal(false, data.response['anti-bot']);
                assert.equal(false, data.response['anti-virus']);
                assert.equal(false, data.response['threat-emulation']);
                assert.equal(false, data.response['save-logs-locally']);
                assert.equal(true, Array.isArray(data.response['send-alerts-to-server']));
                assert.equal(true, Array.isArray(data.response['send-logs-to-server']));
                assert.equal(true, Array.isArray(data.response['send-logs-to-backup-server']));
                assert.equal('object', typeof data.response['logs-settings']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('SimpleGateway', 'addSimpleGateway', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const simpleGatewayDeleteSimpleGatewayBodyParam = {
      name: 'string'
    };
    describe('#deleteSimpleGateway - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteSimpleGateway(simpleGatewayDeleteSimpleGatewayBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('SimpleGateway', 'deleteSimpleGateway', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const simpleGatewaySetSimpleGatewayBodyParam = {
      name: 'string',
      vpn: false,
      'application-control': false,
      'url-filtering': true,
      ips: true,
      'anti-bot': false,
      'anti-virus': false,
      'threat-emulation': false
    };
    describe('#setSimpleGateway - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setSimpleGateway(simpleGatewaySetSimpleGatewayBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('SimpleGateway', 'setSimpleGateway', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const simpleGatewayShowSimpleGatewayBodyParam = {
      name: 'string'
    };
    describe('#showSimpleGateway - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showSimpleGateway(simpleGatewayShowSimpleGatewayBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('SimpleGateway', 'showSimpleGateway', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const simpleGatewayShowSimpleGatewaysBodyParam = {
      limit: 6,
      offset: 3,
      'details-level': 'string'
    };
    describe('#showSimpleGateways - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showSimpleGateways(simpleGatewayShowSimpleGatewaysBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('SimpleGateway', 'showSimpleGateways', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const securityZoneAddSecurityZoneBodyParam = {
      name: 'string',
      comments: 'string',
      color: 'string'
    };
    describe('#addSecurityZone - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addSecurityZone(securityZoneAddSecurityZoneBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('SecurityZone', 'addSecurityZone', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const securityZoneDeleteSecurityZoneBodyParam = {
      name: 'string'
    };
    describe('#deleteSecurityZone - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteSecurityZone(securityZoneDeleteSecurityZoneBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('SecurityZone', 'deleteSecurityZone', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const securityZoneSetSecurityZoneBodyParam = {
      name: 'string',
      'new-name': 'string'
    };
    describe('#setSecurityZone - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setSecurityZone(securityZoneSetSecurityZoneBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('SecurityZone', 'setSecurityZone', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const securityZoneShowSecurityZoneBodyParam = {
      name: 'string'
    };
    describe('#showSecurityZone - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showSecurityZone(securityZoneShowSecurityZoneBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('SecurityZone', 'showSecurityZone', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const securityZoneShowSecurityZonesBodyParam = {};
    describe('#showSecurityZones - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showSecurityZones(securityZoneShowSecurityZonesBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(5, data.response.to);
                assert.equal(5, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('SecurityZone', 'showSecurityZones', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const timeAddTimeBodyParam = {
      name: 'string',
      'start-now': 'string',
      end: {
        date: '24-Nov-2014',
        time: '21:22'
      },
      'end-never': 'string',
      'hours-ranges': [
        {
          from: '00:00',
          to: '00:00',
          enabled: true,
          index: 1
        }
      ],
      recurrence: {
        pattern: 'Daily',
        month: 'Any',
        weekdays: [
          'Sun',
          'Mon'
        ],
        days: [
          '1'
        ]
      }
    };
    describe('#addTime - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addTime(timeAddTimeBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Time', 'addTime', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const timeDeleteTimeBodyParam = {
      name: 'string'
    };
    describe('#deleteTime - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteTime(timeDeleteTimeBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Time', 'deleteTime', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const timeSetTimeBodyParam = {
      name: 'string',
      'hours-ranges': [
        {
          from: '00:22',
          to: '00:33'
        }
      ],
      recurrence: {
        pattern: 'Weekly',
        weekdays: [
          'Fri'
        ],
        month: 'Any'
      }
    };
    describe('#setTime - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setTime(timeSetTimeBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Time', 'setTime', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const timeShowTimeBodyParam = {
      name: 'string'
    };
    describe('#showTime - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showTime(timeShowTimeBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Time', 'showTime', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const timeShowTimesBodyParam = {
      limit: 4,
      offset: 2,
      'details-level': 'string'
    };
    describe('#showTimes - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showTimes(timeShowTimesBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Time', 'showTimes', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const timeGroupAddTimeGroupBodyParam = {
      name: 'string'
    };
    describe('#addTimeGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addTimeGroup(timeGroupAddTimeGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('TimeGroup', 'addTimeGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const timeGroupDeleteTimeGroupBodyParam = {
      name: 'string'
    };
    describe('#deleteTimeGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteTimeGroup(timeGroupDeleteTimeGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('TimeGroup', 'deleteTimeGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const timeGroupSetTimeGroupBodyParam = {
      name: 'string',
      members: {
        add: 'New Host 2'
      }
    };
    describe('#setTimeGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setTimeGroup(timeGroupSetTimeGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('TimeGroup', 'setTimeGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const timeGroupShowTimeGroupBodyParam = {
      name: 'string'
    };
    describe('#showTimeGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showTimeGroup(timeGroupShowTimeGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('TimeGroup', 'showTimeGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const timeGroupShowTimeGroupsBodyParam = {
      limit: 3,
      offset: 2,
      'details-level': 'string'
    };
    describe('#showTimeGroups - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showTimeGroups(timeGroupShowTimeGroupsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('TimeGroup', 'showTimeGroups', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessRoleAddAccessRoleBodyParam = {
      name: 'string',
      networks: 'string',
      users: 'string',
      machines: 'string',
      'remote-access-clients': 'string'
    };
    describe('#addAccessRole - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addAccessRole(accessRoleAddAccessRoleBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessRole', 'addAccessRole', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessRoleDeleteAccessRoleBodyParam = {
      name: 'string'
    };
    describe('#deleteAccessRole - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteAccessRole(accessRoleDeleteAccessRoleBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessRole', 'deleteAccessRole', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessRoleSetAccessRoleBodyParam = {
      name: 'string',
      users: 'string',
      machines: 'string'
    };
    describe('#setAccessRole - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setAccessRole(accessRoleSetAccessRoleBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessRole', 'setAccessRole', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessRoleShowAccessRoleBodyParam = {
      name: 'string'
    };
    describe('#showAccessRole - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showAccessRole(accessRoleShowAccessRoleBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessRole', 'showAccessRole', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessRoleShowAccessRolesBodyParam = {
      'details-level': 'string'
    };
    describe('#showAccessRoles - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showAccessRoles(accessRoleShowAccessRolesBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessRole', 'showAccessRoles', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dynamicObjectAddDynamicObjectBodyParam = {
      name: 'string',
      comments: 'string',
      color: 'string'
    };
    describe('#addDynamicObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addDynamicObject(dynamicObjectAddDynamicObjectBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('c5a7f50c-a951-45be-8b82-48441c9f48de', data.response.uid);
                assert.equal('Dynamic_Object_1', data.response.name);
                assert.equal('dynamic-object', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('My Dynamic Object 1', data.response.comments);
                assert.equal('yellow', data.response.color);
                assert.equal('NetworkObjects/dynamicObject', data.response.icon);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DynamicObject', 'addDynamicObject', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dynamicObjectDeleteDynamicObjectBodyParam = {
      name: 'string'
    };
    describe('#deleteDynamicObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.deleteDynamicObject(dynamicObjectDeleteDynamicObjectBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DynamicObject', 'deleteDynamicObject', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dynamicObjectSetDynamicObjectBodyParam = {
      name: 'string',
      'new-name': 'string'
    };
    describe('#setDynamicObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setDynamicObject(dynamicObjectSetDynamicObjectBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('5d98de8f-722d-4560-ae65-829ef2bffd15', data.response.uid);
                assert.equal('Dynamic_Object_2', data.response.name);
                assert.equal('dynamic-object', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('My Dynamic Object 1', data.response.comments);
                assert.equal('yellow', data.response.color);
                assert.equal('NetworkObjects/dynamicObject', data.response.icon);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DynamicObject', 'setDynamicObject', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dynamicObjectShowDynamicObjectBodyParam = {
      name: 'string'
    };
    describe('#showDynamicObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showDynamicObject(dynamicObjectShowDynamicObjectBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('5d98de8f-722d-4560-ae65-829ef2bffd15', data.response.uid);
                assert.equal('Dynamic_Object_1', data.response.name);
                assert.equal('dynamic-object', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(false, data.response['read-only']);
                assert.equal('My Dynamic Object 1', data.response.comments);
                assert.equal('yellow', data.response.color);
                assert.equal('NetworkObjects/dynamicObject', data.response.icon);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DynamicObject', 'showDynamicObject', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dynamicObjectShowDynamicObjectsBodyParam = {};
    describe('#showDynamicObjects - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showDynamicObjects(dynamicObjectShowDynamicObjectsBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(7, data.response.to);
                assert.equal(7, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DynamicObject', 'showDynamicObjects', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const trustedClientAddTrustedClientBodyParam = {
      name: 'string',
      type: 'string'
    };
    describe('#addTrustedClient - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addTrustedClient(trustedClientAddTrustedClientBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('TrustedClient', 'addTrustedClient', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const trustedClientDeleteTrustedClientBodyParam = {
      name: 'string'
    };
    describe('#deleteTrustedClient - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteTrustedClient(trustedClientDeleteTrustedClientBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('TrustedClient', 'deleteTrustedClient', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const trustedClientSetTrustedClientBodyParam = {
      name: 'string',
      type: 'string',
      'ip-address': 'string',
      'mask-length': 'string'
    };
    describe('#setTrustedClient - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setTrustedClient(trustedClientSetTrustedClientBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('TrustedClient', 'setTrustedClient', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const trustedClientShowTrustedClientBodyParam = {
      name: 'string'
    };
    describe('#showTrustedClient - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showTrustedClient(trustedClientShowTrustedClientBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('TrustedClient', 'showTrustedClient', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const trustedClientShowTrustedClientsBodyParam = {
      limit: 3,
      offset: 4,
      'details-level': 'string'
    };
    describe('#showTrustedClients - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showTrustedClients(trustedClientShowTrustedClientsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('TrustedClient', 'showTrustedClients', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const tagsAddTagBodyParam = {
      name: 'string',
      tags: [
        'string'
      ]
    };
    describe('#addTag - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addTag(tagsAddTagBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('728a4212-a521-46a2-a5a1-b6536a9aecd5', data.response.uid);
                assert.equal('object', typeof data.response.folder);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('My New Tag1', data.response.name);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('General/globalsNa', data.response.icon);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Tags', 'addTag', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const tagsDeleteTagBodyParam = {
      name: 'string'
    };
    describe('#deleteTag - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteTag(tagsDeleteTagBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Tags', 'deleteTag', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const tagsSetTagBodyParam = {
      name: 'string',
      'new-name': 'string',
      tags: {
        add: 'tag3'
      }
    };
    describe('#setTag - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setTag(tagsSetTagBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('728a4212-a521-46a2-a5a1-b6536a9aecd5', data.response.uid);
                assert.equal('object', typeof data.response.folder);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('My New Tag21', data.response.name);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('General/globalsNa', data.response.icon);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Tags', 'setTag', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const tagsShowTagBodyParam = {
      name: 'string'
    };
    describe('#showTag - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showTag(tagsShowTagBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('f96b37ec-e22e-4945-8bbf-d37b117914e0', data.response.uid);
                assert.equal('object', typeof data.response.folder);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('my tag', data.response.name);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('General/globalsNa', data.response.icon);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Tags', 'showTag', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const tagsShowTagsBodyParam = {};
    describe('#showTags - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showTags(tagsShowTagsBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(15, data.response.to);
                assert.equal(15, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Tags', 'showTags', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dNSDomainAddDnsDomainBodyParam = {
      name: 'string',
      'is-sub-domain': false
    };
    describe('#addDnsDomain - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addDnsDomain(dNSDomainAddDnsDomainBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('ea6b168b-87d8-4ab6-9a8c-89c422dbde88', data.response.uid);
                assert.equal('.www.example.com', data.response.name);
                assert.equal('dns-domain', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Objects/domain', data.response.icon);
                assert.equal(false, data.response['is-sub-domain']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DNSDomain', 'addDnsDomain', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dNSDomainDeleteDnsDomainBodyParam = {
      name: 'string'
    };
    describe('#deleteDnsDomain - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.deleteDnsDomain(dNSDomainDeleteDnsDomainBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DNSDomain', 'deleteDnsDomain', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dNSDomainSetDnsDomainBodyParam = {
      name: 'string',
      'new-name': 'string',
      'is-sub-domain': true
    };
    describe('#setDnsDomain - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setDnsDomain(dNSDomainSetDnsDomainBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('ea6b168b-87d8-4ab6-9a8c-89c422dbde88', data.response.uid);
                assert.equal('.example.com', data.response.name);
                assert.equal('dns-domain', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Objects/domain', data.response.icon);
                assert.equal(true, data.response['is-sub-domain']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DNSDomain', 'setDnsDomain', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dNSDomainShowDnsDomainBodyParam = {
      name: 'string'
    };
    describe('#showDnsDomain - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showDnsDomain(dNSDomainShowDnsDomainBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('ab7aa902-ccac-4278-b4eb-c140c07c6170', data.response.uid);
                assert.equal('.www.example.com', data.response.name);
                assert.equal('dns-domain', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(false, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Objects/domain', data.response.icon);
                assert.equal(false, data.response['is-sub-domain']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DNSDomain', 'showDnsDomain', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dNSDomainShowDnsDomainsBodyParam = {
      limit: 9,
      offset: 5,
      'details-level': 'string'
    };
    describe('#showDnsDomains - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showDnsDomains(dNSDomainShowDnsDomainsBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(1, data.response.to);
                assert.equal(1, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DNSDomain', 'showDnsDomains', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const oPSECApplicationAddOpsecApplicationBodyParam = {
      name: 'string',
      host: 'string',
      cpmi: {
        enabled: 'true',
        'use-administrator-credentials': 'false',
        'administrator-profile': 'Super User'
      },
      lea: {
        enabled: 'false'
      },
      'one-time-password': 'string'
    };
    describe('#addOpsecApplication - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addOpsecApplication(oPSECApplicationAddOpsecApplicationBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('1741bb6c-3b19-456c-a635-b96c8456a0e8', data.response.uid);
                assert.equal('MyOpsecApplication', data.response.name);
                assert.equal('opsec-application', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('SomeHost', data.response.host);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('OPSECapplications/OPSEC', data.response.icon);
                assert.equal('object', typeof data.response.cpmi);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('OPSECApplication', 'addOpsecApplication', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const oPSECApplicationDeleteOpsecApplicationBodyParam = {
      name: 'string'
    };
    describe('#deleteOpsecApplication - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.deleteOpsecApplication(oPSECApplicationDeleteOpsecApplicationBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('OPSECApplication', 'deleteOpsecApplication', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const oPSECApplicationSetOpsecApplicationBodyParam = {
      name: 'string',
      'new-name': 'string',
      cpmi: {
        enabled: 'false'
      },
      lea: {
        enabled: 'true',
        'access-permissions': 'Show All'
      }
    };
    describe('#setOpsecApplication - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setOpsecApplication(oPSECApplicationSetOpsecApplicationBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('1741bb6c-3b19-456c-a635-b96c8456a0e8', data.response.uid);
                assert.equal('MyUpdatedOpsecapplication', data.response.name);
                assert.equal('opsec-application', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('SomeHost', data.response.host);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('OPSECapplications/OPSEC', data.response.icon);
                assert.equal('object', typeof data.response.lea);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('OPSECApplication', 'setOpsecApplication', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const oPSECApplicationShowOpsecApplicationBodyParam = {
      name: 'string'
    };
    describe('#showOpsecApplication - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showOpsecApplication(oPSECApplicationShowOpsecApplicationBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('1741bb6c-3b19-456c-a635-b96c8456a0e8', data.response.uid);
                assert.equal('MyUpdatedOpsecapplication', data.response.name);
                assert.equal('opsec-application', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('SomeHost', data.response.host);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(false, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('OPSECapplications/OPSEC', data.response.icon);
                assert.equal('object', typeof data.response.lea);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('OPSECApplication', 'showOpsecApplication', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const oPSECApplicationShowOpsecApplicationsBodyParam = {};
    describe('#showOpsecApplications - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showOpsecApplications(oPSECApplicationShowOpsecApplicationsBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(2, data.response.to);
                assert.equal(2, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('OPSECApplication', 'showOpsecApplications', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dataCenterShowDataCenterBodyParam = {
      name: 'string'
    };
    describe('#showDataCenter - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showDataCenter(dataCenterShowDataCenterBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('d5379ada-c7d7-4678-bf55-0776f33b2326', data.response.uid);
                assert.equal('vCenter 1', data.response.name);
                assert.equal('data-center', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('NetworkObjects/ExternalDataSource', data.response.icon);
                assert.equal('vCenter', data.response['server-type']);
                assert.equal('object', typeof data.response.properties);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DataCenter', 'showDataCenter', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dataCenterShowDataCenterContentBodyParam = {
      'data-center-name': 'string'
    };
    describe('#showDataCenterContent - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showDataCenterContent(dataCenterShowDataCenterContentBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(true, Array.isArray(data.response.objects));
                assert.equal(1, data.response.from);
                assert.equal(3, data.response.to);
                assert.equal(3, data.response.total);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DataCenter', 'showDataCenterContent', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dataCenterShowDataCentersBodyParam = {};
    describe('#showDataCenters - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showDataCenters(dataCenterShowDataCentersBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(1, data.response.to);
                assert.equal(1, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DataCenter', 'showDataCenters', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dataCenterObjectAddDataCenterObjectWithGroupBodyParam = {
      'data-center-name': 'string',
      uri: 'string',
      name: 'string',
      groups: [
        'string'
      ]
    };
    describe('#addDataCenterObjectWithGroup - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addDataCenterObjectWithGroup(dataCenterObjectAddDataCenterObjectWithGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('63e7f3d7-f202-4149-a806-f9faf3a2d989', data.response.uid);
                assert.equal('VM1 mgmt name', data.response.name);
                assert.equal('data-center-object', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('', data.response.comments);
                assert.equal('none', data.response.color);
                assert.equal('NetworkObjects/ExternalDataObject', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(true, Array.isArray(data.response['additional-properties']));
                assert.equal('object', typeof data.response['data-center']);
                assert.equal('My VM1', data.response['name-in-data-center']);
                assert.equal('object', typeof data.response['data-center-object-meta-info']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DataCenterObject', 'addDataCenterObjectWithGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dataCenterObjectDeleteDataCenterObjectBodyParam = {
      name: 'string'
    };
    describe('#deleteDataCenterObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.deleteDataCenterObject(dataCenterObjectDeleteDataCenterObjectBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DataCenterObject', 'deleteDataCenterObject', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dataCenterObjectShowDataCenterObjectBodyParam = {
      name: 'string'
    };
    describe('#showDataCenterObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showDataCenterObject(dataCenterObjectShowDataCenterObjectBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('63e7f3d7-f202-4149-a806-f9faf3a2d989', data.response.uid);
                assert.equal('VM1 mgmt name', data.response.name);
                assert.equal('data-center-object', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('', data.response.comments);
                assert.equal('none', data.response.color);
                assert.equal('NetworkObjects/ExternalDataObject', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(true, Array.isArray(data.response['additional-properties']));
                assert.equal('vm-1', data.response['uid-in-data-center']);
                assert.equal('object', typeof data.response['data-center']);
                assert.equal('My VM1', data.response['name-in-data-center']);
                assert.equal('object', typeof data.response['data-center-object-meta-info']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DataCenterObject', 'showDataCenterObject', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const dataCenterObjectShowDataCenterObjectsBodyParam = {};
    describe('#showDataCenterObjects - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showDataCenterObjects(dataCenterObjectShowDataCenterObjectsBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(4, data.response.to);
                assert.equal(4, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('DataCenterObject', 'showDataCenterObjects', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const updatableObjectsRepositoryShowUpdatableObjectsRepositoryContentBodyParam = {
      limit: 9
    };
    describe('#showUpdatableObjectsRepositoryContent - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showUpdatableObjectsRepositoryContent(updatableObjectsRepositoryShowUpdatableObjectsRepositoryContentBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(1, data.response.to);
                assert.equal(123, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('UpdatableObjectsRepository', 'showUpdatableObjectsRepositoryContent', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const updatableObjectsRepositoryUpdateUpdatableObjectsRepositoryContentBodyParam = {};
    describe('#updateUpdatableObjectsRepositoryContent - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.updateUpdatableObjectsRepositoryContent(updatableObjectsRepositoryUpdateUpdatableObjectsRepositoryContentBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('01234567-89ab-cdef-a930-8c37a59972b3', data.response['task-id']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('UpdatableObjectsRepository', 'updateUpdatableObjectsRepositoryContent', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const updatableObjectAddUpdatableObjectBodyParam = {
      uri: 'string'
    };
    describe('#addUpdatableObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addUpdatableObject(updatableObjectAddUpdatableObjectBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('1506cdeb-c132-4d28-bca5-95eb07e12828', data.response.uid);
                assert.equal('CodeBuild US East 1', data.response.name);
                assert.equal('updatable-object', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('CodeBuild US East 1', data.response['name-in-updatable-objects-repository']);
                assert.equal('65fcda90-774d-3efc-8402-e814cb89aa9c', data.response['uid-in-updatable-objects-repository']);
                assert.equal('object', typeof data.response['additional-properties']);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('@app/cp_aws_codebuild', data.response.icon);
                assert.equal('object', typeof data.response['updatable-object-meta-info']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('UpdatableObject', 'addUpdatableObject', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const updatableObjectDeleteUpdatableObjectBodyParam = {
      name: 'string'
    };
    describe('#deleteUpdatableObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.deleteUpdatableObject(updatableObjectDeleteUpdatableObjectBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('UpdatableObject', 'deleteUpdatableObject', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const updatableObjectShowUpdatableObjectBodyParam = {
      name: 'string'
    };
    describe('#showUpdatableObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showUpdatableObject(updatableObjectShowUpdatableObjectBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('1506cdeb-c132-4d28-bca5-95eb07e12828', data.response.uid);
                assert.equal('CodeBuild US East 1', data.response.name);
                assert.equal('updatable-object', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('CodeBuild US East 1', data.response['name-in-updatable-objects-repository']);
                assert.equal('65fcda90-774d-3efc-8402-e814cb89aa9c', data.response['uid-in-updatable-objects-repository']);
                assert.equal('object', typeof data.response['additional-properties']);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(false, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('@app/cp_aws_codebuild', data.response.icon);
                assert.equal('object', typeof data.response['updatable-object-meta-info']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('UpdatableObject', 'showUpdatableObject', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const updatableObjectShowUpdatableObjectsBodyParam = {};
    describe('#showUpdatableObjects - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showUpdatableObjects(updatableObjectShowUpdatableObjectsBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(2, data.response.to);
                assert.equal(2, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('UpdatableObject', 'showUpdatableObjects', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceTCPAddServiceTcpBodyParam = {
      name: 'string',
      port: 2,
      'keep-connections-open-after-policy-installation': false,
      'session-timeout': 1,
      'match-for-any': false,
      'sync-connections-on-cluster': false,
      'aggressive-aging': {
        enable: true,
        timeout: 360,
        'use-default-timeout': false
      }
    };
    describe('#addServiceTcp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addServiceTcp(serviceTCPAddServiceTcpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('bee785c5-998b-4a45-80e8-3fa91181aba9', data.response.uid);
                assert.equal('New_TCP_Service_1', data.response.name);
                assert.equal('service-tcp', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Services/TCPService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal(0, data.response['session-timeout']);
                assert.equal(true, data.response['use-default-session-timeout']);
                assert.equal(true, data.response['match-for-any']);
                assert.equal(true, data.response['sync-connections-on-cluster']);
                assert.equal('object', typeof data.response['aggressive-aging']);
                assert.equal('5669', data.response.port);
                assert.equal(false, data.response['match-by-protocol-signature']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceTCP', 'addServiceTcp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceTCPDeleteServiceTcpBodyParam = {
      name: 'string'
    };
    describe('#deleteServiceTcp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.deleteServiceTcp(serviceTCPDeleteServiceTcpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceTCP', 'deleteServiceTcp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceTCPSetServiceTcpBodyParam = {
      name: 'string',
      'new-name': 'string',
      color: 'string',
      port: 1,
      'aggressive-aging': {
        'default-timeout': 3600
      }
    };
    describe('#setServiceTcp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setServiceTcp(serviceTCPSetServiceTcpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('785a4a8b-8c69-4143-9646-b34ee3b830c5', data.response.uid);
                assert.equal('New_TCP_Service_2', data.response.name);
                assert.equal('service-tcp', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('light green', data.response.color);
                assert.equal('Services/TCPService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal(0, data.response['session-timeout']);
                assert.equal(true, data.response['use-default-session-timeout']);
                assert.equal(true, data.response['match-for-any']);
                assert.equal(true, data.response['sync-connections-on-cluster']);
                assert.equal('object', typeof data.response['aggressive-aging']);
                assert.equal('5656', data.response.port);
                assert.equal(false, data.response['match-by-protocol-signature']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceTCP', 'setServiceTcp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceTCPShowServiceTcpBodyParam = {
      name: 'string'
    };
    describe('#showServiceTcp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showServiceTcp(serviceTCPShowServiceTcpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('97aeb443-9aea-11d5-bd16-0090272ccb30', data.response.uid);
                assert.equal('https', data.response.name);
                assert.equal('service-tcp', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(false, data.response['read-only']);
                assert.equal('HTTP protocol over TLS/SSL', data.response.comments);
                assert.equal('red', data.response.color);
                assert.equal('Services/TCPService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal(3600, data.response['session-timeout']);
                assert.equal(true, data.response['use-default-session-timeout']);
                assert.equal(true, data.response['match-for-any']);
                assert.equal(true, data.response['sync-connections-on-cluster']);
                assert.equal('object', typeof data.response['aggressive-aging']);
                assert.equal('443', data.response.port);
                assert.equal('ENC-HTTP', data.response.protocol);
                assert.equal(false, data.response['match-by-protocol-signature']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceTCP', 'showServiceTcp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceTCPShowServicesTcpBodyParam = {
      limit: 5,
      offset: 8,
      'details-level': 'string'
    };
    describe('#showServicesTcp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showServicesTcp(serviceTCPShowServicesTcpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(10, data.response.to);
                assert.equal(217, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceTCP', 'showServicesTcp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceUDPAddServiceUdpBodyParam = {
      name: 'string',
      port: 6,
      'keep-connections-open-after-policy-installation': true,
      'session-timeout': 1,
      'match-for-any': true,
      'sync-connections-on-cluster': true,
      'aggressive-aging': {
        enable: true,
        timeout: 360,
        'use-default-timeout': false
      },
      'accept-replies': true
    };
    describe('#addServiceUdp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addServiceUdp(serviceUDPAddServiceUdpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('64a4c8d1-7fed-4320-9826-0570bbb4a5bd', data.response.uid);
                assert.equal('New_UDP_Service_1', data.response.name);
                assert.equal('service-udp', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Services/UDPService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal(0, data.response['session-timeout']);
                assert.equal(true, data.response['use-default-session-timeout']);
                assert.equal(true, data.response['match-for-any']);
                assert.equal(true, data.response['sync-connections-on-cluster']);
                assert.equal('object', typeof data.response['aggressive-aging']);
                assert.equal('5669', data.response.port);
                assert.equal(false, data.response['match-by-protocol-signature']);
                assert.equal(false, data.response['accept-replies']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceUDP', 'addServiceUdp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceUDPDeleteServiceUdpBodyParam = {
      name: 'string'
    };
    describe('#deleteServiceUdp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.deleteServiceUdp(serviceUDPDeleteServiceUdpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceUDP', 'deleteServiceUdp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceUDPSetServiceUdpBodyParam = {
      name: 'string',
      'new-name': 'string',
      color: 'string',
      port: 10,
      'aggressive-aging': {
        'default-timeout': 3600
      },
      'accept-replies': false
    };
    describe('#setServiceUdp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setServiceUdp(serviceUDPSetServiceUdpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('ae4e3c2e-8368-4b98-9846-6391770a81aa', data.response.uid);
                assert.equal('New_UDP_Service_4', data.response.name);
                assert.equal('service-udp', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('light green', data.response.color);
                assert.equal('Protocols/FTP', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal(0, data.response['session-timeout']);
                assert.equal(true, data.response['use-default-session-timeout']);
                assert.equal(true, data.response['match-for-any']);
                assert.equal(true, data.response['sync-connections-on-cluster']);
                assert.equal('object', typeof data.response['aggressive-aging']);
                assert.equal('5656', data.response.port);
                assert.equal('TFTP', data.response.protocol);
                assert.equal(true, data.response['match-by-protocol-signature']);
                assert.equal(true, data.response['accept-replies']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceUDP', 'setServiceUdp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceUDPShowServiceUdpBodyParam = {
      name: 'string'
    };
    describe('#showServiceUdp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showServiceUdp(serviceUDPShowServiceUdpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('97aeb3eb-9aea-11d5-bd16-0090272ccb30', data.response.uid);
                assert.equal('bootp', data.response.name);
                assert.equal('service-udp', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(false, data.response['read-only']);
                assert.equal('Bootstrap Protocol Server, users automatically configured ', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Services/UDPService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal(40, data.response['session-timeout']);
                assert.equal(true, data.response['use-default-session-timeout']);
                assert.equal(true, data.response['match-for-any']);
                assert.equal(true, data.response['sync-connections-on-cluster']);
                assert.equal('object', typeof data.response['aggressive-aging']);
                assert.equal('67', data.response.port);
                assert.equal(false, data.response['match-by-protocol-signature']);
                assert.equal(true, data.response['accept-replies']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceUDP', 'showServiceUdp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceUDPShowServicesUdpBodyParam = {
      limit: 3,
      offset: 6,
      'details-level': 'string'
    };
    describe('#showServicesUdp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showServicesUdp(serviceUDPShowServicesUdpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(10, data.response.to);
                assert.equal(93, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceUDP', 'showServicesUdp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceICMPAddServiceIcmpBodyParam = {
      name: 'string',
      'icmp-type': 4,
      'icmp-code': 4
    };
    describe('#addServiceIcmp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addServiceIcmp(serviceICMPAddServiceIcmpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('22c8faba-3a24-4e99-ae6f-e798014facc2', data.response.uid);
                assert.equal('Icmp1', data.response.name);
                assert.equal('service-icmp', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal(5, data.response['icmp-type']);
                assert.equal(7, data.response['icmp-code']);
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Services/ICMPService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceICMP', 'addServiceIcmp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceICMPDeleteServiceIcmpBodyParam = {
      name: 'string'
    };
    describe('#deleteServiceIcmp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.deleteServiceIcmp(serviceICMPDeleteServiceIcmpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceICMP', 'deleteServiceIcmp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceICMPSetServiceIcmpBodyParam = {
      name: 'string',
      'new-name': 'string',
      'icmp-type': 7,
      'icmp-code': 2
    };
    describe('#setServiceIcmp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setServiceIcmp(serviceICMPSetServiceIcmpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('22c8faba-3a24-4e99-ae6f-e798014facc2', data.response.uid);
                assert.equal('icmp3', data.response.name);
                assert.equal('service-icmp', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal(45, data.response['icmp-type']);
                assert.equal(13, data.response['icmp-code']);
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Services/ICMPService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceICMP', 'setServiceIcmp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceICMPShowServiceIcmpBodyParam = {
      name: 'string'
    };
    describe('#showServiceIcmp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showServiceIcmp(serviceICMPShowServiceIcmpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('97aeb40f-9aea-11d5-bd16-0090272ccb30', data.response.uid);
                assert.equal('info-req', data.response.name);
                assert.equal('service-icmp', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal(15, data.response['icmp-type']);
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(false, data.response['read-only']);
                assert.equal('ICMP, info request', data.response.comments);
                assert.equal('orchid', data.response.color);
                assert.equal('Services/ICMPService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceICMP', 'showServiceIcmp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceICMPShowServicesIcmpBodyParam = {
      limit: 3,
      offset: 6
    };
    describe('#showServicesIcmp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showServicesIcmp(serviceICMPShowServicesIcmpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(4, data.response.from);
                assert.equal(7, data.response.to);
                assert.equal(14, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceICMP', 'showServicesIcmp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceICMP6AddServiceIcmp6BodyParam = {
      name: 'string',
      'icmp-type': 1,
      'icmp-code': 5
    };
    describe('#addServiceIcmp6 - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addServiceIcmp6(serviceICMP6AddServiceIcmp6BodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('d9dcb753-1aa7-4e65-b5ff-b4878f8b3890', data.response.uid);
                assert.equal('Icmp2', data.response.name);
                assert.equal('service-icmp6', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal(5, data.response['icmp-type']);
                assert.equal(7, data.response['icmp-code']);
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Services/ICMPV6Service', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceICMP6', 'addServiceIcmp6', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceICMP6DeleteServiceIcmp6BodyParam = {
      name: 'string'
    };
    describe('#deleteServiceIcmp6 - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.deleteServiceIcmp6(serviceICMP6DeleteServiceIcmp6BodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceICMP6', 'deleteServiceIcmp6', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceICMP6SetServiceIcmp6BodyParam = {
      name: 'string',
      'new-name': 'string',
      'icmp-type': 5,
      'icmp-code': 2
    };
    describe('#setServiceIcmp6 - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setServiceIcmp6(serviceICMP6SetServiceIcmp6BodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('d9dcb753-1aa7-4e65-b5ff-b4878f8b3890', data.response.uid);
                assert.equal('icmp4', data.response.name);
                assert.equal('service-icmp6', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal(45, data.response['icmp-type']);
                assert.equal(13, data.response['icmp-code']);
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Services/ICMPV6Service', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceICMP6', 'setServiceIcmp6', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceICMP6ShowServiceIcmp6BodyParam = {
      name: 'string'
    };
    describe('#showServiceIcmp6 - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showServiceIcmp6(serviceICMP6ShowServiceIcmp6BodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('ac85a522-916a-4ce0-8411-32d1d0016348', data.response.uid);
                assert.equal('echo-reply6', data.response.name);
                assert.equal('service-icmp6', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal(129, data.response['icmp-type']);
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(false, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('blue', data.response.color);
                assert.equal('Services/ICMPV6Service', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceICMP6', 'showServiceIcmp6', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceICMP6ShowServicesIcmp6BodyParam = {
      limit: 2,
      offset: 8
    };
    describe('#showServicesIcmp6 - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showServicesIcmp6(serviceICMP6ShowServicesIcmp6BodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(5, data.response.from);
                assert.equal(6, data.response.to);
                assert.equal(25, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceICMP6', 'showServicesIcmp6', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceSCTPAddServiceSctpBodyParam = {
      name: 'string',
      port: 1,
      'keep-connections-open-after-policy-installation': true,
      'session-timeout': 4,
      'match-for-any': false,
      'sync-connections-on-cluster': true,
      'aggressive-aging': {
        enable: true,
        timeout: 360,
        'use-default-timeout': false
      }
    };
    describe('#addServiceSctp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addServiceSctp(serviceSCTPAddServiceSctpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('d0385c6d-72dd-4981-b951-4783b7100343', data.response.uid);
                assert.equal('New_SCTP_Service_1', data.response.name);
                assert.equal('service-sctp', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Services/SCTPService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal(0, data.response['session-timeout']);
                assert.equal(true, data.response['use-default-session-timeout']);
                assert.equal(true, data.response['match-for-any']);
                assert.equal(true, data.response['sync-connections-on-cluster']);
                assert.equal('object', typeof data.response['aggressive-aging']);
                assert.equal('5669', data.response.port);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceSCTP', 'addServiceSctp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceSCTPDeleteServiceSctpBodyParam = {
      name: 'string'
    };
    describe('#deleteServiceSctp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.deleteServiceSctp(serviceSCTPDeleteServiceSctpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceSCTP', 'deleteServiceSctp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceSCTPSetServiceSctpBodyParam = {
      name: 'string',
      'new-name': 'string',
      color: 'string',
      port: 9,
      'aggressive-aging': {
        'default-timeout': 3600
      }
    };
    describe('#setServiceSctp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setServiceSctp(serviceSCTPSetServiceSctpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('d0385c6d-72dd-4981-b951-4783b7100343', data.response.uid);
                assert.equal('New_SCTP_Service_2', data.response.name);
                assert.equal('service-sctp', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('light green', data.response.color);
                assert.equal('Services/SCTPService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal(0, data.response['session-timeout']);
                assert.equal(true, data.response['use-default-session-timeout']);
                assert.equal(true, data.response['match-for-any']);
                assert.equal(true, data.response['sync-connections-on-cluster']);
                assert.equal('object', typeof data.response['aggressive-aging']);
                assert.equal('5656', data.response.port);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceSCTP', 'setServiceSctp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceSCTPShowServiceSctpBodyParam = {
      name: 'string'
    };
    describe('#showServiceSctp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showServiceSctp(serviceSCTPShowServiceSctpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('f04b754f-f190-4c79-afb1-d72821478d3a', data.response.uid);
                assert.equal('New_SCTP_Service_1', data.response.name);
                assert.equal('service-sctp', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(false, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Services/SCTPService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal(0, data.response['session-timeout']);
                assert.equal(true, data.response['use-default-session-timeout']);
                assert.equal(true, data.response['match-for-any']);
                assert.equal(true, data.response['sync-connections-on-cluster']);
                assert.equal('object', typeof data.response['aggressive-aging']);
                assert.equal('5669', data.response.port);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceSCTP', 'showServiceSctp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceSCTPShowServicesSctpBodyParam = {
      limit: 6,
      offset: 6,
      'details-level': 'string'
    };
    describe('#showServicesSctp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showServicesSctp(serviceSCTPShowServicesSctpBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(1, data.response.to);
                assert.equal(1, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceSCTP', 'showServicesSctp', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceOtherAddServiceOtherBodyParam = {
      name: 'string',
      'keep-connections-open-after-policy-installation': false,
      'session-timeout': 4,
      'match-for-any': false,
      'sync-connections-on-cluster': false,
      'ip-protocol': 2,
      'aggressive-aging': {
        enable: true,
        timeout: 360,
        'use-default-timeout': false
      }
    };
    describe('#addServiceOther - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addServiceOther(serviceOtherAddServiceOtherBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('42f2b86e-09ee-415c-a6ae-75556c6c70e0', data.response.uid);
                assert.equal('New_Service_1', data.response.name);
                assert.equal('service-other', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Services/OtherService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal(0, data.response['session-timeout']);
                assert.equal(true, data.response['use-default-session-timeout']);
                assert.equal(true, data.response['match-for-any']);
                assert.equal(true, data.response['sync-connections-on-cluster']);
                assert.equal('object', typeof data.response['aggressive-aging']);
                assert.equal(51, data.response['ip-protocol']);
                assert.equal(false, data.response['accept-replies']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceOther', 'addServiceOther', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceOtherDeleteServiceOtherBodyParam = {
      name: 'string'
    };
    describe('#deleteServiceOther - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.deleteServiceOther(serviceOtherDeleteServiceOtherBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceOther', 'deleteServiceOther', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceOtherSetServiceOtherBodyParam = {
      name: 'string',
      'new-name': 'string',
      color: 'string',
      'aggressive-aging': {
        'default-timeout': 3600
      }
    };
    describe('#setServiceOther - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setServiceOther(serviceOtherSetServiceOtherBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('25141d14-3e1d-447f-8bc7-a4fe862202be', data.response.uid);
                assert.equal('New_Service_3', data.response.name);
                assert.equal('service-other', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('light green', data.response.color);
                assert.equal('Services/OtherService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal(0, data.response['session-timeout']);
                assert.equal(true, data.response['use-default-session-timeout']);
                assert.equal(true, data.response['match-for-any']);
                assert.equal(true, data.response['sync-connections-on-cluster']);
                assert.equal('object', typeof data.response['aggressive-aging']);
                assert.equal(51, data.response['ip-protocol']);
                assert.equal(false, data.response['accept-replies']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceOther', 'setServiceOther', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceOtherShowServiceOtherBodyParam = {
      name: 'string'
    };
    describe('#showServiceOther - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showServiceOther(serviceOtherShowServiceOtherBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('25141d14-3e1d-447f-8bc7-a4fe862202be', data.response.uid);
                assert.equal('New_Service_1', data.response.name);
                assert.equal('service-other', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(false, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Services/OtherService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal(0, data.response['session-timeout']);
                assert.equal(true, data.response['use-default-session-timeout']);
                assert.equal(true, data.response['match-for-any']);
                assert.equal(true, data.response['sync-connections-on-cluster']);
                assert.equal('object', typeof data.response['aggressive-aging']);
                assert.equal(51, data.response['ip-protocol']);
                assert.equal(false, data.response['accept-replies']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceOther', 'showServiceOther', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceOtherShowServicesOtherBodyParam = {
      limit: 3,
      offset: 8,
      'details-level': 'string'
    };
    describe('#showServicesOther - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showServicesOther(serviceOtherShowServicesOtherBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(42, data.response.to);
                assert.equal(42, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceOther', 'showServicesOther', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceGroupAddServiceGroupBodyParam = {
      name: 'string',
      members: [
        'string'
      ]
    };
    describe('#addServiceGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addServiceGroup(serviceGroupAddServiceGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceGroup', 'addServiceGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceGroupDeleteServiceGroupBodyParam = {
      name: 'string'
    };
    describe('#deleteServiceGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteServiceGroup(serviceGroupDeleteServiceGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceGroup', 'deleteServiceGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceGroupSetServiceGroupBodyParam = {
      name: 'string',
      members: {
        add: 'New Host 2'
      }
    };
    describe('#setServiceGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setServiceGroup(serviceGroupSetServiceGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceGroup', 'setServiceGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceGroupShowServiceGroupBodyParam = {
      name: 'string'
    };
    describe('#showServiceGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showServiceGroup(serviceGroupShowServiceGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceGroup', 'showServiceGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceGroupShowServiceGroupsBodyParam = {
      limit: 9,
      offset: 3,
      'details-level': 'string'
    };
    describe('#showServiceGroups - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showServiceGroups(serviceGroupShowServiceGroupsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceGroup', 'showServiceGroups', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const applicationAddApplicationSiteBodyParam = {
      name: 'string',
      'primary-category': 'string',
      description: 'string',
      'additional-categories': [
        'string'
      ],
      'url-list': [
        'string'
      ],
      'urls-defined-as-regular-expression': false
    };
    describe('#addApplicationSite - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addApplicationSite(applicationAddApplicationSiteBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Application', 'addApplicationSite', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const applicationDeleteApplicationSiteBodyParam = {
      name: 'string'
    };
    describe('#deleteApplicationSite - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteApplicationSite(applicationDeleteApplicationSiteBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Application', 'deleteApplicationSite', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const applicationSetApplicationSiteBodyParam = {
      name: 'string',
      'new-name': 'string',
      'primary-category': 'string',
      description: 'string',
      'additional-categories': {
        remove: [
          'Instant Chat',
          'Supports Streaming'
        ]
      },
      'url-list': {
        add: 'www.download.com'
      },
      'urls-defined-as-regular-expression': false,
      groups: 'string'
    };
    describe('#setApplicationSite - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setApplicationSite(applicationSetApplicationSiteBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Application', 'setApplicationSite', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const applicationShowApplicationSiteBodyParam = {
      name: 'string'
    };
    describe('#showApplicationSite - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showApplicationSite(applicationShowApplicationSiteBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Application', 'showApplicationSite', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const applicationShowApplicationSitesBodyParam = {
      limit: 8,
      offset: 9,
      'details-level': 'string'
    };
    describe('#showApplicationSites - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showApplicationSites(applicationShowApplicationSitesBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Application', 'showApplicationSites', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const applicationCategoryAddApplicationSiteCategoryBodyParam = {
      name: 'string',
      description: 'string'
    };
    describe('#addApplicationSiteCategory - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addApplicationSiteCategory(applicationCategoryAddApplicationSiteCategoryBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ApplicationCategory', 'addApplicationSiteCategory', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const applicationCategoryDeleteApplicationSiteCategoryBodyParam = {
      name: 'string'
    };
    describe('#deleteApplicationSiteCategory - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteApplicationSiteCategory(applicationCategoryDeleteApplicationSiteCategoryBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ApplicationCategory', 'deleteApplicationSiteCategory', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const applicationCategorySetApplicationSiteCategoryBodyParam = {
      name: 'string',
      'new-name': 'string',
      description: 'string',
      groups: 'string'
    };
    describe('#setApplicationSiteCategory - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setApplicationSiteCategory(applicationCategorySetApplicationSiteCategoryBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ApplicationCategory', 'setApplicationSiteCategory', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const applicationCategoryShowApplicationSiteCategoriesBodyParam = {
      limit: 10,
      offset: 5,
      'details-level': 'string'
    };
    describe('#showApplicationSiteCategories - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showApplicationSiteCategories(applicationCategoryShowApplicationSiteCategoriesBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ApplicationCategory', 'showApplicationSiteCategories', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const applicationCategoryShowApplicationSiteCategoryBodyParam = {
      name: 'string'
    };
    describe('#showApplicationSiteCategory - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showApplicationSiteCategory(applicationCategoryShowApplicationSiteCategoryBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ApplicationCategory', 'showApplicationSiteCategory', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const applicationGroupAddApplicationSiteGroupBodyParam = {
      name: 'string',
      members: [
        'string'
      ]
    };
    describe('#addApplicationSiteGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addApplicationSiteGroup(applicationGroupAddApplicationSiteGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ApplicationGroup', 'addApplicationSiteGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const applicationGroupDeleteApplicationSiteGroupBodyParam = {
      name: 'string'
    };
    describe('#deleteApplicationSiteGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteApplicationSiteGroup(applicationGroupDeleteApplicationSiteGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ApplicationGroup', 'deleteApplicationSiteGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const applicationGroupSetApplicationSiteGroupBodyParam = {
      name: 'string',
      members: {
        add: 'New Host 2'
      },
      groups: 'string'
    };
    describe('#setApplicationSiteGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setApplicationSiteGroup(applicationGroupSetApplicationSiteGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ApplicationGroup', 'setApplicationSiteGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const applicationGroupShowApplicationSiteGroupBodyParam = {
      name: 'string'
    };
    describe('#showApplicationSiteGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showApplicationSiteGroup(applicationGroupShowApplicationSiteGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ApplicationGroup', 'showApplicationSiteGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const applicationGroupShowApplicationSiteGroupsBodyParam = {
      limit: 4,
      offset: 3,
      'details-level': 'string'
    };
    describe('#showApplicationSiteGroups - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showApplicationSiteGroups(applicationGroupShowApplicationSiteGroupsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ApplicationGroup', 'showApplicationSiteGroups', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceDCERPCAddServiceDceRpcBodyParam = {
      name: 'string',
      'interface-uuid': 'string',
      'keep-connections-open-after-policy-installation': true
    };
    describe('#addServiceDceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addServiceDceRpc(serviceDCERPCAddServiceDceRpcBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('b02db15d-c8e9-408c-a789-095b6d76db02', data.response.uid);
                assert.equal('New_DCE-RPC_Service_1', data.response.name);
                assert.equal('service-dce-rpc', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Services/DCEService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal('97aeb460-9aea-11d5-bd16-0090272ccb30', data.response['interface-uuid']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceDCERPC', 'addServiceDceRpc', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceDCERPCDeleteServiceDceRpcBodyParam = {
      name: 'string'
    };
    describe('#deleteServiceDceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.deleteServiceDceRpc(serviceDCERPCDeleteServiceDceRpcBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceDCERPC', 'deleteServiceDceRpc', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceDCERPCSetServiceDceRpcBodyParam = {
      name: 'string',
      'new-name': 'string',
      color: 'string',
      'interface-uuid': 'string'
    };
    describe('#setServiceDceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setServiceDceRpc(serviceDCERPCSetServiceDceRpcBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('b0a07e2a-87d9-4ded-a17b-e83d61611f64', data.response.uid);
                assert.equal('New_DCE-RPC_Service_3', data.response.name);
                assert.equal('service-dce-rpc', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('', data.response.comments);
                assert.equal('green', data.response.color);
                assert.equal('Services/DCEService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal('44aeb460-9aea-11d5-bd16-009027266b30', data.response['interface-uuid']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceDCERPC', 'setServiceDceRpc', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceDCERPCShowServiceDceRpcBodyParam = {
      name: 'string'
    };
    describe('#showServiceDceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showServiceDceRpc(serviceDCERPCShowServiceDceRpcBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('97aeb460-9aea-11d5-bd16-0090272ccb30', data.response.uid);
                assert.equal('HP-OpCdistm', data.response.name);
                assert.equal('service-dce-rpc', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('HP-OV OpC Distribution Manager', data.response.comments);
                assert.equal('blue', data.response.color);
                assert.equal('Services/DCEService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal('5df3dc6f-a568-0000-020f-887805000000', data.response['interface-uuid']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceDCERPC', 'showServiceDceRpc', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceDCERPCShowServicesDceRpcBodyParam = {
      limit: 1,
      offset: 1,
      'details-level': 'string'
    };
    describe('#showServicesDceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showServicesDceRpc(serviceDCERPCShowServicesDceRpcBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(42, data.response.to);
                assert.equal(42, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceDCERPC', 'showServicesDceRpc', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceRPCAddServiceRpcBodyParam = {
      name: 'string',
      'program-number': 6,
      'keep-connections-open-after-policy-installation': false
    };
    describe('#addServiceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addServiceRpc(serviceRPCAddServiceRpcBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('Validation failed with 1 error', data.response.message);
                assert.equal('generic_error', data.response.code);
                assert.equal(true, Array.isArray(data.response.errors));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceRPC', 'addServiceRpc', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceRPCDeleteServiceRpcBodyParam = {
      name: 'string'
    };
    describe('#deleteServiceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.deleteServiceRpc(serviceRPCDeleteServiceRpcBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('OK', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceRPC', 'deleteServiceRpc', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceRPCSetServiceRpcBodyParam = {
      name: 'string',
      'new-name': 'string',
      color: 'string',
      'program-number': 1
    };
    describe('#setServiceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setServiceRpc(serviceRPCSetServiceRpcBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('55023213-9bdd-4f7c-9a41-342938de74ba', data.response.uid);
                assert.equal('New_RPC_Service_5', data.response.name);
                assert.equal('service-rpc', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('', data.response.comments);
                assert.equal('green', data.response.color);
                assert.equal('Services/RPCService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal(5656, data.response['program-number']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceRPC', 'setServiceRpc', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceRPCShowServiceRpcBodyParam = {
      name: 'string'
    };
    describe('#showServiceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showServiceRpc(serviceRPCShowServiceRpcBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('97aeb3c6-9aea-11d5-bd16-0090272ccb30', data.response.uid);
                assert.equal('nisplus', data.response.name);
                assert.equal('service-rpc', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('NIS+ later version provides additional security and other facilities', data.response.comments);
                assert.equal('navy blue', data.response.color);
                assert.equal('Services/RPCService', data.response.icon);
                assert.equal(true, Array.isArray(data.response.groups));
                assert.equal(false, data.response['keep-connections-open-after-policy-installation']);
                assert.equal(100300, data.response['program-number']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceRPC', 'showServiceRpc', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const serviceRPCShowServicesRpcBodyParam = {
      limit: 2,
      offset: 9,
      'details-level': 'string'
    };
    describe('#showServicesRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showServicesRpc(serviceRPCShowServicesRpcBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(19, data.response.to);
                assert.equal(19, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ServiceRPC', 'showServicesRpc', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessRuleAddAccessRuleBodyParam = {
      layer: 'string',
      position: 10,
      name: 'string',
      service: [
        'string'
      ],
      vpn: 'string'
    };
    describe('#addAccessRule - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addAccessRule(accessRuleAddAccessRuleBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('1df8a4b0-fa8b-428b-b649-626b74bf7f81', data.response.uid);
                assert.equal('Rule 1', data.response.name);
                assert.equal('access-rule', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal(true, data.response.enabled);
                assert.equal('', data.response.comments);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response['install-on']));
                assert.equal(true, Array.isArray(data.response.source));
                assert.equal(false, data.response['source-negate']);
                assert.equal(true, Array.isArray(data.response.destination));
                assert.equal(false, data.response['destination-negate']);
                assert.equal(true, Array.isArray(data.response.service));
                assert.equal(false, data.response['service-negate']);
                assert.equal(true, Array.isArray(data.response.vpn));
                assert.equal('object', typeof data.response.action);
                assert.equal('object', typeof data.response['action-settings']);
                assert.equal(true, Array.isArray(data.response.content));
                assert.equal(false, data.response['content-negate']);
                assert.equal('any', data.response['content-direction']);
                assert.equal('object', typeof data.response.track);
                assert.equal('none', data.response['track-alert']);
                assert.equal(true, Array.isArray(data.response.time));
                assert.equal('object', typeof data.response['custom-fields']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessRule', 'addAccessRule', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessRuleDeleteAccessRuleBodyParam = {
      name: 'string',
      layer: 'string'
    };
    describe('#deleteAccessRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteAccessRule(accessRuleDeleteAccessRuleBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessRule', 'deleteAccessRule', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessRuleSetAccessRuleBodyParam = {
      name: 'string',
      layer: 'string',
      action: 'string',
      'action-settings': {
        'enable-identity-captive-portal': true,
        limit: 'Upload_1Gbps'
      }
    };
    describe('#setAccessRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setAccessRule(accessRuleSetAccessRuleBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessRule', 'setAccessRule', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessRuleShowAccessRuleBodyParam = {
      name: 'string',
      layer: 'string'
    };
    describe('#showAccessRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showAccessRule(accessRuleShowAccessRuleBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessRule', 'showAccessRule', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessRuleShowAccessRulebaseBodyParam = {
      offset: 2,
      limit: 3,
      name: 'string',
      'details-level': 'string',
      'use-object-dictionary': true
    };
    describe('#showAccessRulebase - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showAccessRulebase(accessRuleShowAccessRulebaseBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(4, data.response.from);
                assert.equal(5, data.response.to);
                assert.equal(1, data.response.total);
                assert.equal('string', data.response.name);
                assert.equal('string', data.response.uid);
                assert.equal(true, Array.isArray(data.response.rulebase));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessRule', 'showAccessRulebase', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessSectionAddAccessSectionBodyParam = {
      layer: 'string',
      position: 10,
      name: 'string'
    };
    describe('#addAccessSection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addAccessSection(accessSectionAddAccessSectionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessSection', 'addAccessSection', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessSectionDeleteAccessSectionBodyParam = {
      layer: 'string',
      name: 'string'
    };
    describe('#deleteAccessSection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteAccessSection(accessSectionDeleteAccessSectionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessSection', 'deleteAccessSection', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessSectionSetAccessSectionBodyParam = {
      layer: 'string',
      name: 'string',
      'new-name': 'string'
    };
    describe('#setAccessSection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setAccessSection(accessSectionSetAccessSectionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessSection', 'setAccessSection', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessSectionShowAccessSectionBodyParam = {
      layer: 'string',
      name: 'string'
    };
    describe('#showAccessSection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showAccessSection(accessSectionShowAccessSectionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessSection', 'showAccessSection', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessLayerAddAccessLayerBodyParam = {
      name: 'string'
    };
    describe('#addAccessLayer - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addAccessLayer(accessLayerAddAccessLayerBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('81530aad-bc98-4e8f-a62d-079424ddd955', data.response.uid);
                assert.equal('object', typeof data.response.folder);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('New Layer 1', data.response.name);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('ApplicationFirewall/rulebase', data.response.icon);
                assert.equal(false, data.response['applications-and-url-filtering']);
                assert.equal(false, data.response['content-awareness']);
                assert.equal(false, data.response['mobile-access']);
                assert.equal(true, data.response['show-parent-rule']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessLayer', 'addAccessLayer', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessLayerDeleteAccessLayerBodyParam = {
      name: 'string'
    };
    describe('#deleteAccessLayer - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteAccessLayer(accessLayerDeleteAccessLayerBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessLayer', 'deleteAccessLayer', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessLayerSetAccessLayerBodyParam = {
      name: 'string',
      'new-name': 'string',
      'applications-and-url-filtering': true,
      'data-awareness': false
    };
    describe('#setAccessLayer - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setAccessLayer(accessLayerSetAccessLayerBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('81530aad-bc98-4e8f-a62d-079424ddd955', data.response.uid);
                assert.equal('object', typeof data.response.folder);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('New Layer 2', data.response.name);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('ApplicationFirewall/rulebase', data.response.icon);
                assert.equal(false, data.response['applications-and-url-filtering']);
                assert.equal(true, data.response['content-awareness']);
                assert.equal(false, data.response['mobile-access']);
                assert.equal(false, data.response['show-parent-rule']);
                assert.equal(true, data.response['detect-using-x-forward-for']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessLayer', 'setAccessLayer', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessLayerShowAccessLayerBodyParam = {
      name: 'string'
    };
    describe('#showAccessLayer - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showAccessLayer(accessLayerShowAccessLayerBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessLayer', 'showAccessLayer', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const accessLayerShowAccessLayersBodyParam = {
      limit: 7,
      offset: 3,
      'details-level': 'string'
    };
    describe('#showAccessLayers - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showAccessLayers(accessLayerShowAccessLayersBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('AccessLayer', 'showAccessLayers', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const nATRuleAddNatRuleBodyParam = {
      package: 'string',
      position: 4,
      comments: 'string',
      enabled: false,
      'install-on': [
        'string'
      ],
      'original-source': 'string',
      'original-destination': 'string'
    };
    describe('#addNatRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addNatRule(nATRuleAddNatRuleBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('NATRule', 'addNatRule', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const nATRuleDeleteNatRuleBodyParam = {
      'rule-number': 6,
      package: 'string'
    };
    describe('#deleteNatRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteNatRule(nATRuleDeleteNatRuleBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('NATRule', 'deleteNatRule', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const nATRuleSetNatRuleBodyParam = {
      'rule-number': 7,
      package: 'string',
      enabled: true,
      'original-service': 'string',
      'original-source': 'string',
      comments: 'string'
    };
    describe('#setNatRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setNatRule(nATRuleSetNatRuleBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('NATRule', 'setNatRule', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const nATRuleShowNatRuleBodyParam = {
      'rule-number': 10,
      package: 'string'
    };
    describe('#showNatRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showNatRule(nATRuleShowNatRuleBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('NATRule', 'showNatRule', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const nATRuleShowNatRulebaseBodyParam = {
      offset: 6,
      limit: 2,
      'details-level': 'string',
      'use-object-dictionary': false,
      package: 'string'
    };
    describe('#showNatRulebase - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showNatRulebase(nATRuleShowNatRulebaseBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(4, data.response.to);
                assert.equal(4, data.response.total);
                assert.equal('17dd4fab-1940-4760-9a93-9dba4fca9265', data.response.uid);
                assert.equal(true, Array.isArray(data.response.rulebase));
                assert.equal(true, Array.isArray(data.response['objects-dictionary']));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('NATRule', 'showNatRulebase', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const nATSectionAddNatSectionBodyParam = {
      package: 'string',
      name: 'string',
      position: 5
    };
    describe('#addNatSection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addNatSection(nATSectionAddNatSectionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('NATSection', 'addNatSection', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const nATSectionDeleteNatSectionBodyParam = {
      package: 'string',
      name: 'string'
    };
    describe('#deleteNatSection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteNatSection(nATSectionDeleteNatSectionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('NATSection', 'deleteNatSection', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const nATSectionSetNatSectionBodyParam = {
      package: 'string',
      name: 'string',
      'new-name': 'string'
    };
    describe('#setNatSection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setNatSection(nATSectionSetNatSectionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('NATSection', 'setNatSection', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const nATSectionShowNatSectionBodyParam = {
      package: 'string',
      name: 'string'
    };
    describe('#showNatSection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showNatSection(nATSectionShowNatSectionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('NATSection', 'showNatSection', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const vPNCommunityMeshedAddVpnCommunityMeshedBodyParam = {
      name: 'string',
      'encryption-method': 'string',
      'encryption-suite': 'string',
      'ike-phase-1': {
        'data-integrity': 'sha1',
        'encryption-algorithm': 'aes-128',
        'diffie-hellman-group': 'group 19'
      },
      'ike-phase-2': {
        'data-integrity': 'aes-xcbc',
        'encryption-algorithm': 'aes-gcm-128'
      }
    };
    describe('#addVpnCommunityMeshed - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addVpnCommunityMeshed(vPNCommunityMeshedAddVpnCommunityMeshedBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('283a3c73-0760-4876-8907-f8b4a14c0d76', data.response.uid);
                assert.equal('New_VPN_Community_Meshed_1', data.response.name);
                assert.equal('vpn-community-meshed', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('VPNCommunities/Meshed', data.response.icon);
                assert.equal(false, data.response['use-shared-secret']);
                assert.equal('prefer ikev2 but support ikev1', data.response['encryption-method']);
                assert.equal('custom', data.response['encryption-suite']);
                assert.equal('object', typeof data.response['ike-phase-1']);
                assert.equal('object', typeof data.response['ike-phase-2']);
                assert.equal(true, Array.isArray(data.response.gateways));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('VPNCommunityMeshed', 'addVpnCommunityMeshed', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const vPNCommunityMeshedDeleteVpnCommunityMeshedBodyParam = {
      name: 'string'
    };
    describe('#deleteVpnCommunityMeshed - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteVpnCommunityMeshed(vPNCommunityMeshedDeleteVpnCommunityMeshedBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('VPNCommunityMeshed', 'deleteVpnCommunityMeshed', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const vPNCommunityMeshedSetVpnCommunityMeshedBodyParam = {
      name: 'string',
      'encryption-method': 'string',
      'encryption-suite': 'string',
      'ike-phase-1': {
        'data-integrity': 'sha1',
        'encryption-algorithm': 'aes-128',
        'diffie-hellman-group': 'group 19'
      },
      'ike-phase-2': {
        'data-integrity': 'aes-xcbc',
        'encryption-algorithm': 'aes-gcm-128'
      }
    };
    describe('#setVpnCommunityMeshed - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setVpnCommunityMeshed(vPNCommunityMeshedSetVpnCommunityMeshedBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('283a3c73-0760-4876-8907-f8b4a14c0d76', data.response.uid);
                assert.equal('New_VPN_Community_Meshed_1', data.response.name);
                assert.equal('vpn-community-meshed', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('VPNCommunities/Meshed', data.response.icon);
                assert.equal(false, data.response['use-shared-secret']);
                assert.equal('ikev2 only', data.response['encryption-method']);
                assert.equal('custom', data.response['encryption-suite']);
                assert.equal('object', typeof data.response['ike-phase-1']);
                assert.equal('object', typeof data.response['ike-phase-2']);
                assert.equal(true, Array.isArray(data.response.gateways));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('VPNCommunityMeshed', 'setVpnCommunityMeshed', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const vPNCommunityMeshedShowVpnCommunitiesMeshedBodyParam = {
      limit: 9,
      offset: 1,
      'details-level': 'string'
    };
    describe('#showVpnCommunitiesMeshed - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showVpnCommunitiesMeshed(vPNCommunityMeshedShowVpnCommunitiesMeshedBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(2, data.response.to);
                assert.equal(2, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('VPNCommunityMeshed', 'showVpnCommunitiesMeshed', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const vPNCommunityMeshedShowVpnCommunityMeshedBodyParam = {
      name: 'string'
    };
    describe('#showVpnCommunityMeshed - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showVpnCommunityMeshed(vPNCommunityMeshedShowVpnCommunityMeshedBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('283a3c73-0760-4876-8907-f8b4a14c0d76', data.response.uid);
                assert.equal('New_VPN_Community_Meshed_1', data.response.name);
                assert.equal('vpn-community-meshed', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(false, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('VPNCommunities/Meshed', data.response.icon);
                assert.equal(false, data.response['use-shared-secret']);
                assert.equal('ikev2 only', data.response['encryption-method']);
                assert.equal('custom', data.response['encryption-suite']);
                assert.equal('object', typeof data.response['ike-phase-1']);
                assert.equal('object', typeof data.response['ike-phase-2']);
                assert.equal(true, Array.isArray(data.response.gateways));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('VPNCommunityMeshed', 'showVpnCommunityMeshed', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const vPNCommunityStarAddVpnCommunityStarBodyParam = {
      name: 'string',
      'center-gateways': 'string',
      'encryption-method': 'string',
      'encryption-suite': 'string',
      'ike-phase-1': {
        'data-integrity': 'sha1',
        'encryption-algorithm': 'aes-128',
        'diffie-hellman-group': 'group 19'
      },
      'ike-phase-2': {
        'data-integrity': 'aes-xcbc',
        'encryption-algorithm': 'aes-gcm-128'
      }
    };
    describe('#addVpnCommunityStar - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addVpnCommunityStar(vPNCommunityStarAddVpnCommunityStarBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('a8c25199-7893-45d7-800d-57a2c18a3c7c', data.response.uid);
                assert.equal('New_VPN_Community_Star_1', data.response.name);
                assert.equal('vpn-community-star', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('VPNCommunities/Star', data.response.icon);
                assert.equal(false, data.response['use-shared-secret']);
                assert.equal('prefer ikev2 but support ikev1', data.response['encryption-method']);
                assert.equal('custom', data.response['encryption-suite']);
                assert.equal('object', typeof data.response['ike-phase-1']);
                assert.equal('object', typeof data.response['ike-phase-2']);
                assert.equal(true, Array.isArray(data.response['center-gateways']));
                assert.equal(true, Array.isArray(data.response['satellite-gateways']));
                assert.equal(false, data.response['mesh-center-gateways']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('VPNCommunityStar', 'addVpnCommunityStar', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const vPNCommunityStarDeleteVpnCommunityStarBodyParam = {
      name: 'string'
    };
    describe('#deleteVpnCommunityStar - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteVpnCommunityStar(vPNCommunityStarDeleteVpnCommunityStarBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('VPNCommunityStar', 'deleteVpnCommunityStar', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const vPNCommunityStarSetVpnCommunityStarBodyParam = {
      name: 'string',
      'encryption-method': 'string',
      'encryption-suite': 'string',
      'ike-phase-1': {
        'data-integrity': 'sha1',
        'encryption-algorithm': 'aes-128',
        'diffie-hellman-group': 'group 19'
      },
      'ike-phase-2': {
        'data-integrity': 'aes-xcbc',
        'encryption-algorithm': 'aes-gcm-128'
      }
    };
    describe('#setVpnCommunityStar - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setVpnCommunityStar(vPNCommunityStarSetVpnCommunityStarBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('a8c25199-7893-45d7-800d-57a2c18a3c7c', data.response.uid);
                assert.equal('New_VPN_Community_Star_1', data.response.name);
                assert.equal('vpn-community-star', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(true, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('VPNCommunities/Star', data.response.icon);
                assert.equal(false, data.response['use-shared-secret']);
                assert.equal('ikev2 only', data.response['encryption-method']);
                assert.equal('custom', data.response['encryption-suite']);
                assert.equal('object', typeof data.response['ike-phase-1']);
                assert.equal('object', typeof data.response['ike-phase-2']);
                assert.equal(true, Array.isArray(data.response['center-gateways']));
                assert.equal(true, Array.isArray(data.response['satellite-gateways']));
                assert.equal(false, data.response['mesh-center-gateways']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('VPNCommunityStar', 'setVpnCommunityStar', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const vPNCommunityStarShowVpnCommunitiesStarBodyParam = {
      limit: 1,
      offset: 7,
      'details-level': 'string'
    };
    describe('#showVpnCommunitiesStar - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showVpnCommunitiesStar(vPNCommunityStarShowVpnCommunitiesStarBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(2, data.response.to);
                assert.equal(2, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('VPNCommunityStar', 'showVpnCommunitiesStar', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const vPNCommunityStarShowVpnCommunityStarBodyParam = {
      name: 'string'
    };
    describe('#showVpnCommunityStar - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showVpnCommunityStar(vPNCommunityStarShowVpnCommunityStarBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('a8c25199-7893-45d7-800d-57a2c18a3c7c', data.response.uid);
                assert.equal('New_VPN_Community_Star_1', data.response.name);
                assert.equal('vpn-community-star', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(false, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('VPNCommunities/Star', data.response.icon);
                assert.equal(false, data.response['use-shared-secret']);
                assert.equal('ikev2 only', data.response['encryption-method']);
                assert.equal('custom', data.response['encryption-suite']);
                assert.equal('object', typeof data.response['ike-phase-1']);
                assert.equal('object', typeof data.response['ike-phase-2']);
                assert.equal(true, Array.isArray(data.response['center-gateways']));
                assert.equal(true, Array.isArray(data.response['satellite-gateways']));
                assert.equal(false, data.response['mesh-center-gateways']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('VPNCommunityStar', 'showVpnCommunityStar', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatRuleAddThreatRuleBodyParam = {
      layer: 'string',
      position: 'string',
      name: 'string',
      comments: 'string',
      track: 'string',
      'protected-scope': 'string',
      'install-on': 'string'
    };
    describe('#addThreatRule - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addThreatRule(threatRuleAddThreatRuleBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('30c77c86-42ca-401a-a550-b5e49f5b1fff', data.response.uid);
                assert.equal(true, data.response.enabled);
                assert.equal('', data.response.comments);
                assert.equal('object', typeof data.response.folder);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response['install-on']));
                assert.equal(true, Array.isArray(data.response.source));
                assert.equal(false, data.response['source-negate']);
                assert.equal(true, Array.isArray(data.response.destination));
                assert.equal(false, data.response['destination-negate']);
                assert.equal(true, Array.isArray(data.response.service));
                assert.equal(false, data.response['service-negate']);
                assert.equal(true, Array.isArray(data.response['protected-scope']));
                assert.equal(false, data.response['protected-scope-negate']);
                assert.equal('First threat rule', data.response.name);
                assert.equal('object', typeof data.response.track);
                assert.equal('object', typeof data.response['track-settings']);
                assert.equal('object', typeof data.response.action);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatRule', 'addThreatRule', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatRuleDeleteThreatRuleBodyParam = {
      'rule-number': 9,
      layer: 'string'
    };
    describe('#deleteThreatRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteThreatRule(threatRuleDeleteThreatRuleBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatRule', 'deleteThreatRule', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatRuleSetThreatRuleBodyParam = {
      'rule-number': 4,
      layer: 'string',
      comments: 'string',
      'protected-scope': 'string',
      action: 'string',
      'install-on': 'string'
    };
    describe('#setThreatRule - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setThreatRule(threatRuleSetThreatRuleBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('8c929c98-8e69-4dcd-a4aa-208b72ac5cd0', data.response.uid);
                assert.equal(true, data.response.enabled);
                assert.equal('commnet for the first rule', data.response.comments);
                assert.equal('object', typeof data.response.folder);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response['install-on']));
                assert.equal(true, Array.isArray(data.response.source));
                assert.equal(false, data.response['source-negate']);
                assert.equal(true, Array.isArray(data.response.destination));
                assert.equal(false, data.response['destination-negate']);
                assert.equal(true, Array.isArray(data.response.service));
                assert.equal(false, data.response['service-negate']);
                assert.equal(true, Array.isArray(data.response['protected-scope']));
                assert.equal(false, data.response['protected-scope-negate']);
                assert.equal('First threat rule', data.response.name);
                assert.equal('object', typeof data.response.track);
                assert.equal('object', typeof data.response['track-settings']);
                assert.equal('object', typeof data.response.action);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatRule', 'setThreatRule', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatRuleShowThreatRuleBodyParam = {
      'rule-number': 9,
      layer: 'string'
    };
    describe('#showThreatRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showThreatRule(threatRuleShowThreatRuleBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatRule', 'showThreatRule', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatRuleShowThreatRulebaseBodyParam = {
      name: 'string',
      offset: 2,
      limit: 7,
      'details-level': 'string',
      'use-object-dictionary': true,
      filter: 'string'
    };
    describe('#showThreatRulebase - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showThreatRulebase(threatRuleShowThreatRulebaseBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(4, data.response.from);
                assert.equal(5, data.response.to);
                assert.equal(6, data.response.total);
                assert.equal('string', data.response.name);
                assert.equal('string', data.response.uid);
                assert.equal(true, Array.isArray(data.response.rulebase));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatRule', 'showThreatRulebase', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatExceptionAddThreatExceptionBodyParam = {
      layer: 'string',
      'rule-number': 1,
      position: 6,
      name: 'string',
      track: 'string',
      'protected-scope': 'string',
      'protection-or-site': 'string'
    };
    describe('#addThreatException - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addThreatException(threatExceptionAddThreatExceptionBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('73905761-34f2-44f2-9797-d89e4663b806', data.response.uid);
                assert.equal(true, data.response.enabled);
                assert.equal('', data.response.comments);
                assert.equal('object', typeof data.response.folder);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response['install-on']));
                assert.equal(true, Array.isArray(data.response.source));
                assert.equal(false, data.response['source-negate']);
                assert.equal(true, Array.isArray(data.response.destination));
                assert.equal(false, data.response['destination-negate']);
                assert.equal(true, Array.isArray(data.response.service));
                assert.equal(false, data.response['service-negate']);
                assert.equal(true, Array.isArray(data.response['protected-scope']));
                assert.equal(false, data.response['protected-scope-negate']);
                assert.equal(true, Array.isArray(data.response['protection-or-site']));
                assert.equal('Exception Rule', data.response.name);
                assert.equal('object', typeof data.response.track);
                assert.equal('object', typeof data.response.action);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatException', 'addThreatException', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatExceptionDeleteThreatExceptionBodyParam = {
      'rule-number': 1,
      'exception-number': 8,
      layer: 'string'
    };
    describe('#deleteThreatException - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteThreatException(threatExceptionDeleteThreatExceptionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatException', 'deleteThreatException', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatExceptionSetThreatExceptionBodyParam = {
      name: 'string',
      layer: 'string',
      'rule-number': 4,
      'new-name': 'string'
    };
    describe('#setThreatException - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setThreatException(threatExceptionSetThreatExceptionBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('7893c79b-4e9f-4ef8-a647-e7ad8be7607d', data.response.uid);
                assert.equal(true, data.response.enabled);
                assert.equal('', data.response.comments);
                assert.equal('object', typeof data.response.folder);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response['install-on']));
                assert.equal(true, Array.isArray(data.response.source));
                assert.equal(false, data.response['source-negate']);
                assert.equal(true, Array.isArray(data.response.destination));
                assert.equal(false, data.response['destination-negate']);
                assert.equal(true, Array.isArray(data.response.service));
                assert.equal(false, data.response['service-negate']);
                assert.equal(true, Array.isArray(data.response['protected-scope']));
                assert.equal(false, data.response['protected-scope-negate']);
                assert.equal(true, Array.isArray(data.response['protection-or-site']));
                assert.equal('Last rule', data.response.name);
                assert.equal('object', typeof data.response.track);
                assert.equal('object', typeof data.response.action);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatException', 'setThreatException', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatExceptionShowThreatExceptionBodyParam = {
      'rule-number': 2,
      'exception-number': 8,
      layer: 'string'
    };
    describe('#showThreatException - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showThreatException(threatExceptionShowThreatExceptionBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('7893c79b-4e9f-4ef8-a647-e7ad8be7607d', data.response.uid);
                assert.equal(true, data.response.enabled);
                assert.equal('', data.response.comments);
                assert.equal('object', typeof data.response.folder);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response['install-on']));
                assert.equal(true, Array.isArray(data.response.source));
                assert.equal(false, data.response['source-negate']);
                assert.equal(true, Array.isArray(data.response.destination));
                assert.equal(false, data.response['destination-negate']);
                assert.equal(true, Array.isArray(data.response.service));
                assert.equal(false, data.response['service-negate']);
                assert.equal(true, Array.isArray(data.response['protected-scope']));
                assert.equal(false, data.response['protected-scope-negate']);
                assert.equal(true, Array.isArray(data.response['protection-or-site']));
                assert.equal('Exception Rule', data.response.name);
                assert.equal('object', typeof data.response.track);
                assert.equal('object', typeof data.response.action);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatException', 'showThreatException', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatExceptionShowThreatRuleExceptionRulebaseBodyParam = {
      name: 'string',
      'rule-number': 9
    };
    describe('#showThreatRuleExceptionRulebase - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showThreatRuleExceptionRulebase(threatExceptionShowThreatRuleExceptionRulebaseBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('36d13425-3be6-427f-a7bd-7ddec5248cc1', data.response.uid);
                assert.equal('ThreatStandardSubRulebase', data.response.name);
                assert.equal(true, Array.isArray(data.response.rulebase));
                assert.equal(0, data.response.total);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatException', 'showThreatRuleExceptionRulebase', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatExceptionGroupAddExceptionGroupBodyParam = {
      name: 'string'
    };
    describe('#addExceptionGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addExceptionGroup(threatExceptionGroupAddExceptionGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatExceptionGroup', 'addExceptionGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatExceptionGroupDeleteExceptionGroupBodyParam = {
      name: 'string'
    };
    describe('#deleteExceptionGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteExceptionGroup(threatExceptionGroupDeleteExceptionGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatExceptionGroup', 'deleteExceptionGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatExceptionGroupSetExceptionGroupBodyParam = {
      name: 'string',
      'new-name': 'string',
      tags: 'string'
    };
    describe('#setExceptionGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setExceptionGroup(threatExceptionGroupSetExceptionGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatExceptionGroup', 'setExceptionGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatExceptionGroupShowExceptionGroupBodyParam = {
      name: 'string'
    };
    describe('#showExceptionGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showExceptionGroup(threatExceptionGroupShowExceptionGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatExceptionGroup', 'showExceptionGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatExceptionGroupShowExceptionGroupsBodyParam = {
      limit: 3,
      offset: 10,
      'details-level': 'string'
    };
    describe('#showExceptionGroups - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showExceptionGroups(threatExceptionGroupShowExceptionGroupsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatExceptionGroup', 'showExceptionGroups', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatProtectionAddThreatProtectionsBodyParam = {
      'package-path': 'string',
      'package-format': 'string'
    };
    describe('#addThreatProtections - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addThreatProtections(threatProtectionAddThreatProtectionsBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('6b2e5c77-0622-4e7f-a9bf-4e1f21899553', data.response['task-id']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatProtection', 'addThreatProtections', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatProtectionDeleteThreatProtectionsBodyParam = {
      'package-format': 'string'
    };
    describe('#deleteThreatProtections - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteThreatProtections(threatProtectionDeleteThreatProtectionsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatProtection', 'deleteThreatProtections', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatProtectionSetThreatProtectionBodyParam = {
      name: 'string',
      overrides: [
        {
          profile: 'New Profile 1',
          action: 'inactive',
          track: 'None',
          'capture-packets': true
        }
      ]
    };
    describe('#setThreatProtection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setThreatProtection(threatProtectionSetThreatProtectionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatProtection', 'setThreatProtection', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatProtectionShowThreatProtectionBodyParam = {
      name: 'string'
    };
    describe('#showThreatProtection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showThreatProtection(threatProtectionShowThreatProtectionBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatProtection', 'showThreatProtection', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatProtectionShowThreatProtectionsBodyParam = {
      limit: 3,
      offset: 8,
      'details-level': 'string'
    };
    describe('#showThreatProtections - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showThreatProtections(threatProtectionShowThreatProtectionsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatProtection', 'showThreatProtections', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatProfileAddThreatProfileBodyParam = {
      name: 'string',
      'active-protections-performance-impact': 'string',
      'active-protections-severity': 'string',
      'confidence-level-medium': 'string',
      'confidence-level-high': 'string',
      'threat-emulation': true,
      'anti-virus': true,
      'anti-bot': false,
      ips: true,
      'ips-settings': {
        'newly-updated-protections': 'staging',
        'exclude-protection-with-performance-impact': true,
        'exclude-protection-with-performance-impact-mode': 'high or lower'
      }
    };
    describe('#addThreatProfile - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addThreatProfile(threatProfileAddThreatProfileBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatProfile', 'addThreatProfile', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatProfileDeleteThreatProfileBodyParam = {
      name: 'string'
    };
    describe('#deleteThreatProfile - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteThreatProfile(threatProfileDeleteThreatProfileBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatProfile', 'deleteThreatProfile', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatProfileSetThreatProfileBodyParam = {
      name: 'string',
      'new-name': 'string',
      comments: 'string',
      'active-protections-performance-impact': 'string',
      'active-protections-severity': 'string',
      'confidence-level-low': 'string',
      'confidence-level-medium': 'string',
      'confidence-level-high': 'string',
      'threat-emulation': true,
      'anti-virus': true,
      'anti-bot': false,
      ips: false,
      'ips-settings': {
        'newly-updated-protections': 'staging',
        'exclude-protection-with-performance-impact': true,
        'exclude-protection-with-performance-impact-mode': 'high or lower'
      }
    };
    describe('#setThreatProfile - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setThreatProfile(threatProfileSetThreatProfileBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatProfile', 'setThreatProfile', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatProfileShowThreatProfileBodyParam = {
      name: 'string'
    };
    describe('#showThreatProfile - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showThreatProfile(threatProfileShowThreatProfileBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatProfile', 'showThreatProfile', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatProfileShowThreatProfilesBodyParam = {
      limit: 6,
      offset: 6,
      'details-level': 'string'
    };
    describe('#showThreatProfiles - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showThreatProfiles(threatProfileShowThreatProfilesBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatProfile', 'showThreatProfiles', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatIndicatorAddThreatIndicatorBodyParam = {
      name: 'string',
      observables: [
        {
          name: 'My_Observable',
          'mail-to': 'someone@somewhere.com',
          confidence: 'medium',
          severity: 'low',
          product: 'AV'
        }
      ],
      action: 'string',
      'profile-overrides': [
        {
          profile: 'My_Profile',
          action: 'detect'
        }
      ],
      'ignore-warnings': true
    };
    describe('#addThreatIndicator - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addThreatIndicator(threatIndicatorAddThreatIndicatorBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatIndicator', 'addThreatIndicator', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatIndicatorDeleteThreatIndicatorBodyParam = {
      name: 'string'
    };
    describe('#deleteThreatIndicator - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteThreatIndicator(threatIndicatorDeleteThreatIndicatorBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatIndicator', 'deleteThreatIndicator', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatIndicatorSetThreatIndicatorBodyParam = {
      name: 'string',
      action: 'string',
      'profile-overrides': {
        remove: 'My_Profile'
      },
      'ignore-warnings': false
    };
    describe('#setThreatIndicator - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setThreatIndicator(threatIndicatorSetThreatIndicatorBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('7c00fba4-978e-4769-acbf-46909b88f45d', data.response.uid);
                assert.equal('My_Indicator', data.response.name);
                assert.equal('threat-indicator', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(false, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('General/Node', data.response.icon);
                assert.equal('Prevent', data.response.action);
                assert.equal(1, data.response['number-of-observables']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatIndicator', 'setThreatIndicator', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatIndicatorShowThreatIndicatorBodyParam = {
      name: 'string'
    };
    describe('#showThreatIndicator - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showThreatIndicator(threatIndicatorShowThreatIndicatorBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('7c00fba4-978e-4769-acbf-46909b88f45d', data.response.uid);
                assert.equal('My_Indicator', data.response.name);
                assert.equal('threat-indicator', data.response.type);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal(false, data.response['read-only']);
                assert.equal('', data.response.comments);
                assert.equal('General/Node', data.response.icon);
                assert.equal('Ask', data.response.action);
                assert.equal(1, data.response['number-of-observables']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatIndicator', 'showThreatIndicator', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatIndicatorShowThreatIndicatorsBodyParam = {};
    describe('#showThreatIndicators - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showThreatIndicators(threatIndicatorShowThreatIndicatorsBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(3, data.response.to);
                assert.equal(3, data.response.total);
                assert.equal(true, Array.isArray(data.response.indicators));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatIndicator', 'showThreatIndicators', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatLayerAddThreatLayerBodyParam = {
      name: 'string'
    };
    describe('#addThreatLayer - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addThreatLayer(threatLayerAddThreatLayerBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatLayer', 'addThreatLayer', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatLayerDeleteThreatLayerBodyParam = {
      name: 'string'
    };
    describe('#deleteThreatLayer - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteThreatLayer(threatLayerDeleteThreatLayerBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatLayer', 'deleteThreatLayer', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatLayerSetThreatLayerBodyParam = {
      name: 'string',
      'new-name': 'string'
    };
    describe('#setThreatLayer - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setThreatLayer(threatLayerSetThreatLayerBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatLayer', 'setThreatLayer', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatLayerShowThreatLayerBodyParam = {
      name: 'string'
    };
    describe('#showThreatLayer - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showThreatLayer(threatLayerShowThreatLayerBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatLayer', 'showThreatLayer', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatLayerShowThreatLayersBodyParam = {
      limit: 2,
      offset: 4,
      'details-level': 'string'
    };
    describe('#showThreatLayers - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showThreatLayers(threatLayerShowThreatLayersBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(6, data.response.to);
                assert.equal(6, data.response.total);
                assert.equal(true, Array.isArray(data.response['threat-layers']));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatLayer', 'showThreatLayers', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const iPSRunIpsUpdateBodyParam = {};
    describe('#runIpsUpdate - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.runIpsUpdate(iPSRunIpsUpdateBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('6b2e5c77-0622-4e7f-a9bf-4e1f21899553', data.response['task-id']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('IPS', 'runIpsUpdate', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const iPSSetIpsUpdateScheduleIntervalBodyParam = {
      enabled: true,
      recurrence: {
        pattern: 'interval',
        minutes: 45
      }
    };
    describe('#setIpsUpdateScheduleInterval - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setIpsUpdateScheduleInterval(iPSSetIpsUpdateScheduleIntervalBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(true, data.response.enabled);
                assert.equal('object', typeof data.response.recurrence);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('IPS', 'setIpsUpdateScheduleInterval', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const iPSShowIpsStatusBodyParam = {};
    describe('#showIpsStatus - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showIpsStatus(iPSShowIpsStatusBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('object', typeof data.response['last-updated']);
                assert.equal('635155796', data.response['installed-version']);
                assert.equal('object', typeof data.response['installed-version-creation-time']);
                assert.equal(true, data.response['update-available']);
                assert.equal('635156726', data.response['latest-version']);
                assert.equal('object', typeof data.response['latest-version-creation-time']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('IPS', 'showIpsStatus', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const iPSShowIpsUpdateScheduleBodyParam = {};
    describe('#showIpsUpdateSchedule - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showIpsUpdateSchedule(iPSShowIpsUpdateScheduleBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(true, data.response.enabled);
                assert.equal('0:00', data.response.time);
                assert.equal('object', typeof data.response.recurrence);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('IPS', 'showIpsUpdateSchedule', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const iPSExtendedAttributesShowIpsProtectionExtendedAttributeBodyParam = {
      name: 'string'
    };
    describe('#showIpsProtectionExtendedAttribute - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showIpsProtectionExtendedAttribute(iPSExtendedAttributesShowIpsProtectionExtendedAttributeBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('object', typeof data.response.object);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('IPSExtendedAttributes', 'showIpsProtectionExtendedAttribute', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const iPSExtendedAttributesShowIpsProtectionExtendedAttributesBodyParam = {};
    describe('#showIpsProtectionExtendedAttributes - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showIpsProtectionExtendedAttributes(iPSExtendedAttributesShowIpsProtectionExtendedAttributesBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(13, data.response.to);
                assert.equal(13, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('IPSExtendedAttributes', 'showIpsProtectionExtendedAttributes', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const threatEmulationRunThreatEmulationFileTypesOfflineUpdateBodyParam = {
      'file-path': 'string'
    };
    describe('#runThreatEmulationFileTypesOfflineUpdate - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.runThreatEmulationFileTypesOfflineUpdate(threatEmulationRunThreatEmulationFileTypesOfflineUpdateBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('Update of file types supported by Threat Emulation completed successfully.', data.response.message);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('ThreatEmulation', 'runThreatEmulationFileTypesOfflineUpdate', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const policyInstallPolicyBodyParam = {
      'policy-package': 'string',
      access: true,
      'threat-prevention': false,
      targets: [
        'string'
      ]
    };
    describe('#installPolicy - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.installPolicy(policyInstallPolicyBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Policy', 'installPolicy', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const policyVerifyPolicyBodyParam = {
      'policy-package': 'string'
    };
    describe('#verifyPolicy - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.verifyPolicy(policyVerifyPolicyBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Policy', 'verifyPolicy', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const policyPackageAddPackageBodyParam = {
      name: 'string',
      comments: 'string',
      color: 'string',
      'threat-prevention': true,
      access: true
    };
    describe('#addPackage - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.addPackage(policyPackageAddPackageBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('38b4ed6e-711c-49fa-b9f4-638290d621be', data.response.uid);
                assert.equal('object', typeof data.response.folder);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('New Standard Package 1', data.response.name);
                assert.equal('My Comments', data.response.comments);
                assert.equal('green', data.response.color);
                assert.equal('Blades/Access', data.response.icon);
                assert.equal(true, data.response.access);
                assert.equal(true, Array.isArray(data.response['access-layers']));
                assert.equal(false, data.response['vpn-traditional-mode']);
                assert.equal(true, data.response['nat-policy']);
                assert.equal(false, data.response.qos);
                assert.equal('recommended', data.response['qos-policy-type']);
                assert.equal(false, data.response['desktop-security']);
                assert.equal(false, data.response['threat-prevention']);
                assert.equal('all', data.response['installation-targets']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('PolicyPackage', 'addPackage', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const policyPackageDeletePackageBodyParam = {
      name: 'string'
    };
    describe('#deletePackage - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deletePackage(policyPackageDeletePackageBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('PolicyPackage', 'deletePackage', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const policyPackageSetPackageBodyParam = {
      name: 'string',
      'access-layers': {
        add: [
          {
            name: 'New Access Layer 1',
            position: 1
          }
        ]
      },
      'threat-layers': {
        add: [
          {
            name: 'New Layer 1',
            position: 2
          }
        ]
      }
    };
    describe('#setPackage - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.setPackage(policyPackageSetPackageBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('5b33bf86-1349-4ad6-ba41-592706f47e54', data.response.uid);
                assert.equal('object', typeof data.response.folder);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('Standard', data.response.name);
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('Blades/Access', data.response.icon);
                assert.equal(true, data.response.access);
                assert.equal(true, Array.isArray(data.response['access-layers']));
                assert.equal(true, Array.isArray(data.response['threat-layers']));
                assert.equal(false, data.response['vpn-traditional-mode']);
                assert.equal(true, data.response['nat-policy']);
                assert.equal(false, data.response.qos);
                assert.equal('recommended', data.response['qos-policy-type']);
                assert.equal(false, data.response['desktop-security']);
                assert.equal(true, data.response['threat-prevention']);
                assert.equal('all', data.response['installation-targets']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('PolicyPackage', 'setPackage', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const policyPackageShowPackageBodyParam = {
      name: 'string'
    };
    describe('#showPackage - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showPackage(policyPackageShowPackageBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('PolicyPackage', 'showPackage', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const policyPackageShowPackagesBodyParam = {
      limit: 3,
      offset: 6,
      'details-level': 'string'
    };
    describe('#showPackages - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showPackages(policyPackageShowPackagesBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('PolicyPackage', 'showPackages', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const domainAddDomainBodyParam = {
      name: 'string',
      servers: {
        'ip-address': '192.0.2.1',
        name: 'domain1_ManagementServer_1',
        'multi-domain-server': 'MDM_Server'
      }
    };
    describe('#addDomain - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addDomain(domainAddDomainBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Domain', 'addDomain', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const domainDeleteDomainBodyParam = {
      name: 'string'
    };
    describe('#deleteDomain - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteDomain(domainDeleteDomainBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Domain', 'deleteDomain', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const domainSetDomainBodyParam = {
      name: 'string',
      comments: 'string'
    };
    describe('#setDomain - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setDomain(domainSetDomainBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Domain', 'setDomain', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const domainShowDomainBodyParam = {
      name: 'string'
    };
    describe('#showDomain - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showDomain(domainShowDomainBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Domain', 'showDomain', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const domainShowDomainsBodyParam = {
      limit: 1,
      offset: 10,
      'details-level': 'string'
    };
    describe('#showDomains - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showDomains(domainShowDomainsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Domain', 'showDomains', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const globalDomainSetGlobalDomainBodyParam = {
      name: 'string',
      comments: 'string'
    };
    describe('#setGlobalDomain - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setGlobalDomain(globalDomainSetGlobalDomainBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('GlobalDomain', 'setGlobalDomain', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const globalDomainShowGlobalDomainBodyParam = {
      name: 'string'
    };
    describe('#showGlobalDomain - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showGlobalDomain(globalDomainShowGlobalDomainBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('GlobalDomain', 'showGlobalDomain', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const multiDomainServerMDSShowMdsBodyParam = {
      name: 'string'
    };
    describe('#showMds - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showMds(multiDomainServerMDSShowMdsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('MultiDomainServerMDS', 'showMds', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const multiDomainServerMDSShowMdssBodyParam = {};
    describe('#showMdss - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showMdss(multiDomainServerMDSShowMdssBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(1, data.response.to);
                assert.equal(1, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('MultiDomainServerMDS', 'showMdss', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const placeholderShowPlaceHolderBodyParam = {
      uid: 'string'
    };
    describe('#showPlaceHolder - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showPlaceHolder(placeholderShowPlaceHolderBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('29e05a19-d536-40af-afb2-baaf79068127', data.response.uid);
                assert.equal('object', typeof data.response.folder);
                assert.equal('object', typeof data.response.domain);
                assert.equal('object', typeof data.response['meta-info']);
                assert.equal(true, Array.isArray(data.response.tags));
                assert.equal('', data.response.comments);
                assert.equal('black', data.response.color);
                assert.equal('General/globalsNa', data.response.icon);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Placeholder', 'showPlaceHolder', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const globalAssignmentAddGlobalAssignmentBodyParam = {
      'global-domain': 'string',
      'dependent-domain': 'string',
      'global-access-policy': 'string',
      'global-threat-prevention-policy': 'string',
      'manage-protection-actions': false
    };
    describe('#addGlobalAssignment - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addGlobalAssignment(globalAssignmentAddGlobalAssignmentBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('GlobalAssignment', 'addGlobalAssignment', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const globalAssignmentAssignGlobalAssignmentBodyParam = {
      'global-domains': 'string',
      'dependent-domains': 'string'
    };
    describe('#assignGlobalAssignment - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.assignGlobalAssignment(globalAssignmentAssignGlobalAssignmentBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('GlobalAssignment', 'assignGlobalAssignment', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const globalAssignmentDeleteGlobalAssignmentBodyParam = {
      'global-domain': 'string',
      'dependent-domain': 'string'
    };
    describe('#deleteGlobalAssignment - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteGlobalAssignment(globalAssignmentDeleteGlobalAssignmentBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('GlobalAssignment', 'deleteGlobalAssignment', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const globalAssignmentSetGlobalAssignmentBodyParam = {
      'global-domain': 'string',
      'dependent-domain': 'string',
      'global-threat-prevention-policy': 'string',
      'manage-protection-actions': true
    };
    describe('#setGlobalAssignment - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setGlobalAssignment(globalAssignmentSetGlobalAssignmentBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('GlobalAssignment', 'setGlobalAssignment', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const globalAssignmentShowGlobalAssignmentBodyParam = {
      'global-domain': 'string',
      'dependent-domain': 'string'
    };
    describe('#showGlobalAssignment - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showGlobalAssignment(globalAssignmentShowGlobalAssignmentBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('GlobalAssignment', 'showGlobalAssignment', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const globalAssignmentShowGlobalAssignmentsBodyParam = {
      limit: 2,
      offset: 5,
      'details-level': 'string'
    };
    describe('#showGlobalAssignments - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showGlobalAssignments(globalAssignmentShowGlobalAssignmentsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('GlobalAssignment', 'showGlobalAssignments', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const miscExportBodyParam = {
      'export-files-by-class': false
    };
    describe('#export - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.export(miscExportBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Misc', 'export', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const miscPutFileBodyParam = {
      'file-path': 'string',
      'file-name': 'string',
      'file-content': 'string',
      targets: [
        'string'
      ]
    };
    describe('#putFile - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.putFile(miscPutFileBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Misc', 'putFile', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const miscRunScriptBodyParam = {
      'script-name': 'string',
      script: 'string',
      targets: [
        'string'
      ]
    };
    describe('#runScript - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.runScript(miscRunScriptBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Misc', 'runScript', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const miscShowApiVersionsBodyParam = {};
    describe('#showApiVersions - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showApiVersions(miscShowApiVersionsBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('1.1', data.response['current-version']);
                assert.equal(true, Array.isArray(data.response['supported-versions']));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Misc', 'showApiVersions', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const miscShowChangesBetweenTheDatesBodyParam = {
      'from-date': 'string',
      'to-date': 'string'
    };
    describe('#showChangesBetweenTheDates - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showChangesBetweenTheDates(miscShowChangesBetweenTheDatesBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(true, Array.isArray(data.response.tasks));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Misc', 'showChangesBetweenTheDates', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const miscShowCommandsBodyParam = {};
    describe('#showCommands - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showCommands(miscShowCommandsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Misc', 'showCommands', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const miscShowGatewaysAndServersBodyParam = {
      'details-level': 'string'
    };
    describe('#showGatewaysAndServers - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showGatewaysAndServers(miscShowGatewaysAndServersBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response.from);
                assert.equal(2, data.response.to);
                assert.equal(2, data.response.total);
                assert.equal(true, Array.isArray(data.response.objects));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Misc', 'showGatewaysAndServers', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const miscShowObjectBodyParam = {
      uid: 'string'
    };
    describe('#showObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showObject(miscShowObjectBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('object', typeof data.response.object);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Misc', 'showObject', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const miscShowObjectsOfTypeGroupBodyParam = {
      limit: 10,
      offset: 8,
      order: [
        {
          ASC: 'name'
        }
      ],
      type: 'string'
    };
    describe('#showObjectsOfTypeGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showObjectsOfTypeGroup(miscShowObjectsOfTypeGroupBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Misc', 'showObjectsOfTypeGroup', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const miscShowTaskBodyParam = {
      'task-id': 'string'
    };
    describe('#showTask - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showTask(miscShowTaskBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Misc', 'showTask', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const miscShowTasksBodyParam = {
      initiator: 'string',
      status: 'string',
      'from-date': 'string'
    };
    describe('#showTasks - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showTasks(miscShowTasksBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Misc', 'showTasks', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const miscShowUnusedObjectsBodyParam = {
      offset: 1,
      limit: 9,
      'details-level': 'string'
    };
    describe('#showUnusedObjects - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showUnusedObjects(miscShowUnusedObjectsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Misc', 'showUnusedObjects', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const miscShowValidationsBodyParam = {};
    describe('#showValidations - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.showValidations(miscShowValidationsBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal(1, data.response['warnings-total']);
                assert.equal(1, data.response['errors-total']);
                assert.equal(0, data.response['blocking-errors-total']);
                assert.equal(true, Array.isArray(data.response.warnings));
                assert.equal(true, Array.isArray(data.response.errors));
                assert.equal(true, Array.isArray(data.response['blocking-errors']));
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Misc', 'showValidations', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const miscWhereUsedBodyParam = {
      name: 'string'
    };
    describe('#whereUsed - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        try {
          a.whereUsed(miscWhereUsedBodyParam, (data, error) => {
            try {
              if (stub) {
                runCommonAsserts(data, error);
                assert.equal('object', typeof data.response['used-directly']);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Misc', 'whereUsed', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const administratorAddAdministratorBodyParam = {
      name: 'string',
      password: 'string',
      'must-change-password': true,
      email: 'string',
      'phone-number': 'string',
      'authentication-method': 'string',
      'permissions-profile': 'string'
    };
    describe('#addAdministrator - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.addAdministrator(administratorAddAdministratorBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Administrator', 'addAdministrator', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const administratorDeleteAdministratorBodyParam = {
      name: 'string'
    };
    describe('#deleteAdministrator - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.deleteAdministrator(administratorDeleteAdministratorBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Administrator', 'deleteAdministrator', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const administratorSetAdministratorBodyParam = {
      name: 'string',
      password: 'string',
      'permissions-profile': 'string'
    };
    describe('#setAdministrator - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setAdministrator(administratorSetAdministratorBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Administrator', 'setAdministrator', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const administratorShowAdministratorBodyParam = {
      name: 'string'
    };
    describe('#showAdministrator - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showAdministrator(administratorShowAdministratorBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Administrator', 'showAdministrator', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const administratorShowAdministratorsBodyParam = {
      limit: 9,
      offset: 5,
      'details-level': 'string'
    };
    describe('#showAdministrators - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showAdministrators(administratorShowAdministratorsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Administrator', 'showAdministrators', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const administratorUnlockAdministratorBodyParam = {
      name: 'string'
    };
    describe('#unlockAdministrator - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.unlockAdministrator(administratorUnlockAdministratorBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('Administrator', 'unlockAdministrator', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const aPISettingsSetApiSettingsBodyParam = {
      'accepted-api-calls-from': 'string'
    };
    describe('#setApiSettings - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.setApiSettings(aPISettingsSetApiSettingsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('APISettings', 'setApiSettings', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    const aPISettingsShowApiSettingsBodyParam = {};
    describe('#showApiSettings - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        try {
          a.showApiSettings(aPISettingsShowApiSettingsBodyParam, (data, error) => {
            try {
              if (stub) {
                const displayE = 'Error 400 received on request';
                runErrorAsserts(data, error, 'AD.500', 'Test-checkpoint_Management-connectorRest-handleEndResponse', displayE);
              } else {
                runCommonAsserts(data, error);
              }
              saveMockData('APISettings', 'showApiSettings', 'default', data);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
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
