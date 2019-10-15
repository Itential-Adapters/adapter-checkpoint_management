/* eslint no-underscore-dangle: warn  */
/* eslint camelcase: warn  */
/* eslint quote-props: warn  */
/* eslint quotes: ["warn", "single"]  */

// Set globals
/* global describe it log pronghornProps */

// include required items for testing & logging
const assert = require('assert');
const winston = require('winston');


// stub and attemptTimeout are used throughout the code so set them here
const stub = false;
const attemptTimeout = 60000;
let logLevel = 'none';

// these variables can be changed to run in integrated mode so easier to set them here
// always check these in with bogus data!!!
//    commented out for now due to automatic parsing of properties
// const host = '192.168.9.50';

// these are the adapter properties. You generally should not need to alter any of these
// after they are initially set up
global.pronghornProps = {
  pathProps: {
    encrypted: false
  },
  adapterProps: {
    adapters: [{
      id: 'Test-checkpoint',
      type: 'Checkpoint',
      properties: {
        'host': '192.168.9.50',
        'port': 443,
        'version': 'v1',
        'base_path': '/web_api',
        'stub': false,
        'protocol': 'https',
        'authentication': {
          'auth_method': 'basic user_password',
          'method_type': 'POST'
        },
        'healthcheck': {
          'type': 'none',
          'hc_method_type': 'GET'
        },
        'request': {
          'number_retries': 3,
          'attempt_timeout': 5000,
          'healthcheck_on_timeout': true
        },
        'ssl': {},
        'throttle': {
          'number_pronghorns': 1,
          'sync_async': 'sync',
          'max_in_queue': 1000,
          'concurrent_max': 1,
          'avg_runtime': 200
        },
        'proxy': {
          'port': 443,
          'protocol': 'http'
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

// require the adapter that we are going to be using
const Checkpoint = require('../../adapter.js');

// begin the testing - these should be pretty well defined between the describe and the it!
describe('[integration] Checkpoint Adapter Test', () => {
  describe('Checkpoint Class Tests', () => {
    const a = new Checkpoint(
      pronghornProps.adapterProps.adapters[0].type,
      pronghornProps.adapterProps.adapters[0].properties
    );

    describe('#class instance created', () => {
      it('should be a class with properties', (done) => {
        assert.notEqual(null, a);
        assert.notEqual(undefined, a);
        assert.notEqual(null, a.allProps);
        const check = global.pronghornProps.adapterProps.adapters[0].properties.healthcheck.type;
        assert.equal(check, a.healthcheckType);
        done();
      }).timeout(attemptTimeout);
    });

    describe('#connect', () => {
      it('should get connected - no healthcheck', (done) => {
        a.healthcheckType = 'none';
        a.connect();
        assert.equal(true, a.alive);
        done();
      });
      it('should get connected - startup healthcheck', (done) => {
        a.healthcheckType = 'startup';
        a.connect();
        assert.equal(true, a.alive);
        done();
      });
    });

    describe('#healthCheck', () => {
      it('should be healthy', (done) => {
        const p = new Promise((resolve) => {
          a.healthCheck((data) => {
            resolve(data);
            assert.equal(true, a.healthy);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postLogin - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postLogin('fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('ullamco nulla qui occaecat aliqua', data.response.sid);
              assert.equal('velit', data.response.url);
              assert.equal('non aliqua', data.response.uid);
              assert.equal(83886631, data.response.session-timeout);
              assert.equal('object', typeof data.response.last-login-was-at);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postPublish - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postPublish('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('ipsum', data.response.task-id);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDiscard - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postDiscard('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('Excepteur in ea Lorem esse', data.response.message);
              assert.equal(8297946, data.response.number-of-discarded-changes);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postLogout - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postLogout('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('c', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDisconnect - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postDisconnect('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('in ipsum laboris labore', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postKeepalive - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postKeepalive('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('sunt ex ut labore', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowSession - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSession('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetSession - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetSession('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postContinueSessionInSmartconsole - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postContinueSessionInSmartconsole('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('est in', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowLastPublishedSession - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowLastPublishedSession('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postPurgePublishedSessions - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postPurgePublishedSessions('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSwitchSession - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSwitchSession('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAssignSession - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAssignSession('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postTakeOverSession - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postTakeOverSession('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowSessions - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSessions('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(94617656, data.response.from);
              assert.equal(-21244031, data.response.to);
              assert.equal(43580648, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowLoginMessage - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowLoginMessage('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetLoginMessage - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetLoginMessage('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddHost - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddHost('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('fugiat irure in culpa', data.response.uid);
              assert.equal('object', typeof data.response.folder);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('Excepteur ut', data.response.name);
              assert.equal('nostrud et consectetur', data.response.comments);
              assert.equal('labore Duis culpa reprehenderit', data.response.color);
              assert.equal('adipisicing culpa reprehenderit id', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal('object', typeof data.response.nat-settings);
              assert.equal('Excepteur sed consectetur', data.response.ipv4-address);
              assert.equal('nulla velit', data.response.ipv6-address);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowHost - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowHost('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetHost - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetHost('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteHost - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteHost('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowHosts - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowHosts('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddNetwork - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddNetwork('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowNetwork - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNetwork('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetNetwork - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetNetwork('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteNetwork - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteNetwork('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowNetworks - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNetworks('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddWildcard - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddWildcard('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowWildcard - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowWildcard('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetWildcard - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetWildcard('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteWildcard - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteWildcard('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowWildcards - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowWildcards('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddGroup - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddGroup('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('reprehenderit nostrud dolore mollit', data.response.uid);
              assert.equal('object', typeof data.response.folder);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('elit adipisicing do magna tempor', data.response.name);
              assert.equal('culpa adipisicing Ut dolore veniam', data.response.comments);
              assert.equal('es', data.response.color);
              assert.equal('proident ipsum nostrud exercitat', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(true, Array.isArray(data.response.members));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGroup('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGroup('fakedata', 'fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteGroup('fakedata', 'fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowGroups - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGroups('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddAddressRange - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAddressRange('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAddressRange - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAddressRange('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetAddressRange - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAddressRange('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteAddressRange - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAddressRange('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAddressRanges - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAddressRanges('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddMulticastAddressRange - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddMulticastAddressRange('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('dolore commodo', data.response.uid);
              assert.equal('pariatur non', data.response.name);
              assert.equal('irure', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(false, data.response.read-only);
              assert.equal('id tempor', data.response.comments);
              assert.equal('c', data.response.color);
              assert.equal('e', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal('ut', data.response.ipv4-address-first);
              assert.equal('veniam velit qui', data.response.ipv4-address-last);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowMulticastAddressRange - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowMulticastAddressRange('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('adipisicing sed', data.response.uid);
              assert.equal('culpa cillum', data.response.name);
              assert.equal('Duis', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('laborum id', data.response.comments);
              assert.equal('sint culpa adipisicing ea', data.response.color);
              assert.equal('dolore', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal('consectetur', data.response.ipv4-address-first);
              assert.equal('aliqua incididunt reprehenderit consequat nisi', data.response.ipv4-address-last);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetMulticastAddressRange - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetMulticastAddressRange('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('occaecat Lorem esse', data.response.uid);
              assert.equal('veniam sit dolor nulla', data.response.name);
              assert.equal('ex', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('eiusmod in', data.response.comments);
              assert.equal('consequat qui Duis laborum cillum', data.response.color);
              assert.equal('exercitation qui adipisicing minim Ut', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal('Excepteur', data.response.ipv4-address-first);
              assert.equal('', data.response.ipv4-address-last);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteMulticastAddressRange - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteMulticastAddressRange('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('id est consectetur ut quis', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowMulticastAddressRanges - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowMulticastAddressRanges('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-6921649, data.response.from);
              assert.equal(60616764, data.response.to);
              assert.equal(-71127635, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddGroupWithExclusion - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddGroupWithExclusion('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowGroupWithExclusion - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGroupWithExclusion('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetGroupWithExclusion - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGroupWithExclusion('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteGroupWithExclusion - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteGroupWithExclusion('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowGroupsWithExclusion - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGroupsWithExclusion('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddSimpleGateway - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddSimpleGateway('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('et ali', data.response.uid);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('dol', data.response.name);
              assert.equal('Ut in sit', data.response.comments);
              assert.equal('voluptate consectetur pariatur', data.response.color);
              assert.equal('mollit dolor aliqua adipisicing fugiat', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal('Excepteur enim Lorem id', data.response.ipv6-address);
              assert.equal(false, data.response.dynamic-ip);
              assert.equal('magna labore in ', data.response.version);
              assert.equal('ad', data.response.os-name);
              assert.equal('aliquip sunt', data.response.hardware);
              assert.equal('do ex', data.response.sic-name);
              assert.equal('tempor culp', data.response.sic-state);
              assert.equal(true, Array.isArray(data.response.interfaces));
              assert.equal(false, data.response.firewall);
              assert.equal('object', typeof data.response.firewall-settings);
              assert.equal(true, data.response.vpn);
              assert.equal(true, data.response.application-control);
              assert.equal(true, data.response.url-filtering);
              assert.equal(false, data.response.data-awareness);
              assert.equal(false, data.response.ips);
              assert.equal(true, data.response.anti-bot);
              assert.equal(false, data.response.anti-virus);
              assert.equal(false, data.response.threat-emulation);
              assert.equal(false, data.response.save-logs-locally);
              assert.equal(true, Array.isArray(data.response.send-alerts-to-server));
              assert.equal(true, Array.isArray(data.response.send-logs-to-server));
              assert.equal(true, Array.isArray(data.response.send-logs-to-backup-server));
              assert.equal('object', typeof data.response.logs-settings);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowSimpleGateway - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSimpleGateway('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetSimpleGateway - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetSimpleGateway('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteSimpleGateway - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteSimpleGateway('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowSimpleGateways - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSimpleGateways('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddSecurityZone - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddSecurityZone('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowSecurityZone - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSecurityZone('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetSecurityZone - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetSecurityZone('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteSecurityZone - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteSecurityZone('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowSecurityZones - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSecurityZones('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(8631687, data.response.from);
              assert.equal(79356467, data.response.to);
              assert.equal(-71939202, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddTime - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddTime('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTime - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTime('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetTime - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetTime('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteTime - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteTime('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTimes - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTimes('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddTimeGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddTimeGroup('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTimeGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTimeGroup('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetTimeGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetTimeGroup('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteTimeGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteTimeGroup('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTimeGroups - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTimeGroups('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddAccessRole - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAccessRole('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAccessRole - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessRole('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetAccessRole - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAccessRole('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteAccessRole - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAccessRole('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAccessRoles - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessRoles('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddDynamicObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddDynamicObject('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('et u', data.response.uid);
              assert.equal('aliquip', data.response.name);
              assert.equal('dolore aliquip', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(false, data.response.read-only);
              assert.equal('labore fugiat tempor dolore laboris', data.response.comments);
              assert.equal('esse', data.response.color);
              assert.equal('aute Excepteur Lorem', data.response.icon);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDynamicObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDynamicObject('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('esse Lor', data.response.uid);
              assert.equal('sed', data.response.name);
              assert.equal('labore dolor laboris', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('ex', data.response.comments);
              assert.equal('cupidatat aute dolore sint ut', data.response.color);
              assert.equal('consequat id repre', data.response.icon);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetDynamicObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetDynamicObject('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('Duis nostrud irure anim', data.response.uid);
              assert.equal('Excepteur tempor', data.response.name);
              assert.equal('sed dolor', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('adipi', data.response.comments);
              assert.equal('nostrud quis voluptate adipisicing ex', data.response.color);
              assert.equal('quis non dolore', data.response.icon);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteDynamicObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteDynamicObject('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('exercitation', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDynamicObjects - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDynamicObjects('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-40482731, data.response.from);
              assert.equal(-39641422, data.response.to);
              assert.equal(1435402, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddTrustedClient - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddTrustedClient('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTrustedClient - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTrustedClient('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetTrustedClient - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetTrustedClient('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteTrustedClient - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteTrustedClient('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTrustedClients - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTrustedClients('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddTag - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddTag('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('sit', data.response.uid);
              assert.equal('object', typeof data.response.folder);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('mollit', data.response.name);
              assert.equal('in voluptate anim eu', data.response.comments);
              assert.equal('consequat in', data.response.color);
              assert.equal('sit minim quis do laborum', data.response.icon);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTag - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTag('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('elit', data.response.uid);
              assert.equal('object', typeof data.response.folder);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('incididunt cillum laborum labo', data.response.name);
              assert.equal('ipsum i', data.response.comments);
              assert.equal('ex minim tempor non fugiat', data.response.color);
              assert.equal('sunt', data.response.icon);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetTag - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetTag('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('mollit sed Excepteur', data.response.uid);
              assert.equal('object', typeof data.response.folder);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('quis aliqua aute', data.response.name);
              assert.equal('incididun', data.response.comments);
              assert.equal('nulla dolore voluptate sit labore', data.response.color);
              assert.equal('velit voluptate cillum irure ea', data.response.icon);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteTag - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteTag('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTags - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTags('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-11762841, data.response.from);
              assert.equal(-9258110, data.response.to);
              assert.equal(22231643, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddDnsDomain - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddDnsDomain('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('ex id pariatur est', data.response.uid);
              assert.equal('sed laborum minim fugi', data.response.name);
              assert.equal('veniam sint', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('do commodo', data.response.comments);
              assert.equal('consequat', data.response.color);
              assert.equal('consectetur culpa veniam', data.response.icon);
              assert.equal(false, data.response.is-sub-domain);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDnsDomain - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDnsDomain('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('dolor', data.response.uid);
              assert.equal('pariatur sunt', data.response.name);
              assert.equal('Excepteur nisi', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('in Ut', data.response.comments);
              assert.equal('cillum eu ', data.response.color);
              assert.equal('aliqua nulla', data.response.icon);
              assert.equal(true, data.response.is-sub-domain);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetDnsDomain - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetDnsDomain('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('in est', data.response.uid);
              assert.equal('laborum qui aliqua ipsum elit', data.response.name);
              assert.equal('ad', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('Ut ex ut in irure', data.response.comments);
              assert.equal('l', data.response.color);
              assert.equal('reprehenderi', data.response.icon);
              assert.equal(true, data.response.is-sub-domain);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteDnsDomain - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteDnsDomain('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('dolore', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDnsDomains - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDnsDomains('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-11328865, data.response.from);
              assert.equal(-62802670, data.response.to);
              assert.equal(2653485, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddOpsecApplication - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddOpsecApplication('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('exercitation', data.response.uid);
              assert.equal('eu', data.response.name);
              assert.equal('Excepteur irure', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('in sit', data.response.host);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(false, data.response.read-only);
              assert.equal('ullamco consequat nulla dolor', data.response.comments);
              assert.equal('sunt nulla', data.response.color);
              assert.equal('aute veniam minim non', data.response.icon);
              assert.equal('object', typeof data.response.cpmi);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowOpsecApplication - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowOpsecApplication('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('irure', data.response.uid);
              assert.equal('eu Ut culpa labore', data.response.name);
              assert.equal('sint reprehenderit aliqua enim mollit', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('in', data.response.host);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('minim dolor', data.response.comments);
              assert.equal('repr', data.response.color);
              assert.equal('officia anim cupidatat', data.response.icon);
              assert.equal('object', typeof data.response.lea);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetOpsecApplication - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetOpsecApplication('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('commodo labore', data.response.uid);
              assert.equal('in', data.response.name);
              assert.equal('am', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('culpa in consequat eiusmod', data.response.host);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('ut aute deserun', data.response.comments);
              assert.equal('dolore laboris sit minim', data.response.color);
              assert.equal('velit officia Lorem', data.response.icon);
              assert.equal('object', typeof data.response.lea);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteOpsecApplication - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteOpsecApplication('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('Lorem nulla', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowOpsecApplications - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowOpsecApplications('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-46401157, data.response.from);
              assert.equal(56852426, data.response.to);
              assert.equal(82447712, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDataCenterContent - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenterContent('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(true, Array.isArray(data.response.objects));
              assert.equal(-10905345, data.response.from);
              assert.equal(-62257793, data.response.to);
              assert.equal(-88867889, data.response.total);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDataCenter - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenter('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('eu do', data.response.uid);
              assert.equal('aute velit non nostrud occaecat', data.response.name);
              assert.equal('laboris non dolor', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('aute', data.response.comments);
              assert.equal('eiusmod reprehenderit', data.response.color);
              assert.equal('ut occaecat', data.response.icon);
              assert.equal('in anim velit', data.response.server-type);
              assert.equal('object', typeof data.response.properties);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDataCenters - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenters('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-90487911, data.response.from);
              assert.equal(79445401, data.response.to);
              assert.equal(19202582, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddDataCenterObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddDataCenterObject('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('aliqua esse quis minim nulla', data.response.uid);
              assert.equal('Duis', data.response.name);
              assert.equal('a', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('est officia elit aute', data.response.comments);
              assert.equal('non ipsum dolore', data.response.color);
              assert.equal('sunt nostrud Lor', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(true, Array.isArray(data.response.additional-properties));
              assert.equal('object', typeof data.response.data-center);
              assert.equal('qui', data.response.name-in-data-center);
              assert.equal('object', typeof data.response.data-center-object-meta-info);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDataCenterObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenterObject('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('fugiat Lorem off', data.response.uid);
              assert.equal('do Duis est', data.response.name);
              assert.equal('dolore', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('aute ad elit', data.response.comments);
              assert.equal('aute mollit', data.response.color);
              assert.equal('eu', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(true, Array.isArray(data.response.additional-properties));
              assert.equal('Duis qui', data.response.uid-in-data-center);
              assert.equal('object', typeof data.response.data-center);
              assert.equal('sit sed voluptate exercitation elit', data.response.name-in-data-center);
              assert.equal('object', typeof data.response.data-center-object-meta-info);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteDataCenterObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteDataCenterObject('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('nostrud ea tempor', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDataCenterObjects - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenterObjects('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(54860716, data.response.from);
              assert.equal(-55722540, data.response.to);
              assert.equal(-80642508, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowUpdatableObjectsRepositoryContent - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowUpdatableObjectsRepositoryContent('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(70189111, data.response.from);
              assert.equal(-53718609, data.response.to);
              assert.equal(96445332, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postUpdateUpdatableObjectsRepositoryContent - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postUpdateUpdatableObjectsRepositoryContent('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('ut laboris est', data.response.task-id);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddUpdatableObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddUpdatableObject('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('magna laboris ', data.response.uid);
              assert.equal('ullamco velit', data.response.name);
              assert.equal('cillum anim sit', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('adipisicing reprehenderit qui sunt', data.response.name-in-updatable-objects-repository);
              assert.equal('a', data.response.uid-in-updatable-objects-repository);
              assert.equal('object', typeof data.response.additional-properties);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(false, data.response.read-only);
              assert.equal('elit minim sint et', data.response.comments);
              assert.equal('laboris id', data.response.color);
              assert.equal('sed quis', data.response.icon);
              assert.equal('object', typeof data.response.updatable-object-meta-info);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowUpdatableObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowUpdatableObject('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('dolor et ea pariatur aliqua', data.response.uid);
              assert.equal('nisi ex eu', data.response.name);
              assert.equal('Excepteur esse et enim', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('in incididunt id', data.response.name-in-updatable-objects-repository);
              assert.equal('ullamco voluptate ad cillum deserunt', data.response.uid-in-updatable-objects-repository);
              assert.equal('object', typeof data.response.additional-properties);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('sunt aute eu', data.response.comments);
              assert.equal('aute Lorem', data.response.color);
              assert.equal('velit', data.response.icon);
              assert.equal('object', typeof data.response.updatable-object-meta-info);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteUpdatableObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteUpdatableObject('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('esse', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowUpdatableObjects - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowUpdatableObjects('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-8019287, data.response.from);
              assert.equal(87064383, data.response.to);
              assert.equal(24800535, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceTcp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceTcp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('sunt deserunt', data.response.uid);
              assert.equal('in non qui sint adipisicing', data.response.name);
              assert.equal('esse amet officia', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('culpa enim ea Ut id', data.response.comments);
              assert.equal('esse ea ex', data.response.color);
              assert.equal('reprehenderit', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(true, data.response.keep-connections-open-after-policy-installation);
              assert.equal(-61438067, data.response.session-timeout);
              assert.equal(true, data.response.use-default-session-timeout);
              assert.equal(false, data.response.match-for-any);
              assert.equal(true, data.response.sync-connections-on-cluster);
              assert.equal('object', typeof data.response.aggressive-aging);
              assert.equal('elit veniam commodo deserunt', data.response.port);
              assert.equal(false, data.response.match-by-protocol-signature);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceTcp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceTcp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('Duis Lorem', data.response.uid);
              assert.equal('ea in proident incididunt', data.response.name);
              assert.equal('sed', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('Duis cillum ex amet qui', data.response.comments);
              assert.equal('irure in laboris ullamco', data.response.color);
              assert.equal('ut consectetur nostrud Excepteur', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(false, data.response.keep-connections-open-after-policy-installation);
              assert.equal(-71759879, data.response.session-timeout);
              assert.equal(false, data.response.use-default-session-timeout);
              assert.equal(true, data.response.match-for-any);
              assert.equal(false, data.response.sync-connections-on-cluster);
              assert.equal('object', typeof data.response.aggressive-aging);
              assert.equal('cillum', data.response.port);
              assert.equal('labore Lorem pariatur', data.response.protocol);
              assert.equal(false, data.response.match-by-protocol-signature);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceTcp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceTcp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('sint labore do est in', data.response.uid);
              assert.equal('dolor non Duis sed', data.response.name);
              assert.equal('occaecat cillum', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(false, data.response.read-only);
              assert.equal('adipisicing proident Excepteur in', data.response.comments);
              assert.equal('ad amet Duis reprehenderit sunt', data.response.color);
              assert.equal('ea Duis pariatur', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(false, data.response.keep-connections-open-after-policy-installation);
              assert.equal(-38471495, data.response.session-timeout);
              assert.equal(false, data.response.use-default-session-timeout);
              assert.equal(false, data.response.match-for-any);
              assert.equal(false, data.response.sync-connections-on-cluster);
              assert.equal('object', typeof data.response.aggressive-aging);
              assert.equal('esse irure ullamco', data.response.port);
              assert.equal(false, data.response.match-by-protocol-signature);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceTcp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceTcp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('id consectetur elit anim', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServicesTcp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesTcp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(56295465, data.response.from);
              assert.equal(68188239, data.response.to);
              assert.equal(85354573, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceUdp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceUdp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('ad aliqua voluptate', data.response.uid);
              assert.equal('Excepteur', data.response.name);
              assert.equal('officia dolor Excepteur', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('aute', data.response.comments);
              assert.equal('ex ea deserunt', data.response.color);
              assert.equal('tempor elit', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(true, data.response.keep-connections-open-after-policy-installation);
              assert.equal(25069996, data.response.session-timeout);
              assert.equal(true, data.response.use-default-session-timeout);
              assert.equal(true, data.response.match-for-any);
              assert.equal(true, data.response.sync-connections-on-cluster);
              assert.equal('object', typeof data.response.aggressive-aging);
              assert.equal('anim laborum eu nulla Lorem', data.response.port);
              assert.equal(false, data.response.match-by-protocol-signature);
              assert.equal(true, data.response.accept-replies);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceUdp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceUdp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('commodo', data.response.uid);
              assert.equal('consectetur ea velit amet', data.response.name);
              assert.equal('dolor ex minim laborum', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('dolor', data.response.comments);
              assert.equal('Excepteur et consectetur labore id', data.response.color);
              assert.equal('commodo ullamco ut proident', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(false, data.response.keep-connections-open-after-policy-installation);
              assert.equal(20187268, data.response.session-timeout);
              assert.equal(false, data.response.use-default-session-timeout);
              assert.equal(true, data.response.match-for-any);
              assert.equal(false, data.response.sync-connections-on-cluster);
              assert.equal('object', typeof data.response.aggressive-aging);
              assert.equal('cillum', data.response.port);
              assert.equal(true, data.response.match-by-protocol-signature);
              assert.equal(false, data.response.accept-replies);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceUdp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceUdp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('voluptate', data.response.uid);
              assert.equal('Excepteur', data.response.name);
              assert.equal('nisi sunt culpa', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('commodo consectetur', data.response.comments);
              assert.equal('amet in fugiat velit labore', data.response.color);
              assert.equal('laboris nisi', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(true, data.response.keep-connections-open-after-policy-installation);
              assert.equal(2429372, data.response.session-timeout);
              assert.equal(false, data.response.use-default-session-timeout);
              assert.equal(true, data.response.match-for-any);
              assert.equal(true, data.response.sync-connections-on-cluster);
              assert.equal('object', typeof data.response.aggressive-aging);
              assert.equal('com', data.response.port);
              assert.equal('consequat magna voluptate dolore', data.response.protocol);
              assert.equal(false, data.response.match-by-protocol-signature);
              assert.equal(false, data.response.accept-replies);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceUdp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceUdp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('nisi laborum tempor non dolor', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServicesUdp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesUdp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(50519125, data.response.from);
              assert.equal(-3514057, data.response.to);
              assert.equal(99972300, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceIcmp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceIcmp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('minim anim consequat', data.response.uid);
              assert.equal('officia quis eu laboris', data.response.name);
              assert.equal('nisi est', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal(49120858, data.response.icmp-type);
              assert.equal(5708876, data.response.icmp-code);
              assert.equal(true, data.response.keep-connections-open-after-policy-installation);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('incididunt eiusmod voluptate occaecat ad', data.response.comments);
              assert.equal('ad Ut qui non culpa', data.response.color);
              assert.equal('quis officia nulla mollit elit', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceIcmp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceIcmp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('Lorem velit', data.response.uid);
              assert.equal('sunt elit Lorem in', data.response.name);
              assert.equal('sit ut officia sed eiusmod', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal(98761988, data.response.icmp-type);
              assert.equal(false, data.response.keep-connections-open-after-policy-installation);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(false, data.response.read-only);
              assert.equal('officia dol', data.response.comments);
              assert.equal('ame', data.response.color);
              assert.equal('occaecat ut nisi irure ex', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceIcmp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceIcmp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('Lorem sint', data.response.uid);
              assert.equal('do fugiat', data.response.name);
              assert.equal('amet sed nulla Lorem', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal(-57805378, data.response.icmp-type);
              assert.equal(-72522892, data.response.icmp-code);
              assert.equal(false, data.response.keep-connections-open-after-policy-installation);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(false, data.response.read-only);
              assert.equal('eu', data.response.comments);
              assert.equal('deserunt', data.response.color);
              assert.equal('sed', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceIcmp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceIcmp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('nulla', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServicesIcmp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesIcmp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(52663916, data.response.from);
              assert.equal(8579619, data.response.to);
              assert.equal(-50743183, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceIcmp6 - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceIcmp6('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('anim in', data.response.uid);
              assert.equal('ad', data.response.name);
              assert.equal('labore se', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal(-62111901, data.response.icmp-type);
              assert.equal(-26715599, data.response.icmp-code);
              assert.equal(true, data.response.keep-connections-open-after-policy-installation);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(false, data.response.read-only);
              assert.equal('ex dolore exercitation', data.response.comments);
              assert.equal('mollit ad offi', data.response.color);
              assert.equal('adipisicing ad ut', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceIcmp6 - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceIcmp6('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('non ad', data.response.uid);
              assert.equal('anim consectetur', data.response.name);
              assert.equal('Duis in aute elit', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal(68253064, data.response.icmp-type);
              assert.equal(false, data.response.keep-connections-open-after-policy-installation);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('aliquip', data.response.comments);
              assert.equal('veniam ad commodo amet incididunt', data.response.color);
              assert.equal('ad Duis eu veniam', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceIcmp6 - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceIcmp6('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('irure', data.response.uid);
              assert.equal('ex dolore nulla aliquip', data.response.name);
              assert.equal('dolor', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal(-98410503, data.response.icmp-type);
              assert.equal(-83722001, data.response.icmp-code);
              assert.equal(true, data.response.keep-connections-open-after-policy-installation);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('ullamco quis sed veniam sint', data.response.comments);
              assert.equal('Excepteur exercitation', data.response.color);
              assert.equal('culpa aliqua Lorem amet voluptate', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceIcmp6 - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceIcmp6('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('nisi eiusmod Duis culpa', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServicesIcmp6 - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesIcmp6('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(34405776, data.response.from);
              assert.equal(-13305557, data.response.to);
              assert.equal(25003310, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceSctp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceSctp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('dolor officia cupidatat', data.response.uid);
              assert.equal('veniam', data.response.name);
              assert.equal('velit Lo', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('ame', data.response.comments);
              assert.equal('labore dolor voluptate sit dolor', data.response.color);
              assert.equal('sit officia Duis dolore', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(true, data.response.keep-connections-open-after-policy-installation);
              assert.equal(-12941852, data.response.session-timeout);
              assert.equal(true, data.response.use-default-session-timeout);
              assert.equal(false, data.response.match-for-any);
              assert.equal(false, data.response.sync-connections-on-cluster);
              assert.equal('object', typeof data.response.aggressive-aging);
              assert.equal('consequat consectetur cupidatat aliqua', data.response.port);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceSctp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceSctp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('dolore ipsum irure pariatur', data.response.uid);
              assert.equal('elit ut', data.response.name);
              assert.equal('eu', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(false, data.response.read-only);
              assert.equal('in ', data.response.comments);
              assert.equal('dolore', data.response.color);
              assert.equal('ut officia magna exercitation anim', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(false, data.response.keep-connections-open-after-policy-installation);
              assert.equal(16127650, data.response.session-timeout);
              assert.equal(true, data.response.use-default-session-timeout);
              assert.equal(false, data.response.match-for-any);
              assert.equal(true, data.response.sync-connections-on-cluster);
              assert.equal('object', typeof data.response.aggressive-aging);
              assert.equal('sint pariatur aliqua laboris esse', data.response.port);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceSctp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceSctp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('exercita', data.response.uid);
              assert.equal('aliquip cupidatat', data.response.name);
              assert.equal('adipisicing nulla', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(false, data.response.read-only);
              assert.equal('veniam tempor do Lorem in', data.response.comments);
              assert.equal('aliqua', data.response.color);
              assert.equal('fugiat reprehenderit', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(true, data.response.keep-connections-open-after-policy-installation);
              assert.equal(26417724, data.response.session-timeout);
              assert.equal(false, data.response.use-default-session-timeout);
              assert.equal(false, data.response.match-for-any);
              assert.equal(true, data.response.sync-connections-on-cluster);
              assert.equal('object', typeof data.response.aggressive-aging);
              assert.equal('amet sunt pariatur', data.response.port);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceSctp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceSctp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('pariatur nostrud velit magna officia', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServicesSctp - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesSctp('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-32024796, data.response.from);
              assert.equal(53329560, data.response.to);
              assert.equal(80828168, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceOther - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceOther('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('in elit non', data.response.uid);
              assert.equal('cillum', data.response.name);
              assert.equal('non aliqua ut nulla', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(false, data.response.read-only);
              assert.equal('et veniam magna officia', data.response.comments);
              assert.equal('quis dolore', data.response.color);
              assert.equal('consectetur', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(true, data.response.keep-connections-open-after-policy-installation);
              assert.equal(26642072, data.response.session-timeout);
              assert.equal(true, data.response.use-default-session-timeout);
              assert.equal(false, data.response.match-for-any);
              assert.equal(true, data.response.sync-connections-on-cluster);
              assert.equal('object', typeof data.response.aggressive-aging);
              assert.equal(-36872590, data.response.ip-protocol);
              assert.equal(false, data.response.accept-replies);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceOther - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceOther('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('tempor', data.response.uid);
              assert.equal('dolore velit do consectetur', data.response.name);
              assert.equal('cupidatat qui incididunt', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('sint', data.response.comments);
              assert.equal('et nulla', data.response.color);
              assert.equal('laboris', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(true, data.response.keep-connections-open-after-policy-installation);
              assert.equal(1740177, data.response.session-timeout);
              assert.equal(false, data.response.use-default-session-timeout);
              assert.equal(false, data.response.match-for-any);
              assert.equal(false, data.response.sync-connections-on-cluster);
              assert.equal('object', typeof data.response.aggressive-aging);
              assert.equal(43333881, data.response.ip-protocol);
              assert.equal(true, data.response.accept-replies);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceOther - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceOther('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('minim', data.response.uid);
              assert.equal('non sit sunt', data.response.name);
              assert.equal('ut sed qui', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('enim aute', data.response.comments);
              assert.equal('velit', data.response.color);
              assert.equal('aliquip irure exercitation', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(false, data.response.keep-connections-open-after-policy-installation);
              assert.equal(-67793056, data.response.session-timeout);
              assert.equal(false, data.response.use-default-session-timeout);
              assert.equal(false, data.response.match-for-any);
              assert.equal(true, data.response.sync-connections-on-cluster);
              assert.equal('object', typeof data.response.aggressive-aging);
              assert.equal(-35938039, data.response.ip-protocol);
              assert.equal(false, data.response.accept-replies);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceOther - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceOther('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('minim fugiat adipisicing ipsum', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServicesOther - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesOther('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-46765594, data.response.from);
              assert.equal(73202306, data.response.to);
              assert.equal(-92400480, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceGroup('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceGroup('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceGroup('fakedata', 'fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceGroup('fakedata', 'fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceGroups - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceGroups('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddApplicationSite - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddApplicationSite('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowApplicationSite - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSite('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetApplicationSite - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApplicationSite('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteApplicationSite - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteApplicationSite('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowApplicationSites - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSites('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddApplicationSiteCategory - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddApplicationSiteCategory('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowApplicationSiteCategory - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSiteCategory('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetApplicationSiteCategory - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApplicationSiteCategory('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteApplicationSiteCategory - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteApplicationSiteCategory('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowApplicationSiteCategories - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSiteCategories('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddApplicationSiteGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddApplicationSiteGroup('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowApplicationSiteGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSiteGroup('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetApplicationSiteGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApplicationSiteGroup('fakedata', 'fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteApplicationSiteGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteApplicationSiteGroup('fakedata', 'fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowApplicationSiteGroups - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSiteGroups('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceDceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceDceRpc('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('fugiat incididunt magna est', data.response.uid);
              assert.equal('elit tempor cillum nisi', data.response.name);
              assert.equal('nulla laboris', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('ipsum cupidatat elit', data.response.comments);
              assert.equal('cupidatat in mollit elit voluptate', data.response.color);
              assert.equal('nostrud dolore', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(false, data.response.keep-connections-open-after-policy-installation);
              assert.equal('quis', data.response.interface-uuid);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceDceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceDceRpc('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('nulla id anim', data.response.uid);
              assert.equal('Duis', data.response.name);
              assert.equal('enim quis irure ad', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('dolore Ut magna mollit ullamco', data.response.comments);
              assert.equal('velit in', data.response.color);
              assert.equal('culpa', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(true, data.response.keep-connections-open-after-policy-installation);
              assert.equal('Duis aute in adipisicing', data.response.interface-uuid);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceDceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceDceRpc('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('cupidatat sed consequat sint', data.response.uid);
              assert.equal('exercitation cupidatat incididunt', data.response.name);
              assert.equal('minim', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('ut Duis nisi', data.response.comments);
              assert.equal('sit Lorem', data.response.color);
              assert.equal('Lorem', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(true, data.response.keep-connections-open-after-policy-installation);
              assert.equal('culpa Ut ipsum ut in', data.response.interface-uuid);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceDceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceDceRpc('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('pariatur e', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServicesDceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesDceRpc('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-63734542, data.response.from);
              assert.equal(30837324, data.response.to);
              assert.equal(27119140, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceRpc('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('eu Lorem dolor', data.response.message);
              assert.equal('occaecat cupidatat', data.response.code);
              assert.equal(true, Array.isArray(data.response.errors));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceRpc('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('ex deserunt in exercitation anim', data.response.uid);
              assert.equal('dolor nisi dolor nulla', data.response.name);
              assert.equal('non', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('', data.response.comments);
              assert.equal('fugiat', data.response.color);
              assert.equal('in dolor', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(false, data.response.keep-connections-open-after-policy-installation);
              assert.equal(95306502, data.response.program-number);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceRpc('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('ea in', data.response.uid);
              assert.equal('culpa', data.response.name);
              assert.equal('sunt commodo consequat est', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('fugiat sunt quis aute occaecat', data.response.comments);
              assert.equal('officia', data.response.color);
              assert.equal('offici', data.response.icon);
              assert.equal(true, Array.isArray(data.response.groups));
              assert.equal(false, data.response.keep-connections-open-after-policy-installation);
              assert.equal(-57672473, data.response.program-number);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceRpc('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('do est eu laboris sed', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServicesRpc - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesRpc('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(48574350, data.response.from);
              assert.equal(75878895, data.response.to);
              assert.equal(33438161, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddAccessRule - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAccessRule('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('dolore dolore occaecat Excepteur', data.response.uid);
              assert.equal('consectetur sunt', data.response.name);
              assert.equal('irure est aute', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal(false, data.response.enabled);
              assert.equal('nisi anim minim laborum ullamco', data.response.comments);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.install-on));
              assert.equal(true, Array.isArray(data.response.source));
              assert.equal(false, data.response.source-negate);
              assert.equal(true, Array.isArray(data.response.destination));
              assert.equal(false, data.response.destination-negate);
              assert.equal(true, Array.isArray(data.response.service));
              assert.equal(true, data.response.service-negate);
              assert.equal(true, Array.isArray(data.response.vpn));
              assert.equal('object', typeof data.response.action);
              assert.equal('object', typeof data.response.action-settings);
              assert.equal(true, Array.isArray(data.response.content));
              assert.equal(false, data.response.content-negate);
              assert.equal('e', data.response.content-direction);
              assert.equal('object', typeof data.response.track);
              assert.equal('cupidatat nisi minim occaecat', data.response.track-alert);
              assert.equal(true, Array.isArray(data.response.time));
              assert.equal('object', typeof data.response.custom-fields);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAccessRulebase - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessRulebase('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-1752590, data.response.from);
              assert.equal(62092761, data.response.to);
              assert.equal(-17743059, data.response.total);
              assert.equal('nulla esse fugiat qui in', data.response.name);
              assert.equal('laborum in voluptate', data.response.uid);
              assert.equal(true, Array.isArray(data.response.rulebase));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAccessRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessRule('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetAccessRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAccessRule('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteAccessRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAccessRule('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddAccessSection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAccessSection('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAccessSection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessSection('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetAccessSection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAccessSection('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteAccessSection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAccessSection('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddAccessLayer - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAccessLayer('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('sed laborum ea', data.response.uid);
              assert.equal('object', typeof data.response.folder);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('Lorem adipisicing', data.response.name);
              assert.equal('labore in in adipisicing', data.response.comments);
              assert.equal('cupidatat nulla adipisicing enim qui', data.response.color);
              assert.equal('deserunt in do f', data.response.icon);
              assert.equal(true, data.response.applications-and-url-filtering);
              assert.equal(false, data.response.content-awareness);
              assert.equal(true, data.response.mobile-access);
              assert.equal(false, data.response.show-parent-rule);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAccessLayer - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessLayer('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetAccessLayer - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAccessLayer('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('aliquip in nostrud occaecat', data.response.uid);
              assert.equal('object', typeof data.response.folder);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('dolore', data.response.name);
              assert.equal('enim officia', data.response.comments);
              assert.equal('dolor Duis', data.response.color);
              assert.equal('id aliquip ad', data.response.icon);
              assert.equal(true, data.response.applications-and-url-filtering);
              assert.equal(false, data.response.content-awareness);
              assert.equal(false, data.response.mobile-access);
              assert.equal(false, data.response.show-parent-rule);
              assert.equal(true, data.response.detect-using-x-forward-for);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteAccessLayer - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAccessLayer('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAccessLayers - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessLayers('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddNatRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddNatRule('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowNatRulebase - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNatRulebase('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(74709302, data.response.from);
              assert.equal(94405289, data.response.to);
              assert.equal(-75898205, data.response.total);
              assert.equal('id proident ipsum minim', data.response.uid);
              assert.equal(true, Array.isArray(data.response.rulebase));
              assert.equal(true, Array.isArray(data.response.objects-dictionary));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowNatRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNatRule('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetNatRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetNatRule('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteNatRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteNatRule('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddNatSection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddNatSection('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowNatSection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNatSection('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetNatSection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetNatSection('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteNatSection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteNatSection('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddVpnCommunityMeshed - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddVpnCommunityMeshed('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('sunt proident ut aliqua', data.response.uid);
              assert.equal('laborum labore laboris', data.response.name);
              assert.equal('aliqua irure d', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('elit', data.response.comments);
              assert.equal('ullam', data.response.color);
              assert.equal('sint in', data.response.icon);
              assert.equal(true, data.response.use-shared-secret);
              assert.equal('in', data.response.encryption-method);
              assert.equal('in exercitation irure', data.response.encryption-suite);
              assert.equal('object', typeof data.response.ike-phase-1);
              assert.equal('object', typeof data.response.ike-phase-2);
              assert.equal(true, Array.isArray(data.response.gateways));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowVpnCommunityMeshed - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowVpnCommunityMeshed('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('in enim laborum', data.response.uid);
              assert.equal('occaecat', data.response.name);
              assert.equal('veniam voluptate', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('quis sed deserunt', data.response.comments);
              assert.equal('consectetur', data.response.color);
              assert.equal('dol', data.response.icon);
              assert.equal(true, data.response.use-shared-secret);
              assert.equal('dolor mollit ut nostrud amet', data.response.encryption-method);
              assert.equal('veniam non', data.response.encryption-suite);
              assert.equal('object', typeof data.response.ike-phase-1);
              assert.equal('object', typeof data.response.ike-phase-2);
              assert.equal(true, Array.isArray(data.response.gateways));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetVpnCommunityMeshed - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetVpnCommunityMeshed('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('nisi culpa', data.response.uid);
              assert.equal('occaecat dolor irure', data.response.name);
              assert.equal('magna exercitation laboris ad dolore', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(false, data.response.read-only);
              assert.equal('pariatur eiusmod nulla', data.response.comments);
              assert.equal('exercitation', data.response.color);
              assert.equal('pariatur officia in', data.response.icon);
              assert.equal(false, data.response.use-shared-secret);
              assert.equal('dolore laboris', data.response.encryption-method);
              assert.equal('Lorem in occaecat reprehenderit', data.response.encryption-suite);
              assert.equal('object', typeof data.response.ike-phase-1);
              assert.equal('object', typeof data.response.ike-phase-2);
              assert.equal(true, Array.isArray(data.response.gateways));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteVpnCommunityMeshed - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteVpnCommunityMeshed('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowVpnCommunitiesMeshed - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowVpnCommunitiesMeshed('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-85498550, data.response.from);
              assert.equal(11003418, data.response.to);
              assert.equal(-10447601, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddVpnCommunityStar - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddVpnCommunityStar('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('in laborum sed reprehenderit nulla', data.response.uid);
              assert.equal('sint', data.response.name);
              assert.equal('ut anim Duis dolore laboris', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(false, data.response.read-only);
              assert.equal('cillum', data.response.comments);
              assert.equal('aliquip amet sunt', data.response.color);
              assert.equal('esse laborum', data.response.icon);
              assert.equal(true, data.response.use-shared-secret);
              assert.equal('lab', data.response.encryption-method);
              assert.equal('sit commodo labore irure', data.response.encryption-suite);
              assert.equal('object', typeof data.response.ike-phase-1);
              assert.equal('object', typeof data.response.ike-phase-2);
              assert.equal(true, Array.isArray(data.response.center-gateways));
              assert.equal(true, Array.isArray(data.response.satellite-gateways));
              assert.equal(false, data.response.mesh-center-gateways);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowVpnCommunityStar - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowVpnCommunityStar('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('proident', data.response.uid);
              assert.equal('nostrud', data.response.name);
              assert.equal('Duis culpa amet sint elit', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('Excepteur ex', data.response.comments);
              assert.equal('amet commodo irure do non', data.response.color);
              assert.equal('cupidatat', data.response.icon);
              assert.equal(true, data.response.use-shared-secret);
              assert.equal('dolore velit', data.response.encryption-method);
              assert.equal('exercitation ex reprehenderit', data.response.encryption-suite);
              assert.equal('object', typeof data.response.ike-phase-1);
              assert.equal('object', typeof data.response.ike-phase-2);
              assert.equal(true, Array.isArray(data.response.center-gateways));
              assert.equal(true, Array.isArray(data.response.satellite-gateways));
              assert.equal(true, data.response.mesh-center-gateways);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetVpnCommunityStar - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetVpnCommunityStar('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('do', data.response.uid);
              assert.equal('veniam voluptate eiusmod', data.response.name);
              assert.equal('ad dolor', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(true, data.response.read-only);
              assert.equal('Excepteur amet magna', data.response.comments);
              assert.equal('et voluptate eu aute', data.response.color);
              assert.equal('aute veniam', data.response.icon);
              assert.equal(true, data.response.use-shared-secret);
              assert.equal('irure dolor pariatur esse culpa', data.response.encryption-method);
              assert.equal('anim deserunt dolore', data.response.encryption-suite);
              assert.equal('object', typeof data.response.ike-phase-1);
              assert.equal('object', typeof data.response.ike-phase-2);
              assert.equal(true, Array.isArray(data.response.center-gateways));
              assert.equal(true, Array.isArray(data.response.satellite-gateways));
              assert.equal(false, data.response.mesh-center-gateways);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteVpnCommunityStar - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteVpnCommunityStar('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowVpnCommunitiesStar - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowVpnCommunitiesStar('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-51618520, data.response.from);
              assert.equal(17333376, data.response.to);
              assert.equal(1598696, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddThreatRule - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatRule('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('in', data.response.uid);
              assert.equal(false, data.response.enabled);
              assert.equal('mollit aliqua consectetur exercitation', data.response.comments);
              assert.equal('object', typeof data.response.folder);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.install-on));
              assert.equal(true, Array.isArray(data.response.source));
              assert.equal(false, data.response.source-negate);
              assert.equal(true, Array.isArray(data.response.destination));
              assert.equal(true, data.response.destination-negate);
              assert.equal(true, Array.isArray(data.response.service));
              assert.equal(false, data.response.service-negate);
              assert.equal(true, Array.isArray(data.response.protected-scope));
              assert.equal(false, data.response.protected-scope-negate);
              assert.equal('', data.response.name);
              assert.equal('object', typeof data.response.track);
              assert.equal('object', typeof data.response.track-settings);
              assert.equal('object', typeof data.response.action);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatRulebase - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatRulebase('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-89835912, data.response.from);
              assert.equal(-30731290, data.response.to);
              assert.equal(-46605725, data.response.total);
              assert.equal('fugiat commodo dolore reprehenderit officia', data.response.name);
              assert.equal('magna incididunt Lorem reprehenderit', data.response.uid);
              assert.equal(true, Array.isArray(data.response.rulebase));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatRule('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetThreatRule - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatRule('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('in fugiat velit proident et', data.response.uid);
              assert.equal(false, data.response.enabled);
              assert.equal('mollit', data.response.comments);
              assert.equal('object', typeof data.response.folder);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.install-on));
              assert.equal(true, Array.isArray(data.response.source));
              assert.equal(true, data.response.source-negate);
              assert.equal(true, Array.isArray(data.response.destination));
              assert.equal(false, data.response.destination-negate);
              assert.equal(true, Array.isArray(data.response.service));
              assert.equal(true, data.response.service-negate);
              assert.equal(true, Array.isArray(data.response.protected-scope));
              assert.equal(true, data.response.protected-scope-negate);
              assert.equal('ut', data.response.name);
              assert.equal('object', typeof data.response.track);
              assert.equal('object', typeof data.response.track-settings);
              assert.equal('object', typeof data.response.action);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteThreatRule - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatRule('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddThreatException - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatException('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('quis ame', data.response.uid);
              assert.equal(false, data.response.enabled);
              assert.equal('enim pariatur', data.response.comments);
              assert.equal('object', typeof data.response.folder);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.install-on));
              assert.equal(true, Array.isArray(data.response.source));
              assert.equal(false, data.response.source-negate);
              assert.equal(true, Array.isArray(data.response.destination));
              assert.equal(true, data.response.destination-negate);
              assert.equal(true, Array.isArray(data.response.service));
              assert.equal(true, data.response.service-negate);
              assert.equal(true, Array.isArray(data.response.protected-scope));
              assert.equal(false, data.response.protected-scope-negate);
              assert.equal(true, Array.isArray(data.response.protection-or-site));
              assert.equal('in sed sint elit ullamco', data.response.name);
              assert.equal('object', typeof data.response.track);
              assert.equal('object', typeof data.response.action);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatRuleExceptionRulebase - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatRuleExceptionRulebase('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('veniam aliqua', data.response.uid);
              assert.equal('eiusmod magna mollit deserunt', data.response.name);
              assert.equal(true, Array.isArray(data.response.rulebase));
              assert.equal(-97532410, data.response.total);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatException - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatException('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('cillum aliqua incididunt qui in', data.response.uid);
              assert.equal(false, data.response.enabled);
              assert.equal('sunt tempor enim do mo', data.response.comments);
              assert.equal('object', typeof data.response.folder);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.install-on));
              assert.equal(true, Array.isArray(data.response.source));
              assert.equal(false, data.response.source-negate);
              assert.equal(true, Array.isArray(data.response.destination));
              assert.equal(true, data.response.destination-negate);
              assert.equal(true, Array.isArray(data.response.service));
              assert.equal(true, data.response.service-negate);
              assert.equal(true, Array.isArray(data.response.protected-scope));
              assert.equal(false, data.response.protected-scope-negate);
              assert.equal(true, Array.isArray(data.response.protection-or-site));
              assert.equal('eu', data.response.name);
              assert.equal('object', typeof data.response.track);
              assert.equal('object', typeof data.response.action);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetThreatException - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatException('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('occaecat velit dolor ullamco', data.response.uid);
              assert.equal(true, data.response.enabled);
              assert.equal('do ullamco incididunt labore', data.response.comments);
              assert.equal('object', typeof data.response.folder);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.install-on));
              assert.equal(true, Array.isArray(data.response.source));
              assert.equal(false, data.response.source-negate);
              assert.equal(true, Array.isArray(data.response.destination));
              assert.equal(true, data.response.destination-negate);
              assert.equal(true, Array.isArray(data.response.service));
              assert.equal(false, data.response.service-negate);
              assert.equal(true, Array.isArray(data.response.protected-scope));
              assert.equal(false, data.response.protected-scope-negate);
              assert.equal(true, Array.isArray(data.response.protection-or-site));
              assert.equal('commodo', data.response.name);
              assert.equal('object', typeof data.response.track);
              assert.equal('object', typeof data.response.action);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteThreatException - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatException('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddExceptionGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddExceptionGroup('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowExceptionGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowExceptionGroup('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetExceptionGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetExceptionGroup('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteExceptionGroup - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteExceptionGroup('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowExceptionGroups - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowExceptionGroups('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatProtection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatProtection('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetThreatProtection - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatProtection('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatProtections - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatProtections('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddThreatProtections - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatProtections('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('nostrud mollit in', data.response.task-id);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteThreatProtections - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatProtections('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddThreatProfile - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatProfile('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatProfile - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatProfile('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetThreatProfile - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatProfile('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteThreatProfile - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatProfile('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatProfiles - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatProfiles('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddThreatIndicator - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatIndicator('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatIndicator - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatIndicator('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('nisi ullamco anim voluptate culpa', data.response.uid);
              assert.equal('laborum exercitation sunt fugiat reprehenderit', data.response.name);
              assert.equal('magna', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(false, data.response.read-only);
              assert.equal('a', data.response.comments);
              assert.equal('officia Excepteur', data.response.icon);
              assert.equal('fugiat nulla dolore', data.response.action);
              assert.equal(-47863287, data.response.number-of-observables);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetThreatIndicator - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatIndicator('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('nulla eiusmod', data.response.uid);
              assert.equal('deserunt', data.response.name);
              assert.equal('exercitation in', data.response.type);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal(false, data.response.read-only);
              assert.equal('in laborum consectetur', data.response.comments);
              assert.equal('comm', data.response.icon);
              assert.equal('cupidatat tempor', data.response.action);
              assert.equal(-99604288, data.response.number-of-observables);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteThreatIndicator - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatIndicator('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatIndicators - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatIndicators('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-21341511, data.response.from);
              assert.equal(-5258649, data.response.to);
              assert.equal(-27417259, data.response.total);
              assert.equal(true, Array.isArray(data.response.indicators));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddThreatLayer - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatLayer('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatLayer - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatLayer('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetThreatLayer - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatLayer('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteThreatLayer - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatLayer('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatLayers - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatLayers('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-54483007, data.response.from);
              assert.equal(51402381, data.response.to);
              assert.equal(-94232457, data.response.total);
              assert.equal(true, Array.isArray(data.response.threat-layers));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowIpsUpdateSchedule - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowIpsUpdateSchedule('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(true, data.response.enabled);
              assert.equal('elit consectetur amet veniam officia', data.response.time);
              assert.equal('object', typeof data.response.recurrence);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetIpsUpdateSchedule - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetIpsUpdateSchedule('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(false, data.response.enabled);
              assert.equal('object', typeof data.response.recurrence);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postRunIpsUpdate - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postRunIpsUpdate('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('irure eiusmod', data.response.task-id);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowIpsStatus - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowIpsStatus('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('object', typeof data.response.last-updated);
              assert.equal('sunt ut minim', data.response.installed-version);
              assert.equal('object', typeof data.response.installed-version-creation-time);
              assert.equal(true, data.response.update-available);
              assert.equal('non sunt sint', data.response.latest-version);
              assert.equal('object', typeof data.response.latest-version-creation-time);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowIpsProtectionExtendedAttribute - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowIpsProtectionExtendedAttribute('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('object', typeof data.response.object);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowIpsProtectionExtendedAttributes - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowIpsProtectionExtendedAttributes('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-26127776, data.response.from);
              assert.equal(57261353, data.response.to);
              assert.equal(73979177, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postRunThreatEmulationFileTypesOfflineUpdate - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postRunThreatEmulationFileTypesOfflineUpdate('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('aliqua reprehenderit magna dolore', data.response.message);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postVerifyPolicy - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postVerifyPolicy('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postInstallPolicy - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postInstallPolicy('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddPackage - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postAddPackage('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('quis', data.response.uid);
              assert.equal('object', typeof data.response.folder);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('amet', data.response.name);
              assert.equal('esse officia cillum ut pariatur', data.response.comments);
              assert.equal('do ea adipisicing enim', data.response.color);
              assert.equal('sint', data.response.icon);
              assert.equal(true, data.response.access);
              assert.equal(true, Array.isArray(data.response.access-layers));
              assert.equal(true, data.response.vpn-traditional-mode);
              assert.equal(false, data.response.nat-policy);
              assert.equal(true, data.response.qos);
              assert.equal('magna', data.response.qos-policy-type);
              assert.equal(false, data.response.desktop-security);
              assert.equal(false, data.response.threat-prevention);
              assert.equal('a', data.response.installation-targets);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowPackage - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowPackage('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetPackage - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postSetPackage('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('adipisicing in qui est sit', data.response.uid);
              assert.equal('object', typeof data.response.folder);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('qui', data.response.name);
              assert.equal('non minim mollit ullamco', data.response.comments);
              assert.equal('culpa aliqua', data.response.color);
              assert.equal('sed officia cupidatat in nulla', data.response.icon);
              assert.equal(true, data.response.access);
              assert.equal(true, Array.isArray(data.response.access-layers));
              assert.equal(true, Array.isArray(data.response.threat-layers));
              assert.equal(false, data.response.vpn-traditional-mode);
              assert.equal(false, data.response.nat-policy);
              assert.equal(false, data.response.qos);
              assert.equal('nulla proident elit u', data.response.qos-policy-type);
              assert.equal(true, data.response.desktop-security);
              assert.equal(false, data.response.threat-prevention);
              assert.equal('nostrud occaecat', data.response.installation-targets);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeletePackage - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeletePackage('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowPackages - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowPackages('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddDomain - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddDomain('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDomain - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDomain('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetDomain - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetDomain('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteDomain - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteDomain('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDomains - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDomains('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowGlobalDomain - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGlobalDomain('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetGlobalDomain - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGlobalDomain('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowMds - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowMds('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowMdss - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowMdss('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-29383185, data.response.from);
              assert.equal(-74134151, data.response.to);
              assert.equal(-34316681, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowPlaceHolder - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowPlaceHolder('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('deserunt culpa in', data.response.uid);
              assert.equal('object', typeof data.response.folder);
              assert.equal('object', typeof data.response.domain);
              assert.equal('object', typeof data.response.meta-info);
              assert.equal(true, Array.isArray(data.response.tags));
              assert.equal('ad in in', data.response.comments);
              assert.equal('aliqua irure Duis id do', data.response.color);
              assert.equal('ut reprehenderit', data.response.icon);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddGlobalAssignment - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddGlobalAssignment('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowGlobalAssignment - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGlobalAssignment('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetGlobalAssignment - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGlobalAssignment('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteGlobalAssignment - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteGlobalAssignment('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowGlobalAssignments - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGlobalAssignments('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAssignGlobalAssignment - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAssignGlobalAssignment('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postWhereUsed - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postWhereUsed('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('object', typeof data.response.used-directly);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTask - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTask('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postRunScript - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postRunScript('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowUnusedObjects - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowUnusedObjects('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postExport - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postExport('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowChanges - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowChanges('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(true, Array.isArray(data.response.tasks));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowGatewaysAndServers - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGatewaysAndServers('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(5531452, data.response.from);
              assert.equal(45149289, data.response.to);
              assert.equal(37195978, data.response.total);
              assert.equal(true, Array.isArray(data.response.objects));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowObjects - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowObjects('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowValidations - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowValidations('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal(-37323100, data.response.warnings-total);
              assert.equal(-71537950, data.response.errors-total);
              assert.equal(26698572, data.response.blocking-errors-total);
              assert.equal(true, Array.isArray(data.response.warnings));
              assert.equal(true, Array.isArray(data.response.errors));
              assert.equal(true, Array.isArray(data.response.blocking-errors));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTasks - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTasks('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowApiVersions - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApiVersions('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('labore sit non eu', data.response.current-version);
              assert.equal(true, Array.isArray(data.response.supported-versions));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowObject - errors', () => {
      it('should work if integrated or standalone with mockdata', (done) => {
        const p = new Promise((resolve) => {
          a.postShowObject('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.equal('object', typeof data.response.object);
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowCommands - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowCommands('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postPutFile - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postPutFile('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddAdministrator - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAdministrator('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAdministrator - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAdministrator('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetAdministrator - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAdministrator('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteAdministrator - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAdministrator('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAdministrators - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAdministrators('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postUnlockAdministrator - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postUnlockAdministrator('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowApiSettings - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApiSettings('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetApiSettings - errors', () => {
      it('should work if integrated but since no mockdata should error when run standalone', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApiSettings('fakedata', 'fakedata', 'fakedata', (data, error) => {
            resolve(data);

            if (stub) {
              assert.notEqual(undefined, error);
              assert.notEqual(null, error);
              assert.equal(null, data);
              assert.equal('AD.500', error.icode);
              assert.equal('Error 400 received on request', error.IAPerror.displayString);
              const temp = 'no mock data for';
              assert.equal(0, error.IAPerror.raw_response.message.indexOf(temp));
            } else {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(null, data.response);
            }

            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });
  });
});
