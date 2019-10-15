// Set globals
/* global describe it log pronghornProps */
/* eslint no-underscore-dangle: warn  */
/* eslint camelcase: warn  */
/* eslint quote-props: warn  */
/* eslint quotes: ["warn", "single"]  */

// include required items for testing & logging
const assert = require('assert');
const fs = require('fs');
const winston = require('winston');


// stub and attemptTimeout are used throughout the code so set them here
//    stub may be commented out for now due to automatic parsing of properties
// const stub = false;
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
        'version': '',
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
describe('[unit] Checkpoint Adapter Test', () => {
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

    describe('package.json', () => {
      it('should have a package.json', (done) => {
        fs.exists('package.json', (val) => {
          assert.equal(true, val);
          done();
        });
      });
    });

    describe('pronghorn.json', () => {
      it('should have a pronghorn.json', (done) => {
        fs.exists('pronghorn.json', (val) => {
          assert.equal(true, val);
          done();
        });
      });
    });

    describe('propertiesSchema.json', () => {
      it('should have a propertiesSchema.json', (done) => {
        fs.exists('propertiesSchema.json', (val) => {
          assert.equal(true, val);
          done();
        });
      });
    });

    describe('error.json', () => {
      it('should have an error.json', (done) => {
        fs.exists('error.json', (val) => {
          assert.equal(true, val);
          done();
        });
      });
    });

    describe('README.md', () => {
      it('should have a README', (done) => {
        fs.exists('README.md', (val) => {
          assert.equal(true, val);
          done();
        });
      });
    });

    describe('#connect', () => {
      it('should have a connect function', (done) => {
        assert.equal(true, typeof a.connect === 'function');
        done();
      });
    });

    describe('#healthCheck', () => {
      it('should have a healthCheck function', (done) => {
        assert.equal(true, typeof a.healthCheck === 'function');
        done();
      });
    });

    describe('#checkActionFiles', () => {
      it('should have a checkActionFiles function', (done) => {
        assert.equal(true, typeof a.checkActionFiles === 'function');
        done();
      });
      it('should be good', (done) => {
        const clean = a.checkActionFiles();
        assert.equal(true, clean);
        done();
      }).timeout(attemptTimeout);
    });

    describe('#encryptProperty', () => {
      it('should have a encryptProperty function', (done) => {
        assert.equal(true, typeof a.encryptProperty === 'function');
        done();
      });
      it('should get base64 encoded property', (done) => {
        const p = new Promise((resolve) => {
          a.encryptProperty('testing', 'base64', (data, error) => {
            resolve(data);
            assert.equal(undefined, error);
            assert.notEqual(undefined, data);
            assert.notEqual(null, data);
            assert.notEqual(undefined, data.response);
            assert.notEqual(null, data.response);
            assert.equal(0, data.response.indexOf('{code}'));
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should get encrypted property', (done) => {
        const p = new Promise((resolve) => {
          a.encryptProperty('testing', 'encrypt', (data, error) => {
            resolve(data);
            assert.equal(undefined, error);
            assert.notEqual(undefined, data);
            assert.notEqual(null, data);
            assert.notEqual(undefined, data.response);
            assert.notEqual(null, data.response);
            assert.equal(0, data.response.indexOf('{crypt}'));
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    // describe('#hasEntity', () => {
    //   it('should have a hasEntity function', (done) => {
    //     assert.equal(true, typeof a.hasEntity === 'function');
    //     done();
    //   });
    //   it('should find entity', (done) => {
    //     const p = new Promise((resolve) => {
    //       a.hasEntity('template_entity', // 'a9e9c33dc61122760072455df62663d2', (data) => {
    //         resolve(data);
    //         assert.equal(true, data[0]);
    //         done();
    //       });
    //     });
    //     // log just done to get rid of const lint issue!
    //     log.debug(p);
    //   }).timeout(attemptTimeout);
    //   it('should not find entity', (done) => {
    //     const p = new Promise((resolve) => {
    //       a.hasEntity('template_entity', 'blah', (data) => {
    //         resolve(data);
    //         assert.equal(false, data[0]);
    //         done();
    //       });
    //     });
    //     // log just done to get rid of const lint issue!
    //     log.debug(p);
    //   }).timeout(attemptTimeout);
    // });

    describe('#postLogin - errors', () => {
      it('should have a postLogin function', (done) => {
        assert.equal(true, typeof a.postLogin === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postLogin(null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postLogin', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postLogin('fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postLogin', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postPublish - errors', () => {
      it('should have a postPublish function', (done) => {
        assert.equal(true, typeof a.postPublish === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postPublish(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postPublish', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postPublish('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postPublish', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postPublish('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postPublish', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDiscard - errors', () => {
      it('should have a postDiscard function', (done) => {
        assert.equal(true, typeof a.postDiscard === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDiscard(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDiscard', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDiscard('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDiscard', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDiscard('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDiscard', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postLogout - errors', () => {
      it('should have a postLogout function', (done) => {
        assert.equal(true, typeof a.postLogout === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postLogout(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postLogout', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postLogout('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postLogout', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postLogout('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postLogout', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDisconnect - errors', () => {
      it('should have a postDisconnect function', (done) => {
        assert.equal(true, typeof a.postDisconnect === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDisconnect(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDisconnect', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDisconnect('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDisconnect', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDisconnect('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDisconnect', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postKeepalive - errors', () => {
      it('should have a postKeepalive function', (done) => {
        assert.equal(true, typeof a.postKeepalive === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postKeepalive(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postKeepalive', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postKeepalive('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postKeepalive', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postKeepalive('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postKeepalive', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowSession - errors', () => {
      it('should have a postShowSession function', (done) => {
        assert.equal(true, typeof a.postShowSession === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSession(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSession('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSession('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetSession - errors', () => {
      it('should have a postSetSession function', (done) => {
        assert.equal(true, typeof a.postSetSession === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetSession(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetSession('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetSession('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postContinueSessionInSmartconsole - errors', () => {
      it('should have a postContinueSessionInSmartconsole function', (done) => {
        assert.equal(true, typeof a.postContinueSessionInSmartconsole === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postContinueSessionInSmartconsole(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postContinueSessionInSmartconsole', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postContinueSessionInSmartconsole('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postContinueSessionInSmartconsole', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postContinueSessionInSmartconsole('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postContinueSessionInSmartconsole', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowLastPublishedSession - errors', () => {
      it('should have a postShowLastPublishedSession function', (done) => {
        assert.equal(true, typeof a.postShowLastPublishedSession === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowLastPublishedSession(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowLastPublishedSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowLastPublishedSession('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowLastPublishedSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowLastPublishedSession('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowLastPublishedSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postPurgePublishedSessions - errors', () => {
      it('should have a postPurgePublishedSessions function', (done) => {
        assert.equal(true, typeof a.postPurgePublishedSessions === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postPurgePublishedSessions(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postPurgePublishedSessions', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postPurgePublishedSessions('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postPurgePublishedSessions', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postPurgePublishedSessions('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postPurgePublishedSessions', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSwitchSession - errors', () => {
      it('should have a postSwitchSession function', (done) => {
        assert.equal(true, typeof a.postSwitchSession === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSwitchSession(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSwitchSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSwitchSession('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSwitchSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSwitchSession('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSwitchSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAssignSession - errors', () => {
      it('should have a postAssignSession function', (done) => {
        assert.equal(true, typeof a.postAssignSession === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAssignSession(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAssignSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAssignSession('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAssignSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAssignSession('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAssignSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postTakeOverSession - errors', () => {
      it('should have a postTakeOverSession function', (done) => {
        assert.equal(true, typeof a.postTakeOverSession === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postTakeOverSession(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postTakeOverSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postTakeOverSession('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postTakeOverSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postTakeOverSession('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postTakeOverSession', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowSessions - errors', () => {
      it('should have a postShowSessions function', (done) => {
        assert.equal(true, typeof a.postShowSessions === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSessions(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowSessions', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSessions('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowSessions', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSessions('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowSessions', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowLoginMessage - errors', () => {
      it('should have a postShowLoginMessage function', (done) => {
        assert.equal(true, typeof a.postShowLoginMessage === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowLoginMessage(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowLoginMessage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowLoginMessage('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowLoginMessage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowLoginMessage('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowLoginMessage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetLoginMessage - errors', () => {
      it('should have a postSetLoginMessage function', (done) => {
        assert.equal(true, typeof a.postSetLoginMessage === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetLoginMessage(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetLoginMessage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetLoginMessage('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetLoginMessage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetLoginMessage('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetLoginMessage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddHost - errors', () => {
      it('should have a postAddHost function', (done) => {
        assert.equal(true, typeof a.postAddHost === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddHost(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddHost', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddHost('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddHost', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddHost('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddHost', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowHost - errors', () => {
      it('should have a postShowHost function', (done) => {
        assert.equal(true, typeof a.postShowHost === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowHost(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowHost', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowHost('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowHost', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowHost('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowHost', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetHost - errors', () => {
      it('should have a postSetHost function', (done) => {
        assert.equal(true, typeof a.postSetHost === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetHost(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetHost', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetHost('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetHost', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetHost('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetHost', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteHost - errors', () => {
      it('should have a postDeleteHost function', (done) => {
        assert.equal(true, typeof a.postDeleteHost === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteHost(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteHost', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteHost('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteHost', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteHost('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteHost', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowHosts - errors', () => {
      it('should have a postShowHosts function', (done) => {
        assert.equal(true, typeof a.postShowHosts === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowHosts(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowHosts', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowHosts('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowHosts', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowHosts('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowHosts', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddNetwork - errors', () => {
      it('should have a postAddNetwork function', (done) => {
        assert.equal(true, typeof a.postAddNetwork === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddNetwork(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddNetwork', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddNetwork('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddNetwork', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddNetwork('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddNetwork', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowNetwork - errors', () => {
      it('should have a postShowNetwork function', (done) => {
        assert.equal(true, typeof a.postShowNetwork === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNetwork(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowNetwork', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNetwork('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowNetwork', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNetwork('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowNetwork', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetNetwork - errors', () => {
      it('should have a postSetNetwork function', (done) => {
        assert.equal(true, typeof a.postSetNetwork === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetNetwork(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetNetwork', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetNetwork('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetNetwork', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetNetwork('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetNetwork', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteNetwork - errors', () => {
      it('should have a postDeleteNetwork function', (done) => {
        assert.equal(true, typeof a.postDeleteNetwork === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteNetwork(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteNetwork', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteNetwork('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteNetwork', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteNetwork('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteNetwork', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowNetworks - errors', () => {
      it('should have a postShowNetworks function', (done) => {
        assert.equal(true, typeof a.postShowNetworks === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNetworks(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowNetworks', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNetworks('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowNetworks', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNetworks('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowNetworks', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddWildcard - errors', () => {
      it('should have a postAddWildcard function', (done) => {
        assert.equal(true, typeof a.postAddWildcard === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddWildcard(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddWildcard', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddWildcard('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddWildcard', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddWildcard('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddWildcard', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowWildcard - errors', () => {
      it('should have a postShowWildcard function', (done) => {
        assert.equal(true, typeof a.postShowWildcard === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowWildcard(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowWildcard', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowWildcard('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowWildcard', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowWildcard('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowWildcard', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetWildcard - errors', () => {
      it('should have a postSetWildcard function', (done) => {
        assert.equal(true, typeof a.postSetWildcard === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetWildcard(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetWildcard', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetWildcard('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetWildcard', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetWildcard('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetWildcard', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteWildcard - errors', () => {
      it('should have a postDeleteWildcard function', (done) => {
        assert.equal(true, typeof a.postDeleteWildcard === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteWildcard(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteWildcard', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteWildcard('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteWildcard', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteWildcard('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteWildcard', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowWildcards - errors', () => {
      it('should have a postShowWildcards function', (done) => {
        assert.equal(true, typeof a.postShowWildcards === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowWildcards(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowWildcards', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowWildcards('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowWildcards', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowWildcards('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowWildcards', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddGroup - errors', () => {
      it('should have a postAddGroup function', (done) => {
        assert.equal(true, typeof a.postAddGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddGroup(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddGroup('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddGroup('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowGroup - errors', () => {
      it('should have a postShowGroup function', (done) => {
        assert.equal(true, typeof a.postShowGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGroup(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGroup('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGroup('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetGroup - errors', () => {
      it('should have a postSetGroup function', (done) => {
        assert.equal(true, typeof a.postSetGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGroup(null, null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Ses', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGroup('fakeparam', null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Ses is required for postSetGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGroup('fakeparam', 'fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGroup('fakeparam', 'fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteGroup - errors', () => {
      it('should have a postDeleteGroup function', (done) => {
        assert.equal(true, typeof a.postDeleteGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteGroup(null, null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Ses', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteGroup('fakeparam', null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Ses is required for postDeleteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteGroup('fakeparam', 'fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteGroup('fakeparam', 'fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowGroups - errors', () => {
      it('should have a postShowGroups function', (done) => {
        assert.equal(true, typeof a.postShowGroups === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGroups(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowGroups', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGroups('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowGroups', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGroups('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowGroups', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddAddressRange - errors', () => {
      it('should have a postAddAddressRange function', (done) => {
        assert.equal(true, typeof a.postAddAddressRange === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAddressRange(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAddressRange('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAddressRange('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAddressRange - errors', () => {
      it('should have a postShowAddressRange function', (done) => {
        assert.equal(true, typeof a.postShowAddressRange === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAddressRange(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAddressRange('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAddressRange('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetAddressRange - errors', () => {
      it('should have a postSetAddressRange function', (done) => {
        assert.equal(true, typeof a.postSetAddressRange === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAddressRange(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAddressRange('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAddressRange('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteAddressRange - errors', () => {
      it('should have a postDeleteAddressRange function', (done) => {
        assert.equal(true, typeof a.postDeleteAddressRange === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAddressRange(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAddressRange('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAddressRange('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAddressRanges - errors', () => {
      it('should have a postShowAddressRanges function', (done) => {
        assert.equal(true, typeof a.postShowAddressRanges === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAddressRanges(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowAddressRanges', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAddressRanges('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowAddressRanges', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAddressRanges('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowAddressRanges', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddMulticastAddressRange - errors', () => {
      it('should have a postAddMulticastAddressRange function', (done) => {
        assert.equal(true, typeof a.postAddMulticastAddressRange === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddMulticastAddressRange(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddMulticastAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddMulticastAddressRange('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddMulticastAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddMulticastAddressRange('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddMulticastAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowMulticastAddressRange - errors', () => {
      it('should have a postShowMulticastAddressRange function', (done) => {
        assert.equal(true, typeof a.postShowMulticastAddressRange === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowMulticastAddressRange(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowMulticastAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowMulticastAddressRange('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowMulticastAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowMulticastAddressRange('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowMulticastAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetMulticastAddressRange - errors', () => {
      it('should have a postSetMulticastAddressRange function', (done) => {
        assert.equal(true, typeof a.postSetMulticastAddressRange === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetMulticastAddressRange(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetMulticastAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetMulticastAddressRange('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetMulticastAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetMulticastAddressRange('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetMulticastAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteMulticastAddressRange - errors', () => {
      it('should have a postDeleteMulticastAddressRange function', (done) => {
        assert.equal(true, typeof a.postDeleteMulticastAddressRange === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteMulticastAddressRange(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteMulticastAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteMulticastAddressRange('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteMulticastAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteMulticastAddressRange('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteMulticastAddressRange', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowMulticastAddressRanges - errors', () => {
      it('should have a postShowMulticastAddressRanges function', (done) => {
        assert.equal(true, typeof a.postShowMulticastAddressRanges === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowMulticastAddressRanges(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowMulticastAddressRanges', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowMulticastAddressRanges('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowMulticastAddressRanges', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowMulticastAddressRanges('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowMulticastAddressRanges', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddGroupWithExclusion - errors', () => {
      it('should have a postAddGroupWithExclusion function', (done) => {
        assert.equal(true, typeof a.postAddGroupWithExclusion === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddGroupWithExclusion(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddGroupWithExclusion', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddGroupWithExclusion('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddGroupWithExclusion', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddGroupWithExclusion('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddGroupWithExclusion', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowGroupWithExclusion - errors', () => {
      it('should have a postShowGroupWithExclusion function', (done) => {
        assert.equal(true, typeof a.postShowGroupWithExclusion === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGroupWithExclusion(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowGroupWithExclusion', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGroupWithExclusion('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowGroupWithExclusion', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGroupWithExclusion('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowGroupWithExclusion', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetGroupWithExclusion - errors', () => {
      it('should have a postSetGroupWithExclusion function', (done) => {
        assert.equal(true, typeof a.postSetGroupWithExclusion === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGroupWithExclusion(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetGroupWithExclusion', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGroupWithExclusion('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetGroupWithExclusion', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGroupWithExclusion('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetGroupWithExclusion', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteGroupWithExclusion - errors', () => {
      it('should have a postDeleteGroupWithExclusion function', (done) => {
        assert.equal(true, typeof a.postDeleteGroupWithExclusion === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteGroupWithExclusion(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteGroupWithExclusion', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteGroupWithExclusion('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteGroupWithExclusion', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteGroupWithExclusion('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteGroupWithExclusion', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowGroupsWithExclusion - errors', () => {
      it('should have a postShowGroupsWithExclusion function', (done) => {
        assert.equal(true, typeof a.postShowGroupsWithExclusion === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGroupsWithExclusion(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowGroupsWithExclusion', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGroupsWithExclusion('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowGroupsWithExclusion', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGroupsWithExclusion('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowGroupsWithExclusion', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddSimpleGateway - errors', () => {
      it('should have a postAddSimpleGateway function', (done) => {
        assert.equal(true, typeof a.postAddSimpleGateway === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddSimpleGateway(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddSimpleGateway', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddSimpleGateway('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddSimpleGateway', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddSimpleGateway('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddSimpleGateway', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowSimpleGateway - errors', () => {
      it('should have a postShowSimpleGateway function', (done) => {
        assert.equal(true, typeof a.postShowSimpleGateway === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSimpleGateway(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowSimpleGateway', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSimpleGateway('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowSimpleGateway', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSimpleGateway('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowSimpleGateway', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetSimpleGateway - errors', () => {
      it('should have a postSetSimpleGateway function', (done) => {
        assert.equal(true, typeof a.postSetSimpleGateway === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetSimpleGateway(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetSimpleGateway', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetSimpleGateway('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetSimpleGateway', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetSimpleGateway('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetSimpleGateway', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteSimpleGateway - errors', () => {
      it('should have a postDeleteSimpleGateway function', (done) => {
        assert.equal(true, typeof a.postDeleteSimpleGateway === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteSimpleGateway(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteSimpleGateway', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteSimpleGateway('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteSimpleGateway', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteSimpleGateway('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteSimpleGateway', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowSimpleGateways - errors', () => {
      it('should have a postShowSimpleGateways function', (done) => {
        assert.equal(true, typeof a.postShowSimpleGateways === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSimpleGateways(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowSimpleGateways', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSimpleGateways('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowSimpleGateways', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSimpleGateways('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowSimpleGateways', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddSecurityZone - errors', () => {
      it('should have a postAddSecurityZone function', (done) => {
        assert.equal(true, typeof a.postAddSecurityZone === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddSecurityZone(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddSecurityZone', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddSecurityZone('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddSecurityZone', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddSecurityZone('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddSecurityZone', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowSecurityZone - errors', () => {
      it('should have a postShowSecurityZone function', (done) => {
        assert.equal(true, typeof a.postShowSecurityZone === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSecurityZone(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowSecurityZone', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSecurityZone('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowSecurityZone', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSecurityZone('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowSecurityZone', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetSecurityZone - errors', () => {
      it('should have a postSetSecurityZone function', (done) => {
        assert.equal(true, typeof a.postSetSecurityZone === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetSecurityZone(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetSecurityZone', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetSecurityZone('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetSecurityZone', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetSecurityZone('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetSecurityZone', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteSecurityZone - errors', () => {
      it('should have a postDeleteSecurityZone function', (done) => {
        assert.equal(true, typeof a.postDeleteSecurityZone === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteSecurityZone(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteSecurityZone', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteSecurityZone('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteSecurityZone', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteSecurityZone('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteSecurityZone', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowSecurityZones - errors', () => {
      it('should have a postShowSecurityZones function', (done) => {
        assert.equal(true, typeof a.postShowSecurityZones === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSecurityZones(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowSecurityZones', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSecurityZones('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowSecurityZones', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowSecurityZones('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowSecurityZones', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddTime - errors', () => {
      it('should have a postAddTime function', (done) => {
        assert.equal(true, typeof a.postAddTime === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddTime(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddTime', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddTime('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddTime', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddTime('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddTime', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTime - errors', () => {
      it('should have a postShowTime function', (done) => {
        assert.equal(true, typeof a.postShowTime === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTime(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowTime', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTime('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowTime', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTime('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowTime', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetTime - errors', () => {
      it('should have a postSetTime function', (done) => {
        assert.equal(true, typeof a.postSetTime === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetTime(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetTime', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetTime('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetTime', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetTime('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetTime', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteTime - errors', () => {
      it('should have a postDeleteTime function', (done) => {
        assert.equal(true, typeof a.postDeleteTime === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteTime(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteTime', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteTime('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteTime', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteTime('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteTime', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTimes - errors', () => {
      it('should have a postShowTimes function', (done) => {
        assert.equal(true, typeof a.postShowTimes === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTimes(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowTimes', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTimes('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowTimes', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTimes('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowTimes', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddTimeGroup - errors', () => {
      it('should have a postAddTimeGroup function', (done) => {
        assert.equal(true, typeof a.postAddTimeGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddTimeGroup(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddTimeGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddTimeGroup('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddTimeGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddTimeGroup('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddTimeGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTimeGroup - errors', () => {
      it('should have a postShowTimeGroup function', (done) => {
        assert.equal(true, typeof a.postShowTimeGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTimeGroup(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowTimeGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTimeGroup('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowTimeGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTimeGroup('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowTimeGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetTimeGroup - errors', () => {
      it('should have a postSetTimeGroup function', (done) => {
        assert.equal(true, typeof a.postSetTimeGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetTimeGroup(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetTimeGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetTimeGroup('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetTimeGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetTimeGroup('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetTimeGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteTimeGroup - errors', () => {
      it('should have a postDeleteTimeGroup function', (done) => {
        assert.equal(true, typeof a.postDeleteTimeGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteTimeGroup(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteTimeGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteTimeGroup('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteTimeGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteTimeGroup('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteTimeGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTimeGroups - errors', () => {
      it('should have a postShowTimeGroups function', (done) => {
        assert.equal(true, typeof a.postShowTimeGroups === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTimeGroups(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowTimeGroups', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTimeGroups('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowTimeGroups', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTimeGroups('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowTimeGroups', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddAccessRole - errors', () => {
      it('should have a postAddAccessRole function', (done) => {
        assert.equal(true, typeof a.postAddAccessRole === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAccessRole(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddAccessRole', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAccessRole('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddAccessRole', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAccessRole('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddAccessRole', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAccessRole - errors', () => {
      it('should have a postShowAccessRole function', (done) => {
        assert.equal(true, typeof a.postShowAccessRole === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessRole(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowAccessRole', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessRole('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowAccessRole', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessRole('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowAccessRole', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetAccessRole - errors', () => {
      it('should have a postSetAccessRole function', (done) => {
        assert.equal(true, typeof a.postSetAccessRole === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAccessRole(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetAccessRole', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAccessRole('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetAccessRole', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAccessRole('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetAccessRole', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteAccessRole - errors', () => {
      it('should have a postDeleteAccessRole function', (done) => {
        assert.equal(true, typeof a.postDeleteAccessRole === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAccessRole(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteAccessRole', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAccessRole('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteAccessRole', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAccessRole('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteAccessRole', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAccessRoles - errors', () => {
      it('should have a postShowAccessRoles function', (done) => {
        assert.equal(true, typeof a.postShowAccessRoles === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessRoles(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowAccessRoles', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessRoles('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowAccessRoles', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessRoles('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowAccessRoles', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddDynamicObject - errors', () => {
      it('should have a postAddDynamicObject function', (done) => {
        assert.equal(true, typeof a.postAddDynamicObject === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddDynamicObject(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddDynamicObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddDynamicObject('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddDynamicObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddDynamicObject('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddDynamicObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDynamicObject - errors', () => {
      it('should have a postShowDynamicObject function', (done) => {
        assert.equal(true, typeof a.postShowDynamicObject === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDynamicObject(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowDynamicObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDynamicObject('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowDynamicObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDynamicObject('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowDynamicObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetDynamicObject - errors', () => {
      it('should have a postSetDynamicObject function', (done) => {
        assert.equal(true, typeof a.postSetDynamicObject === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetDynamicObject(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetDynamicObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetDynamicObject('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetDynamicObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetDynamicObject('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetDynamicObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteDynamicObject - errors', () => {
      it('should have a postDeleteDynamicObject function', (done) => {
        assert.equal(true, typeof a.postDeleteDynamicObject === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteDynamicObject(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteDynamicObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteDynamicObject('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteDynamicObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteDynamicObject('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteDynamicObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDynamicObjects - errors', () => {
      it('should have a postShowDynamicObjects function', (done) => {
        assert.equal(true, typeof a.postShowDynamicObjects === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDynamicObjects(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowDynamicObjects', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDynamicObjects('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowDynamicObjects', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDynamicObjects('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowDynamicObjects', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddTrustedClient - errors', () => {
      it('should have a postAddTrustedClient function', (done) => {
        assert.equal(true, typeof a.postAddTrustedClient === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddTrustedClient(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddTrustedClient', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddTrustedClient('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddTrustedClient', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddTrustedClient('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddTrustedClient', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTrustedClient - errors', () => {
      it('should have a postShowTrustedClient function', (done) => {
        assert.equal(true, typeof a.postShowTrustedClient === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTrustedClient(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowTrustedClient', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTrustedClient('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowTrustedClient', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTrustedClient('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowTrustedClient', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetTrustedClient - errors', () => {
      it('should have a postSetTrustedClient function', (done) => {
        assert.equal(true, typeof a.postSetTrustedClient === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetTrustedClient(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetTrustedClient', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetTrustedClient('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetTrustedClient', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetTrustedClient('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetTrustedClient', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteTrustedClient - errors', () => {
      it('should have a postDeleteTrustedClient function', (done) => {
        assert.equal(true, typeof a.postDeleteTrustedClient === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteTrustedClient(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteTrustedClient', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteTrustedClient('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteTrustedClient', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteTrustedClient('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteTrustedClient', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTrustedClients - errors', () => {
      it('should have a postShowTrustedClients function', (done) => {
        assert.equal(true, typeof a.postShowTrustedClients === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTrustedClients(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowTrustedClients', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTrustedClients('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowTrustedClients', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTrustedClients('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowTrustedClients', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddTag - errors', () => {
      it('should have a postAddTag function', (done) => {
        assert.equal(true, typeof a.postAddTag === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddTag(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddTag', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddTag('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddTag', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddTag('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddTag', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTag - errors', () => {
      it('should have a postShowTag function', (done) => {
        assert.equal(true, typeof a.postShowTag === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTag(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowTag', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTag('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowTag', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTag('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowTag', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetTag - errors', () => {
      it('should have a postSetTag function', (done) => {
        assert.equal(true, typeof a.postSetTag === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetTag(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetTag', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetTag('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetTag', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetTag('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetTag', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteTag - errors', () => {
      it('should have a postDeleteTag function', (done) => {
        assert.equal(true, typeof a.postDeleteTag === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteTag(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteTag', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteTag('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteTag', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteTag('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteTag', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTags - errors', () => {
      it('should have a postShowTags function', (done) => {
        assert.equal(true, typeof a.postShowTags === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTags(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowTags', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTags('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowTags', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTags('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowTags', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddDnsDomain - errors', () => {
      it('should have a postAddDnsDomain function', (done) => {
        assert.equal(true, typeof a.postAddDnsDomain === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddDnsDomain(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddDnsDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddDnsDomain('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddDnsDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddDnsDomain('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddDnsDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDnsDomain - errors', () => {
      it('should have a postShowDnsDomain function', (done) => {
        assert.equal(true, typeof a.postShowDnsDomain === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDnsDomain(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowDnsDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDnsDomain('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowDnsDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDnsDomain('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowDnsDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetDnsDomain - errors', () => {
      it('should have a postSetDnsDomain function', (done) => {
        assert.equal(true, typeof a.postSetDnsDomain === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetDnsDomain(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetDnsDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetDnsDomain('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetDnsDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetDnsDomain('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetDnsDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteDnsDomain - errors', () => {
      it('should have a postDeleteDnsDomain function', (done) => {
        assert.equal(true, typeof a.postDeleteDnsDomain === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteDnsDomain(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteDnsDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteDnsDomain('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteDnsDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteDnsDomain('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteDnsDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDnsDomains - errors', () => {
      it('should have a postShowDnsDomains function', (done) => {
        assert.equal(true, typeof a.postShowDnsDomains === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDnsDomains(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowDnsDomains', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDnsDomains('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowDnsDomains', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDnsDomains('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowDnsDomains', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddOpsecApplication - errors', () => {
      it('should have a postAddOpsecApplication function', (done) => {
        assert.equal(true, typeof a.postAddOpsecApplication === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddOpsecApplication(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddOpsecApplication', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddOpsecApplication('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddOpsecApplication', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddOpsecApplication('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddOpsecApplication', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowOpsecApplication - errors', () => {
      it('should have a postShowOpsecApplication function', (done) => {
        assert.equal(true, typeof a.postShowOpsecApplication === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowOpsecApplication(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowOpsecApplication', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowOpsecApplication('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowOpsecApplication', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowOpsecApplication('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowOpsecApplication', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetOpsecApplication - errors', () => {
      it('should have a postSetOpsecApplication function', (done) => {
        assert.equal(true, typeof a.postSetOpsecApplication === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetOpsecApplication(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetOpsecApplication', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetOpsecApplication('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetOpsecApplication', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetOpsecApplication('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetOpsecApplication', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteOpsecApplication - errors', () => {
      it('should have a postDeleteOpsecApplication function', (done) => {
        assert.equal(true, typeof a.postDeleteOpsecApplication === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteOpsecApplication(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteOpsecApplication', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteOpsecApplication('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteOpsecApplication', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteOpsecApplication('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteOpsecApplication', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowOpsecApplications - errors', () => {
      it('should have a postShowOpsecApplications function', (done) => {
        assert.equal(true, typeof a.postShowOpsecApplications === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowOpsecApplications(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowOpsecApplications', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowOpsecApplications('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowOpsecApplications', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowOpsecApplications('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowOpsecApplications', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDataCenterContent - errors', () => {
      it('should have a postShowDataCenterContent function', (done) => {
        assert.equal(true, typeof a.postShowDataCenterContent === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenterContent(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowDataCenterContent', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenterContent('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowDataCenterContent', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenterContent('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowDataCenterContent', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDataCenter - errors', () => {
      it('should have a postShowDataCenter function', (done) => {
        assert.equal(true, typeof a.postShowDataCenter === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenter(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowDataCenter', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenter('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowDataCenter', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenter('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowDataCenter', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDataCenters - errors', () => {
      it('should have a postShowDataCenters function', (done) => {
        assert.equal(true, typeof a.postShowDataCenters === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenters(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowDataCenters', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenters('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowDataCenters', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenters('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowDataCenters', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddDataCenterObject - errors', () => {
      it('should have a postAddDataCenterObject function', (done) => {
        assert.equal(true, typeof a.postAddDataCenterObject === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddDataCenterObject(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddDataCenterObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddDataCenterObject('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddDataCenterObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddDataCenterObject('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddDataCenterObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDataCenterObject - errors', () => {
      it('should have a postShowDataCenterObject function', (done) => {
        assert.equal(true, typeof a.postShowDataCenterObject === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenterObject(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowDataCenterObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenterObject('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowDataCenterObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenterObject('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowDataCenterObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteDataCenterObject - errors', () => {
      it('should have a postDeleteDataCenterObject function', (done) => {
        assert.equal(true, typeof a.postDeleteDataCenterObject === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteDataCenterObject(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteDataCenterObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteDataCenterObject('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteDataCenterObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteDataCenterObject('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteDataCenterObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDataCenterObjects - errors', () => {
      it('should have a postShowDataCenterObjects function', (done) => {
        assert.equal(true, typeof a.postShowDataCenterObjects === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenterObjects(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowDataCenterObjects', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenterObjects('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowDataCenterObjects', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDataCenterObjects('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowDataCenterObjects', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowUpdatableObjectsRepositoryContent - errors', () => {
      it('should have a postShowUpdatableObjectsRepositoryContent function', (done) => {
        assert.equal(true, typeof a.postShowUpdatableObjectsRepositoryContent === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowUpdatableObjectsRepositoryContent(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowUpdatableObjectsRepositoryContent', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowUpdatableObjectsRepositoryContent('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowUpdatableObjectsRepositoryContent', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowUpdatableObjectsRepositoryContent('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowUpdatableObjectsRepositoryContent', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postUpdateUpdatableObjectsRepositoryContent - errors', () => {
      it('should have a postUpdateUpdatableObjectsRepositoryContent function', (done) => {
        assert.equal(true, typeof a.postUpdateUpdatableObjectsRepositoryContent === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postUpdateUpdatableObjectsRepositoryContent(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postUpdateUpdatableObjectsRepositoryContent', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postUpdateUpdatableObjectsRepositoryContent('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postUpdateUpdatableObjectsRepositoryContent', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postUpdateUpdatableObjectsRepositoryContent('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postUpdateUpdatableObjectsRepositoryContent', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddUpdatableObject - errors', () => {
      it('should have a postAddUpdatableObject function', (done) => {
        assert.equal(true, typeof a.postAddUpdatableObject === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddUpdatableObject(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddUpdatableObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddUpdatableObject('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddUpdatableObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddUpdatableObject('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddUpdatableObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowUpdatableObject - errors', () => {
      it('should have a postShowUpdatableObject function', (done) => {
        assert.equal(true, typeof a.postShowUpdatableObject === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowUpdatableObject(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowUpdatableObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowUpdatableObject('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowUpdatableObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowUpdatableObject('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowUpdatableObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteUpdatableObject - errors', () => {
      it('should have a postDeleteUpdatableObject function', (done) => {
        assert.equal(true, typeof a.postDeleteUpdatableObject === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteUpdatableObject(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteUpdatableObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteUpdatableObject('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteUpdatableObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteUpdatableObject('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteUpdatableObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowUpdatableObjects - errors', () => {
      it('should have a postShowUpdatableObjects function', (done) => {
        assert.equal(true, typeof a.postShowUpdatableObjects === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowUpdatableObjects(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowUpdatableObjects', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowUpdatableObjects('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowUpdatableObjects', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowUpdatableObjects('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowUpdatableObjects', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceTcp - errors', () => {
      it('should have a postAddServiceTcp function', (done) => {
        assert.equal(true, typeof a.postAddServiceTcp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceTcp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddServiceTcp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceTcp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddServiceTcp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceTcp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddServiceTcp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceTcp - errors', () => {
      it('should have a postShowServiceTcp function', (done) => {
        assert.equal(true, typeof a.postShowServiceTcp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceTcp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServiceTcp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceTcp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServiceTcp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceTcp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServiceTcp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceTcp - errors', () => {
      it('should have a postSetServiceTcp function', (done) => {
        assert.equal(true, typeof a.postSetServiceTcp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceTcp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetServiceTcp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceTcp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetServiceTcp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceTcp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetServiceTcp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceTcp - errors', () => {
      it('should have a postDeleteServiceTcp function', (done) => {
        assert.equal(true, typeof a.postDeleteServiceTcp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceTcp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteServiceTcp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceTcp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteServiceTcp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceTcp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteServiceTcp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServicesTcp - errors', () => {
      it('should have a postShowServicesTcp function', (done) => {
        assert.equal(true, typeof a.postShowServicesTcp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesTcp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServicesTcp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesTcp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServicesTcp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesTcp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServicesTcp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceUdp - errors', () => {
      it('should have a postAddServiceUdp function', (done) => {
        assert.equal(true, typeof a.postAddServiceUdp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceUdp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddServiceUdp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceUdp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddServiceUdp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceUdp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddServiceUdp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceUdp - errors', () => {
      it('should have a postShowServiceUdp function', (done) => {
        assert.equal(true, typeof a.postShowServiceUdp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceUdp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServiceUdp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceUdp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServiceUdp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceUdp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServiceUdp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceUdp - errors', () => {
      it('should have a postSetServiceUdp function', (done) => {
        assert.equal(true, typeof a.postSetServiceUdp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceUdp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetServiceUdp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceUdp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetServiceUdp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceUdp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetServiceUdp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceUdp - errors', () => {
      it('should have a postDeleteServiceUdp function', (done) => {
        assert.equal(true, typeof a.postDeleteServiceUdp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceUdp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteServiceUdp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceUdp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteServiceUdp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceUdp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteServiceUdp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServicesUdp - errors', () => {
      it('should have a postShowServicesUdp function', (done) => {
        assert.equal(true, typeof a.postShowServicesUdp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesUdp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServicesUdp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesUdp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServicesUdp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesUdp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServicesUdp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceIcmp - errors', () => {
      it('should have a postAddServiceIcmp function', (done) => {
        assert.equal(true, typeof a.postAddServiceIcmp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceIcmp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddServiceIcmp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceIcmp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddServiceIcmp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceIcmp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddServiceIcmp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceIcmp - errors', () => {
      it('should have a postShowServiceIcmp function', (done) => {
        assert.equal(true, typeof a.postShowServiceIcmp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceIcmp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServiceIcmp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceIcmp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServiceIcmp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceIcmp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServiceIcmp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceIcmp - errors', () => {
      it('should have a postSetServiceIcmp function', (done) => {
        assert.equal(true, typeof a.postSetServiceIcmp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceIcmp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetServiceIcmp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceIcmp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetServiceIcmp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceIcmp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetServiceIcmp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceIcmp - errors', () => {
      it('should have a postDeleteServiceIcmp function', (done) => {
        assert.equal(true, typeof a.postDeleteServiceIcmp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceIcmp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteServiceIcmp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceIcmp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteServiceIcmp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceIcmp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteServiceIcmp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServicesIcmp - errors', () => {
      it('should have a postShowServicesIcmp function', (done) => {
        assert.equal(true, typeof a.postShowServicesIcmp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesIcmp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServicesIcmp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesIcmp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServicesIcmp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesIcmp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServicesIcmp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceIcmp6 - errors', () => {
      it('should have a postAddServiceIcmp6 function', (done) => {
        assert.equal(true, typeof a.postAddServiceIcmp6 === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceIcmp6(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddServiceIcmp6', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceIcmp6('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddServiceIcmp6', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceIcmp6('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddServiceIcmp6', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceIcmp6 - errors', () => {
      it('should have a postShowServiceIcmp6 function', (done) => {
        assert.equal(true, typeof a.postShowServiceIcmp6 === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceIcmp6(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServiceIcmp6', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceIcmp6('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServiceIcmp6', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceIcmp6('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServiceIcmp6', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceIcmp6 - errors', () => {
      it('should have a postSetServiceIcmp6 function', (done) => {
        assert.equal(true, typeof a.postSetServiceIcmp6 === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceIcmp6(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetServiceIcmp6', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceIcmp6('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetServiceIcmp6', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceIcmp6('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetServiceIcmp6', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceIcmp6 - errors', () => {
      it('should have a postDeleteServiceIcmp6 function', (done) => {
        assert.equal(true, typeof a.postDeleteServiceIcmp6 === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceIcmp6(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteServiceIcmp6', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceIcmp6('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteServiceIcmp6', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceIcmp6('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteServiceIcmp6', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServicesIcmp6 - errors', () => {
      it('should have a postShowServicesIcmp6 function', (done) => {
        assert.equal(true, typeof a.postShowServicesIcmp6 === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesIcmp6(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServicesIcmp6', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesIcmp6('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServicesIcmp6', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesIcmp6('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServicesIcmp6', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceSctp - errors', () => {
      it('should have a postAddServiceSctp function', (done) => {
        assert.equal(true, typeof a.postAddServiceSctp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceSctp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddServiceSctp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceSctp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddServiceSctp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceSctp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddServiceSctp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceSctp - errors', () => {
      it('should have a postShowServiceSctp function', (done) => {
        assert.equal(true, typeof a.postShowServiceSctp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceSctp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServiceSctp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceSctp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServiceSctp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceSctp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServiceSctp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceSctp - errors', () => {
      it('should have a postSetServiceSctp function', (done) => {
        assert.equal(true, typeof a.postSetServiceSctp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceSctp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetServiceSctp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceSctp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetServiceSctp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceSctp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetServiceSctp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceSctp - errors', () => {
      it('should have a postDeleteServiceSctp function', (done) => {
        assert.equal(true, typeof a.postDeleteServiceSctp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceSctp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteServiceSctp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceSctp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteServiceSctp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceSctp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteServiceSctp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServicesSctp - errors', () => {
      it('should have a postShowServicesSctp function', (done) => {
        assert.equal(true, typeof a.postShowServicesSctp === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesSctp(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServicesSctp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesSctp('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServicesSctp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesSctp('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServicesSctp', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceOther - errors', () => {
      it('should have a postAddServiceOther function', (done) => {
        assert.equal(true, typeof a.postAddServiceOther === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceOther(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddServiceOther', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceOther('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddServiceOther', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceOther('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddServiceOther', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceOther - errors', () => {
      it('should have a postShowServiceOther function', (done) => {
        assert.equal(true, typeof a.postShowServiceOther === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceOther(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServiceOther', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceOther('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServiceOther', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceOther('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServiceOther', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceOther - errors', () => {
      it('should have a postSetServiceOther function', (done) => {
        assert.equal(true, typeof a.postSetServiceOther === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceOther(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetServiceOther', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceOther('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetServiceOther', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceOther('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetServiceOther', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceOther - errors', () => {
      it('should have a postDeleteServiceOther function', (done) => {
        assert.equal(true, typeof a.postDeleteServiceOther === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceOther(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteServiceOther', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceOther('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteServiceOther', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceOther('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteServiceOther', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServicesOther - errors', () => {
      it('should have a postShowServicesOther function', (done) => {
        assert.equal(true, typeof a.postShowServicesOther === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesOther(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServicesOther', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesOther('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServicesOther', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesOther('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServicesOther', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceGroup - errors', () => {
      it('should have a postAddServiceGroup function', (done) => {
        assert.equal(true, typeof a.postAddServiceGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceGroup(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddServiceGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceGroup('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddServiceGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceGroup('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddServiceGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceGroup - errors', () => {
      it('should have a postShowServiceGroup function', (done) => {
        assert.equal(true, typeof a.postShowServiceGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceGroup(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServiceGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceGroup('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServiceGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceGroup('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServiceGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceGroup - errors', () => {
      it('should have a postSetServiceGroup function', (done) => {
        assert.equal(true, typeof a.postSetServiceGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceGroup(null, null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetServiceGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Ses', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceGroup('fakeparam', null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Ses is required for postSetServiceGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceGroup('fakeparam', 'fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetServiceGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceGroup('fakeparam', 'fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetServiceGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceGroup - errors', () => {
      it('should have a postDeleteServiceGroup function', (done) => {
        assert.equal(true, typeof a.postDeleteServiceGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceGroup(null, null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteServiceGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Ses', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceGroup('fakeparam', null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Ses is required for postDeleteServiceGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceGroup('fakeparam', 'fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteServiceGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceGroup('fakeparam', 'fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteServiceGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceGroups - errors', () => {
      it('should have a postShowServiceGroups function', (done) => {
        assert.equal(true, typeof a.postShowServiceGroups === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceGroups(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServiceGroups', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceGroups('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServiceGroups', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceGroups('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServiceGroups', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddApplicationSite - errors', () => {
      it('should have a postAddApplicationSite function', (done) => {
        assert.equal(true, typeof a.postAddApplicationSite === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddApplicationSite(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddApplicationSite', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddApplicationSite('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddApplicationSite', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddApplicationSite('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddApplicationSite', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowApplicationSite - errors', () => {
      it('should have a postShowApplicationSite function', (done) => {
        assert.equal(true, typeof a.postShowApplicationSite === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSite(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowApplicationSite', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSite('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowApplicationSite', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSite('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowApplicationSite', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetApplicationSite - errors', () => {
      it('should have a postSetApplicationSite function', (done) => {
        assert.equal(true, typeof a.postSetApplicationSite === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApplicationSite(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetApplicationSite', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApplicationSite('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetApplicationSite', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApplicationSite('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetApplicationSite', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteApplicationSite - errors', () => {
      it('should have a postDeleteApplicationSite function', (done) => {
        assert.equal(true, typeof a.postDeleteApplicationSite === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteApplicationSite(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteApplicationSite', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteApplicationSite('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteApplicationSite', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteApplicationSite('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteApplicationSite', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowApplicationSites - errors', () => {
      it('should have a postShowApplicationSites function', (done) => {
        assert.equal(true, typeof a.postShowApplicationSites === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSites(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowApplicationSites', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSites('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowApplicationSites', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSites('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowApplicationSites', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddApplicationSiteCategory - errors', () => {
      it('should have a postAddApplicationSiteCategory function', (done) => {
        assert.equal(true, typeof a.postAddApplicationSiteCategory === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddApplicationSiteCategory(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddApplicationSiteCategory', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddApplicationSiteCategory('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddApplicationSiteCategory', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddApplicationSiteCategory('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddApplicationSiteCategory', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowApplicationSiteCategory - errors', () => {
      it('should have a postShowApplicationSiteCategory function', (done) => {
        assert.equal(true, typeof a.postShowApplicationSiteCategory === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSiteCategory(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowApplicationSiteCategory', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSiteCategory('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowApplicationSiteCategory', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSiteCategory('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowApplicationSiteCategory', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetApplicationSiteCategory - errors', () => {
      it('should have a postSetApplicationSiteCategory function', (done) => {
        assert.equal(true, typeof a.postSetApplicationSiteCategory === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApplicationSiteCategory(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetApplicationSiteCategory', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApplicationSiteCategory('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetApplicationSiteCategory', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApplicationSiteCategory('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetApplicationSiteCategory', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteApplicationSiteCategory - errors', () => {
      it('should have a postDeleteApplicationSiteCategory function', (done) => {
        assert.equal(true, typeof a.postDeleteApplicationSiteCategory === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteApplicationSiteCategory(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteApplicationSiteCategory', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteApplicationSiteCategory('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteApplicationSiteCategory', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteApplicationSiteCategory('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteApplicationSiteCategory', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowApplicationSiteCategories - errors', () => {
      it('should have a postShowApplicationSiteCategories function', (done) => {
        assert.equal(true, typeof a.postShowApplicationSiteCategories === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSiteCategories(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowApplicationSiteCategories', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSiteCategories('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowApplicationSiteCategories', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSiteCategories('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowApplicationSiteCategories', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddApplicationSiteGroup - errors', () => {
      it('should have a postAddApplicationSiteGroup function', (done) => {
        assert.equal(true, typeof a.postAddApplicationSiteGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddApplicationSiteGroup(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddApplicationSiteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddApplicationSiteGroup('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddApplicationSiteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddApplicationSiteGroup('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddApplicationSiteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowApplicationSiteGroup - errors', () => {
      it('should have a postShowApplicationSiteGroup function', (done) => {
        assert.equal(true, typeof a.postShowApplicationSiteGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSiteGroup(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowApplicationSiteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSiteGroup('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowApplicationSiteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSiteGroup('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowApplicationSiteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetApplicationSiteGroup - errors', () => {
      it('should have a postSetApplicationSiteGroup function', (done) => {
        assert.equal(true, typeof a.postSetApplicationSiteGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApplicationSiteGroup(null, null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetApplicationSiteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Ses', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApplicationSiteGroup('fakeparam', null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Ses is required for postSetApplicationSiteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApplicationSiteGroup('fakeparam', 'fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetApplicationSiteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApplicationSiteGroup('fakeparam', 'fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetApplicationSiteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteApplicationSiteGroup - errors', () => {
      it('should have a postDeleteApplicationSiteGroup function', (done) => {
        assert.equal(true, typeof a.postDeleteApplicationSiteGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteApplicationSiteGroup(null, null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteApplicationSiteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Ses', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteApplicationSiteGroup('fakeparam', null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Ses is required for postDeleteApplicationSiteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteApplicationSiteGroup('fakeparam', 'fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteApplicationSiteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteApplicationSiteGroup('fakeparam', 'fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteApplicationSiteGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowApplicationSiteGroups - errors', () => {
      it('should have a postShowApplicationSiteGroups function', (done) => {
        assert.equal(true, typeof a.postShowApplicationSiteGroups === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSiteGroups(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowApplicationSiteGroups', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSiteGroups('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowApplicationSiteGroups', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApplicationSiteGroups('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowApplicationSiteGroups', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceDceRpc - errors', () => {
      it('should have a postAddServiceDceRpc function', (done) => {
        assert.equal(true, typeof a.postAddServiceDceRpc === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceDceRpc(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddServiceDceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceDceRpc('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddServiceDceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceDceRpc('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddServiceDceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceDceRpc - errors', () => {
      it('should have a postShowServiceDceRpc function', (done) => {
        assert.equal(true, typeof a.postShowServiceDceRpc === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceDceRpc(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServiceDceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceDceRpc('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServiceDceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceDceRpc('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServiceDceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceDceRpc - errors', () => {
      it('should have a postSetServiceDceRpc function', (done) => {
        assert.equal(true, typeof a.postSetServiceDceRpc === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceDceRpc(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetServiceDceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceDceRpc('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetServiceDceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceDceRpc('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetServiceDceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceDceRpc - errors', () => {
      it('should have a postDeleteServiceDceRpc function', (done) => {
        assert.equal(true, typeof a.postDeleteServiceDceRpc === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceDceRpc(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteServiceDceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceDceRpc('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteServiceDceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceDceRpc('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteServiceDceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServicesDceRpc - errors', () => {
      it('should have a postShowServicesDceRpc function', (done) => {
        assert.equal(true, typeof a.postShowServicesDceRpc === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesDceRpc(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServicesDceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesDceRpc('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServicesDceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesDceRpc('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServicesDceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddServiceRpc - errors', () => {
      it('should have a postAddServiceRpc function', (done) => {
        assert.equal(true, typeof a.postAddServiceRpc === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceRpc(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddServiceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceRpc('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddServiceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddServiceRpc('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddServiceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServiceRpc - errors', () => {
      it('should have a postShowServiceRpc function', (done) => {
        assert.equal(true, typeof a.postShowServiceRpc === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceRpc(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServiceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceRpc('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServiceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServiceRpc('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServiceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetServiceRpc - errors', () => {
      it('should have a postSetServiceRpc function', (done) => {
        assert.equal(true, typeof a.postSetServiceRpc === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceRpc(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetServiceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceRpc('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetServiceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetServiceRpc('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetServiceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteServiceRpc - errors', () => {
      it('should have a postDeleteServiceRpc function', (done) => {
        assert.equal(true, typeof a.postDeleteServiceRpc === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceRpc(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteServiceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceRpc('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteServiceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteServiceRpc('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteServiceRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowServicesRpc - errors', () => {
      it('should have a postShowServicesRpc function', (done) => {
        assert.equal(true, typeof a.postShowServicesRpc === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesRpc(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowServicesRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesRpc('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowServicesRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowServicesRpc('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowServicesRpc', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddAccessRule - errors', () => {
      it('should have a postAddAccessRule function', (done) => {
        assert.equal(true, typeof a.postAddAccessRule === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAccessRule(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddAccessRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAccessRule('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddAccessRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAccessRule('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddAccessRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAccessRulebase - errors', () => {
      it('should have a postShowAccessRulebase function', (done) => {
        assert.equal(true, typeof a.postShowAccessRulebase === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessRulebase(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowAccessRulebase', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessRulebase('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowAccessRulebase', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessRulebase('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowAccessRulebase', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAccessRule - errors', () => {
      it('should have a postShowAccessRule function', (done) => {
        assert.equal(true, typeof a.postShowAccessRule === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessRule(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowAccessRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessRule('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowAccessRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessRule('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowAccessRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetAccessRule - errors', () => {
      it('should have a postSetAccessRule function', (done) => {
        assert.equal(true, typeof a.postSetAccessRule === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAccessRule(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetAccessRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAccessRule('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetAccessRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAccessRule('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetAccessRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteAccessRule - errors', () => {
      it('should have a postDeleteAccessRule function', (done) => {
        assert.equal(true, typeof a.postDeleteAccessRule === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAccessRule(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteAccessRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAccessRule('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteAccessRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAccessRule('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteAccessRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddAccessSection - errors', () => {
      it('should have a postAddAccessSection function', (done) => {
        assert.equal(true, typeof a.postAddAccessSection === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAccessSection(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddAccessSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAccessSection('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddAccessSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAccessSection('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddAccessSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAccessSection - errors', () => {
      it('should have a postShowAccessSection function', (done) => {
        assert.equal(true, typeof a.postShowAccessSection === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessSection(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowAccessSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessSection('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowAccessSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessSection('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowAccessSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetAccessSection - errors', () => {
      it('should have a postSetAccessSection function', (done) => {
        assert.equal(true, typeof a.postSetAccessSection === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAccessSection(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetAccessSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAccessSection('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetAccessSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAccessSection('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetAccessSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteAccessSection - errors', () => {
      it('should have a postDeleteAccessSection function', (done) => {
        assert.equal(true, typeof a.postDeleteAccessSection === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAccessSection(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteAccessSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAccessSection('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteAccessSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAccessSection('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteAccessSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddAccessLayer - errors', () => {
      it('should have a postAddAccessLayer function', (done) => {
        assert.equal(true, typeof a.postAddAccessLayer === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAccessLayer(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddAccessLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAccessLayer('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddAccessLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAccessLayer('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddAccessLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAccessLayer - errors', () => {
      it('should have a postShowAccessLayer function', (done) => {
        assert.equal(true, typeof a.postShowAccessLayer === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessLayer(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowAccessLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessLayer('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowAccessLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessLayer('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowAccessLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetAccessLayer - errors', () => {
      it('should have a postSetAccessLayer function', (done) => {
        assert.equal(true, typeof a.postSetAccessLayer === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAccessLayer(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetAccessLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAccessLayer('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetAccessLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAccessLayer('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetAccessLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteAccessLayer - errors', () => {
      it('should have a postDeleteAccessLayer function', (done) => {
        assert.equal(true, typeof a.postDeleteAccessLayer === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAccessLayer(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteAccessLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAccessLayer('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteAccessLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAccessLayer('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteAccessLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAccessLayers - errors', () => {
      it('should have a postShowAccessLayers function', (done) => {
        assert.equal(true, typeof a.postShowAccessLayers === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessLayers(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowAccessLayers', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessLayers('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowAccessLayers', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAccessLayers('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowAccessLayers', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddNatRule - errors', () => {
      it('should have a postAddNatRule function', (done) => {
        assert.equal(true, typeof a.postAddNatRule === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddNatRule(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddNatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddNatRule('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddNatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddNatRule('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddNatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowNatRulebase - errors', () => {
      it('should have a postShowNatRulebase function', (done) => {
        assert.equal(true, typeof a.postShowNatRulebase === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNatRulebase(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowNatRulebase', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNatRulebase('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowNatRulebase', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNatRulebase('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowNatRulebase', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowNatRule - errors', () => {
      it('should have a postShowNatRule function', (done) => {
        assert.equal(true, typeof a.postShowNatRule === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNatRule(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowNatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNatRule('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowNatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNatRule('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowNatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetNatRule - errors', () => {
      it('should have a postSetNatRule function', (done) => {
        assert.equal(true, typeof a.postSetNatRule === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetNatRule(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetNatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetNatRule('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetNatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetNatRule('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetNatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteNatRule - errors', () => {
      it('should have a postDeleteNatRule function', (done) => {
        assert.equal(true, typeof a.postDeleteNatRule === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteNatRule(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteNatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteNatRule('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteNatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteNatRule('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteNatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddNatSection - errors', () => {
      it('should have a postAddNatSection function', (done) => {
        assert.equal(true, typeof a.postAddNatSection === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddNatSection(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddNatSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddNatSection('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddNatSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddNatSection('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddNatSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowNatSection - errors', () => {
      it('should have a postShowNatSection function', (done) => {
        assert.equal(true, typeof a.postShowNatSection === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNatSection(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowNatSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNatSection('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowNatSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowNatSection('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowNatSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetNatSection - errors', () => {
      it('should have a postSetNatSection function', (done) => {
        assert.equal(true, typeof a.postSetNatSection === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetNatSection(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetNatSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetNatSection('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetNatSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetNatSection('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetNatSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteNatSection - errors', () => {
      it('should have a postDeleteNatSection function', (done) => {
        assert.equal(true, typeof a.postDeleteNatSection === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteNatSection(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteNatSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteNatSection('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteNatSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteNatSection('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteNatSection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddVpnCommunityMeshed - errors', () => {
      it('should have a postAddVpnCommunityMeshed function', (done) => {
        assert.equal(true, typeof a.postAddVpnCommunityMeshed === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddVpnCommunityMeshed(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddVpnCommunityMeshed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddVpnCommunityMeshed('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddVpnCommunityMeshed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddVpnCommunityMeshed('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddVpnCommunityMeshed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowVpnCommunityMeshed - errors', () => {
      it('should have a postShowVpnCommunityMeshed function', (done) => {
        assert.equal(true, typeof a.postShowVpnCommunityMeshed === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowVpnCommunityMeshed(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowVpnCommunityMeshed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowVpnCommunityMeshed('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowVpnCommunityMeshed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowVpnCommunityMeshed('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowVpnCommunityMeshed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetVpnCommunityMeshed - errors', () => {
      it('should have a postSetVpnCommunityMeshed function', (done) => {
        assert.equal(true, typeof a.postSetVpnCommunityMeshed === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetVpnCommunityMeshed(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetVpnCommunityMeshed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetVpnCommunityMeshed('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetVpnCommunityMeshed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetVpnCommunityMeshed('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetVpnCommunityMeshed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteVpnCommunityMeshed - errors', () => {
      it('should have a postDeleteVpnCommunityMeshed function', (done) => {
        assert.equal(true, typeof a.postDeleteVpnCommunityMeshed === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteVpnCommunityMeshed(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteVpnCommunityMeshed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteVpnCommunityMeshed('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteVpnCommunityMeshed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteVpnCommunityMeshed('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteVpnCommunityMeshed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowVpnCommunitiesMeshed - errors', () => {
      it('should have a postShowVpnCommunitiesMeshed function', (done) => {
        assert.equal(true, typeof a.postShowVpnCommunitiesMeshed === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowVpnCommunitiesMeshed(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowVpnCommunitiesMeshed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowVpnCommunitiesMeshed('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowVpnCommunitiesMeshed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowVpnCommunitiesMeshed('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowVpnCommunitiesMeshed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddVpnCommunityStar - errors', () => {
      it('should have a postAddVpnCommunityStar function', (done) => {
        assert.equal(true, typeof a.postAddVpnCommunityStar === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddVpnCommunityStar(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddVpnCommunityStar', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddVpnCommunityStar('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddVpnCommunityStar', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddVpnCommunityStar('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddVpnCommunityStar', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowVpnCommunityStar - errors', () => {
      it('should have a postShowVpnCommunityStar function', (done) => {
        assert.equal(true, typeof a.postShowVpnCommunityStar === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowVpnCommunityStar(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowVpnCommunityStar', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowVpnCommunityStar('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowVpnCommunityStar', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowVpnCommunityStar('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowVpnCommunityStar', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetVpnCommunityStar - errors', () => {
      it('should have a postSetVpnCommunityStar function', (done) => {
        assert.equal(true, typeof a.postSetVpnCommunityStar === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetVpnCommunityStar(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetVpnCommunityStar', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetVpnCommunityStar('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetVpnCommunityStar', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetVpnCommunityStar('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetVpnCommunityStar', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteVpnCommunityStar - errors', () => {
      it('should have a postDeleteVpnCommunityStar function', (done) => {
        assert.equal(true, typeof a.postDeleteVpnCommunityStar === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteVpnCommunityStar(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteVpnCommunityStar', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteVpnCommunityStar('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteVpnCommunityStar', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteVpnCommunityStar('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteVpnCommunityStar', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowVpnCommunitiesStar - errors', () => {
      it('should have a postShowVpnCommunitiesStar function', (done) => {
        assert.equal(true, typeof a.postShowVpnCommunitiesStar === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowVpnCommunitiesStar(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowVpnCommunitiesStar', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowVpnCommunitiesStar('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowVpnCommunitiesStar', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowVpnCommunitiesStar('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowVpnCommunitiesStar', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddThreatRule - errors', () => {
      it('should have a postAddThreatRule function', (done) => {
        assert.equal(true, typeof a.postAddThreatRule === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatRule(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddThreatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatRule('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddThreatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatRule('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddThreatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatRulebase - errors', () => {
      it('should have a postShowThreatRulebase function', (done) => {
        assert.equal(true, typeof a.postShowThreatRulebase === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatRulebase(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowThreatRulebase', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatRulebase('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowThreatRulebase', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatRulebase('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowThreatRulebase', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatRule - errors', () => {
      it('should have a postShowThreatRule function', (done) => {
        assert.equal(true, typeof a.postShowThreatRule === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatRule(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowThreatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatRule('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowThreatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatRule('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowThreatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetThreatRule - errors', () => {
      it('should have a postSetThreatRule function', (done) => {
        assert.equal(true, typeof a.postSetThreatRule === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatRule(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetThreatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatRule('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetThreatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatRule('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetThreatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteThreatRule - errors', () => {
      it('should have a postDeleteThreatRule function', (done) => {
        assert.equal(true, typeof a.postDeleteThreatRule === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatRule(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteThreatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatRule('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteThreatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatRule('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteThreatRule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddThreatException - errors', () => {
      it('should have a postAddThreatException function', (done) => {
        assert.equal(true, typeof a.postAddThreatException === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatException(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddThreatException', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatException('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddThreatException', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatException('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddThreatException', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatRuleExceptionRulebase - errors', () => {
      it('should have a postShowThreatRuleExceptionRulebase function', (done) => {
        assert.equal(true, typeof a.postShowThreatRuleExceptionRulebase === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatRuleExceptionRulebase(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowThreatRuleExceptionRulebase', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatRuleExceptionRulebase('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowThreatRuleExceptionRulebase', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatRuleExceptionRulebase('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowThreatRuleExceptionRulebase', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatException - errors', () => {
      it('should have a postShowThreatException function', (done) => {
        assert.equal(true, typeof a.postShowThreatException === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatException(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowThreatException', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatException('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowThreatException', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatException('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowThreatException', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetThreatException - errors', () => {
      it('should have a postSetThreatException function', (done) => {
        assert.equal(true, typeof a.postSetThreatException === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatException(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetThreatException', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatException('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetThreatException', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatException('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetThreatException', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteThreatException - errors', () => {
      it('should have a postDeleteThreatException function', (done) => {
        assert.equal(true, typeof a.postDeleteThreatException === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatException(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteThreatException', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatException('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteThreatException', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatException('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteThreatException', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddExceptionGroup - errors', () => {
      it('should have a postAddExceptionGroup function', (done) => {
        assert.equal(true, typeof a.postAddExceptionGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddExceptionGroup(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddExceptionGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddExceptionGroup('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddExceptionGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddExceptionGroup('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddExceptionGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowExceptionGroup - errors', () => {
      it('should have a postShowExceptionGroup function', (done) => {
        assert.equal(true, typeof a.postShowExceptionGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowExceptionGroup(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowExceptionGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowExceptionGroup('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowExceptionGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowExceptionGroup('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowExceptionGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetExceptionGroup - errors', () => {
      it('should have a postSetExceptionGroup function', (done) => {
        assert.equal(true, typeof a.postSetExceptionGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetExceptionGroup(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetExceptionGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetExceptionGroup('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetExceptionGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetExceptionGroup('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetExceptionGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteExceptionGroup - errors', () => {
      it('should have a postDeleteExceptionGroup function', (done) => {
        assert.equal(true, typeof a.postDeleteExceptionGroup === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteExceptionGroup(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteExceptionGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteExceptionGroup('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteExceptionGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteExceptionGroup('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteExceptionGroup', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowExceptionGroups - errors', () => {
      it('should have a postShowExceptionGroups function', (done) => {
        assert.equal(true, typeof a.postShowExceptionGroups === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowExceptionGroups(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowExceptionGroups', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowExceptionGroups('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowExceptionGroups', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowExceptionGroups('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowExceptionGroups', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatProtection - errors', () => {
      it('should have a postShowThreatProtection function', (done) => {
        assert.equal(true, typeof a.postShowThreatProtection === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatProtection(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowThreatProtection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatProtection('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowThreatProtection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatProtection('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowThreatProtection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetThreatProtection - errors', () => {
      it('should have a postSetThreatProtection function', (done) => {
        assert.equal(true, typeof a.postSetThreatProtection === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatProtection(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetThreatProtection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatProtection('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetThreatProtection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatProtection('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetThreatProtection', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatProtections - errors', () => {
      it('should have a postShowThreatProtections function', (done) => {
        assert.equal(true, typeof a.postShowThreatProtections === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatProtections(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowThreatProtections', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatProtections('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowThreatProtections', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatProtections('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowThreatProtections', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddThreatProtections - errors', () => {
      it('should have a postAddThreatProtections function', (done) => {
        assert.equal(true, typeof a.postAddThreatProtections === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatProtections(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddThreatProtections', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatProtections('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddThreatProtections', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatProtections('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddThreatProtections', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteThreatProtections - errors', () => {
      it('should have a postDeleteThreatProtections function', (done) => {
        assert.equal(true, typeof a.postDeleteThreatProtections === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatProtections(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteThreatProtections', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatProtections('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteThreatProtections', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatProtections('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteThreatProtections', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddThreatProfile - errors', () => {
      it('should have a postAddThreatProfile function', (done) => {
        assert.equal(true, typeof a.postAddThreatProfile === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatProfile(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddThreatProfile', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatProfile('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddThreatProfile', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatProfile('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddThreatProfile', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatProfile - errors', () => {
      it('should have a postShowThreatProfile function', (done) => {
        assert.equal(true, typeof a.postShowThreatProfile === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatProfile(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowThreatProfile', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatProfile('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowThreatProfile', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatProfile('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowThreatProfile', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetThreatProfile - errors', () => {
      it('should have a postSetThreatProfile function', (done) => {
        assert.equal(true, typeof a.postSetThreatProfile === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatProfile(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetThreatProfile', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatProfile('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetThreatProfile', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatProfile('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetThreatProfile', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteThreatProfile - errors', () => {
      it('should have a postDeleteThreatProfile function', (done) => {
        assert.equal(true, typeof a.postDeleteThreatProfile === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatProfile(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteThreatProfile', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatProfile('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteThreatProfile', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatProfile('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteThreatProfile', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatProfiles - errors', () => {
      it('should have a postShowThreatProfiles function', (done) => {
        assert.equal(true, typeof a.postShowThreatProfiles === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatProfiles(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowThreatProfiles', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatProfiles('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowThreatProfiles', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatProfiles('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowThreatProfiles', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddThreatIndicator - errors', () => {
      it('should have a postAddThreatIndicator function', (done) => {
        assert.equal(true, typeof a.postAddThreatIndicator === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatIndicator(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddThreatIndicator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatIndicator('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddThreatIndicator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatIndicator('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddThreatIndicator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatIndicator - errors', () => {
      it('should have a postShowThreatIndicator function', (done) => {
        assert.equal(true, typeof a.postShowThreatIndicator === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatIndicator(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowThreatIndicator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatIndicator('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowThreatIndicator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatIndicator('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowThreatIndicator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetThreatIndicator - errors', () => {
      it('should have a postSetThreatIndicator function', (done) => {
        assert.equal(true, typeof a.postSetThreatIndicator === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatIndicator(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetThreatIndicator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatIndicator('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetThreatIndicator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatIndicator('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetThreatIndicator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteThreatIndicator - errors', () => {
      it('should have a postDeleteThreatIndicator function', (done) => {
        assert.equal(true, typeof a.postDeleteThreatIndicator === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatIndicator(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteThreatIndicator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatIndicator('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteThreatIndicator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatIndicator('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteThreatIndicator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatIndicators - errors', () => {
      it('should have a postShowThreatIndicators function', (done) => {
        assert.equal(true, typeof a.postShowThreatIndicators === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatIndicators(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowThreatIndicators', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatIndicators('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowThreatIndicators', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatIndicators('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowThreatIndicators', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddThreatLayer - errors', () => {
      it('should have a postAddThreatLayer function', (done) => {
        assert.equal(true, typeof a.postAddThreatLayer === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatLayer(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddThreatLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatLayer('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddThreatLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddThreatLayer('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddThreatLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatLayer - errors', () => {
      it('should have a postShowThreatLayer function', (done) => {
        assert.equal(true, typeof a.postShowThreatLayer === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatLayer(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowThreatLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatLayer('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowThreatLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatLayer('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowThreatLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetThreatLayer - errors', () => {
      it('should have a postSetThreatLayer function', (done) => {
        assert.equal(true, typeof a.postSetThreatLayer === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatLayer(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetThreatLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatLayer('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetThreatLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetThreatLayer('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetThreatLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteThreatLayer - errors', () => {
      it('should have a postDeleteThreatLayer function', (done) => {
        assert.equal(true, typeof a.postDeleteThreatLayer === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatLayer(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteThreatLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatLayer('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteThreatLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteThreatLayer('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteThreatLayer', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowThreatLayers - errors', () => {
      it('should have a postShowThreatLayers function', (done) => {
        assert.equal(true, typeof a.postShowThreatLayers === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatLayers(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowThreatLayers', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatLayers('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowThreatLayers', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowThreatLayers('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowThreatLayers', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowIpsUpdateSchedule - errors', () => {
      it('should have a postShowIpsUpdateSchedule function', (done) => {
        assert.equal(true, typeof a.postShowIpsUpdateSchedule === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowIpsUpdateSchedule(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowIpsUpdateSchedule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowIpsUpdateSchedule('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowIpsUpdateSchedule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowIpsUpdateSchedule('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowIpsUpdateSchedule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetIpsUpdateSchedule - errors', () => {
      it('should have a postSetIpsUpdateSchedule function', (done) => {
        assert.equal(true, typeof a.postSetIpsUpdateSchedule === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetIpsUpdateSchedule(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetIpsUpdateSchedule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetIpsUpdateSchedule('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetIpsUpdateSchedule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetIpsUpdateSchedule('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetIpsUpdateSchedule', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postRunIpsUpdate - errors', () => {
      it('should have a postRunIpsUpdate function', (done) => {
        assert.equal(true, typeof a.postRunIpsUpdate === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postRunIpsUpdate(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postRunIpsUpdate', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postRunIpsUpdate('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postRunIpsUpdate', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postRunIpsUpdate('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postRunIpsUpdate', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowIpsStatus - errors', () => {
      it('should have a postShowIpsStatus function', (done) => {
        assert.equal(true, typeof a.postShowIpsStatus === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowIpsStatus(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowIpsStatus', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowIpsStatus('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowIpsStatus', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowIpsStatus('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowIpsStatus', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowIpsProtectionExtendedAttribute - errors', () => {
      it('should have a postShowIpsProtectionExtendedAttribute function', (done) => {
        assert.equal(true, typeof a.postShowIpsProtectionExtendedAttribute === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowIpsProtectionExtendedAttribute(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowIpsProtectionExtendedAttribute', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowIpsProtectionExtendedAttribute('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowIpsProtectionExtendedAttribute', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowIpsProtectionExtendedAttribute('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowIpsProtectionExtendedAttribute', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowIpsProtectionExtendedAttributes - errors', () => {
      it('should have a postShowIpsProtectionExtendedAttributes function', (done) => {
        assert.equal(true, typeof a.postShowIpsProtectionExtendedAttributes === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowIpsProtectionExtendedAttributes(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowIpsProtectionExtendedAttributes', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowIpsProtectionExtendedAttributes('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowIpsProtectionExtendedAttributes', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowIpsProtectionExtendedAttributes('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowIpsProtectionExtendedAttributes', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postRunThreatEmulationFileTypesOfflineUpdate - errors', () => {
      it('should have a postRunThreatEmulationFileTypesOfflineUpdate function', (done) => {
        assert.equal(true, typeof a.postRunThreatEmulationFileTypesOfflineUpdate === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postRunThreatEmulationFileTypesOfflineUpdate(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postRunThreatEmulationFileTypesOfflineUpdate', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postRunThreatEmulationFileTypesOfflineUpdate('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postRunThreatEmulationFileTypesOfflineUpdate', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postRunThreatEmulationFileTypesOfflineUpdate('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postRunThreatEmulationFileTypesOfflineUpdate', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postVerifyPolicy - errors', () => {
      it('should have a postVerifyPolicy function', (done) => {
        assert.equal(true, typeof a.postVerifyPolicy === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postVerifyPolicy(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postVerifyPolicy', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postVerifyPolicy('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postVerifyPolicy', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postVerifyPolicy('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postVerifyPolicy', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postInstallPolicy - errors', () => {
      it('should have a postInstallPolicy function', (done) => {
        assert.equal(true, typeof a.postInstallPolicy === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postInstallPolicy(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postInstallPolicy', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postInstallPolicy('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postInstallPolicy', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postInstallPolicy('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postInstallPolicy', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddPackage - errors', () => {
      it('should have a postAddPackage function', (done) => {
        assert.equal(true, typeof a.postAddPackage === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddPackage(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddPackage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddPackage('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddPackage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddPackage('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddPackage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowPackage - errors', () => {
      it('should have a postShowPackage function', (done) => {
        assert.equal(true, typeof a.postShowPackage === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowPackage(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowPackage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowPackage('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowPackage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowPackage('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowPackage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetPackage - errors', () => {
      it('should have a postSetPackage function', (done) => {
        assert.equal(true, typeof a.postSetPackage === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetPackage(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetPackage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetPackage('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetPackage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetPackage('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetPackage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeletePackage - errors', () => {
      it('should have a postDeletePackage function', (done) => {
        assert.equal(true, typeof a.postDeletePackage === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeletePackage(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeletePackage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeletePackage('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeletePackage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeletePackage('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeletePackage', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowPackages - errors', () => {
      it('should have a postShowPackages function', (done) => {
        assert.equal(true, typeof a.postShowPackages === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowPackages(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowPackages', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowPackages('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowPackages', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowPackages('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowPackages', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddDomain - errors', () => {
      it('should have a postAddDomain function', (done) => {
        assert.equal(true, typeof a.postAddDomain === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddDomain(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddDomain('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddDomain('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDomain - errors', () => {
      it('should have a postShowDomain function', (done) => {
        assert.equal(true, typeof a.postShowDomain === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDomain(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDomain('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDomain('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetDomain - errors', () => {
      it('should have a postSetDomain function', (done) => {
        assert.equal(true, typeof a.postSetDomain === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetDomain(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetDomain('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetDomain('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteDomain - errors', () => {
      it('should have a postDeleteDomain function', (done) => {
        assert.equal(true, typeof a.postDeleteDomain === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteDomain(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteDomain('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteDomain('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowDomains - errors', () => {
      it('should have a postShowDomains function', (done) => {
        assert.equal(true, typeof a.postShowDomains === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDomains(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowDomains', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDomains('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowDomains', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowDomains('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowDomains', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowGlobalDomain - errors', () => {
      it('should have a postShowGlobalDomain function', (done) => {
        assert.equal(true, typeof a.postShowGlobalDomain === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGlobalDomain(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowGlobalDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGlobalDomain('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowGlobalDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGlobalDomain('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowGlobalDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetGlobalDomain - errors', () => {
      it('should have a postSetGlobalDomain function', (done) => {
        assert.equal(true, typeof a.postSetGlobalDomain === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGlobalDomain(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetGlobalDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGlobalDomain('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetGlobalDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGlobalDomain('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetGlobalDomain', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowMds - errors', () => {
      it('should have a postShowMds function', (done) => {
        assert.equal(true, typeof a.postShowMds === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowMds(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowMds', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowMds('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowMds', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowMds('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowMds', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowMdss - errors', () => {
      it('should have a postShowMdss function', (done) => {
        assert.equal(true, typeof a.postShowMdss === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowMdss(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowMdss', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowMdss('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowMdss', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowMdss('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowMdss', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowPlaceHolder - errors', () => {
      it('should have a postShowPlaceHolder function', (done) => {
        assert.equal(true, typeof a.postShowPlaceHolder === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowPlaceHolder(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowPlaceHolder', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowPlaceHolder('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowPlaceHolder', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowPlaceHolder('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowPlaceHolder', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddGlobalAssignment - errors', () => {
      it('should have a postAddGlobalAssignment function', (done) => {
        assert.equal(true, typeof a.postAddGlobalAssignment === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddGlobalAssignment(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddGlobalAssignment', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddGlobalAssignment('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddGlobalAssignment', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddGlobalAssignment('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddGlobalAssignment', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowGlobalAssignment - errors', () => {
      it('should have a postShowGlobalAssignment function', (done) => {
        assert.equal(true, typeof a.postShowGlobalAssignment === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGlobalAssignment(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowGlobalAssignment', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGlobalAssignment('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowGlobalAssignment', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGlobalAssignment('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowGlobalAssignment', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetGlobalAssignment - errors', () => {
      it('should have a postSetGlobalAssignment function', (done) => {
        assert.equal(true, typeof a.postSetGlobalAssignment === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGlobalAssignment(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetGlobalAssignment', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGlobalAssignment('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetGlobalAssignment', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetGlobalAssignment('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetGlobalAssignment', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteGlobalAssignment - errors', () => {
      it('should have a postDeleteGlobalAssignment function', (done) => {
        assert.equal(true, typeof a.postDeleteGlobalAssignment === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteGlobalAssignment(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteGlobalAssignment', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteGlobalAssignment('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteGlobalAssignment', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteGlobalAssignment('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteGlobalAssignment', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowGlobalAssignments - errors', () => {
      it('should have a postShowGlobalAssignments function', (done) => {
        assert.equal(true, typeof a.postShowGlobalAssignments === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGlobalAssignments(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowGlobalAssignments', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGlobalAssignments('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowGlobalAssignments', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGlobalAssignments('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowGlobalAssignments', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAssignGlobalAssignment - errors', () => {
      it('should have a postAssignGlobalAssignment function', (done) => {
        assert.equal(true, typeof a.postAssignGlobalAssignment === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAssignGlobalAssignment(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAssignGlobalAssignment', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAssignGlobalAssignment('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAssignGlobalAssignment', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAssignGlobalAssignment('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAssignGlobalAssignment', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postWhereUsed - errors', () => {
      it('should have a postWhereUsed function', (done) => {
        assert.equal(true, typeof a.postWhereUsed === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postWhereUsed(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postWhereUsed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postWhereUsed('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postWhereUsed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postWhereUsed('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postWhereUsed', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTask - errors', () => {
      it('should have a postShowTask function', (done) => {
        assert.equal(true, typeof a.postShowTask === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTask(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowTask', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTask('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowTask', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTask('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowTask', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postRunScript - errors', () => {
      it('should have a postRunScript function', (done) => {
        assert.equal(true, typeof a.postRunScript === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postRunScript(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postRunScript', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postRunScript('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postRunScript', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postRunScript('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postRunScript', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowUnusedObjects - errors', () => {
      it('should have a postShowUnusedObjects function', (done) => {
        assert.equal(true, typeof a.postShowUnusedObjects === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowUnusedObjects(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowUnusedObjects', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowUnusedObjects('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowUnusedObjects', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowUnusedObjects('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowUnusedObjects', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postExport - errors', () => {
      it('should have a postExport function', (done) => {
        assert.equal(true, typeof a.postExport === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postExport(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postExport', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postExport('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postExport', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postExport('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postExport', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowChanges - errors', () => {
      it('should have a postShowChanges function', (done) => {
        assert.equal(true, typeof a.postShowChanges === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowChanges(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowChanges', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowChanges('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowChanges', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowChanges('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowChanges', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowGatewaysAndServers - errors', () => {
      it('should have a postShowGatewaysAndServers function', (done) => {
        assert.equal(true, typeof a.postShowGatewaysAndServers === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGatewaysAndServers(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowGatewaysAndServers', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGatewaysAndServers('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowGatewaysAndServers', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowGatewaysAndServers('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowGatewaysAndServers', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowObjects - errors', () => {
      it('should have a postShowObjects function', (done) => {
        assert.equal(true, typeof a.postShowObjects === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowObjects(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowObjects', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowObjects('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowObjects', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowObjects('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowObjects', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowValidations - errors', () => {
      it('should have a postShowValidations function', (done) => {
        assert.equal(true, typeof a.postShowValidations === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowValidations(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowValidations', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowValidations('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowValidations', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowValidations('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowValidations', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowTasks - errors', () => {
      it('should have a postShowTasks function', (done) => {
        assert.equal(true, typeof a.postShowTasks === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTasks(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowTasks', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTasks('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowTasks', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowTasks('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowTasks', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowApiVersions - errors', () => {
      it('should have a postShowApiVersions function', (done) => {
        assert.equal(true, typeof a.postShowApiVersions === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApiVersions(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowApiVersions', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApiVersions('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowApiVersions', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApiVersions('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowApiVersions', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowObject - errors', () => {
      it('should have a postShowObject function', (done) => {
        assert.equal(true, typeof a.postShowObject === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowObject(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowObject('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowObject('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowObject', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowCommands - errors', () => {
      it('should have a postShowCommands function', (done) => {
        assert.equal(true, typeof a.postShowCommands === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowCommands(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowCommands', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowCommands('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowCommands', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowCommands('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowCommands', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postPutFile - errors', () => {
      it('should have a postPutFile function', (done) => {
        assert.equal(true, typeof a.postPutFile === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postPutFile(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postPutFile', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postPutFile('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postPutFile', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postPutFile('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postPutFile', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postAddAdministrator - errors', () => {
      it('should have a postAddAdministrator function', (done) => {
        assert.equal(true, typeof a.postAddAdministrator === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAdministrator(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postAddAdministrator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAdministrator('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postAddAdministrator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postAddAdministrator('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postAddAdministrator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAdministrator - errors', () => {
      it('should have a postShowAdministrator function', (done) => {
        assert.equal(true, typeof a.postShowAdministrator === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAdministrator(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowAdministrator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAdministrator('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowAdministrator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAdministrator('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowAdministrator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetAdministrator - errors', () => {
      it('should have a postSetAdministrator function', (done) => {
        assert.equal(true, typeof a.postSetAdministrator === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAdministrator(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetAdministrator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAdministrator('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetAdministrator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetAdministrator('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetAdministrator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postDeleteAdministrator - errors', () => {
      it('should have a postDeleteAdministrator function', (done) => {
        assert.equal(true, typeof a.postDeleteAdministrator === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAdministrator(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postDeleteAdministrator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAdministrator('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postDeleteAdministrator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postDeleteAdministrator('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postDeleteAdministrator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowAdministrators - errors', () => {
      it('should have a postShowAdministrators function', (done) => {
        assert.equal(true, typeof a.postShowAdministrators === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAdministrators(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowAdministrators', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAdministrators('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowAdministrators', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowAdministrators('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowAdministrators', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postUnlockAdministrator - errors', () => {
      it('should have a postUnlockAdministrator function', (done) => {
        assert.equal(true, typeof a.postUnlockAdministrator === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postUnlockAdministrator(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postUnlockAdministrator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postUnlockAdministrator('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postUnlockAdministrator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postUnlockAdministrator('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postUnlockAdministrator', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postShowApiSettings - errors', () => {
      it('should have a postShowApiSettings function', (done) => {
        assert.equal(true, typeof a.postShowApiSettings === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApiSettings(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postShowApiSettings', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApiSettings('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postShowApiSettings', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postShowApiSettings('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postShowApiSettings', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });

    describe('#postSetApiSettings - errors', () => {
      it('should have a postSetApiSettings function', (done) => {
        assert.equal(true, typeof a.postSetApiSettings === 'function');
        done();
      }).timeout(attemptTimeout);
      it('should error if - missing ContentType', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApiSettings(null, null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('ContentType is required for postSetApiSettings', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing Xchkpsid', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApiSettings('fakeparam', null, null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('Xchkpsid is required for postSetApiSettings', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
      it('should error if - missing body', (done) => {
        const p = new Promise((resolve) => {
          a.postSetApiSettings('fakeparam', 'fakeparam', null, (data, error) => {
            resolve(data);
            assert.notEqual(undefined, error);
            assert.notEqual(null, error);
            assert.equal(null, data);
            assert.equal('body is required for postSetApiSettings', error);
            done();
          });
        });
        // log just done to get rid of const lint issue!
        log.debug(p);
      }).timeout(attemptTimeout);
    });
  });
});
