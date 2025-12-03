// Set globals
/* global describe it log pronghornProps beforeEach afterEach */
/* eslint global-require: warn */
/* eslint no-unused-vars: warn */

// include required items for testing & logging
const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');
const mocha = require('mocha');
const winston = require('winston');
const { expect } = require('chai');
const { use } = require('chai');
const td = require('testdouble');
const entitiesToDB = require('../../utils/entitiesToDB');
const troubleshootingAdapter = require('../../utils/troubleshootingAdapter');
const log = require('../../utils/logger');

const anything = td.matchers.anything();

// stub and attemptTimeout are used throughout the code so set them here
const stub = true;
const isRapidFail = false;
const attemptTimeout = 120000;

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
      id: 'Test-Base',
      type: 'ABase',
      properties: {
        host,
        port,
        base_path: '/',
        version: '',
        cache_location: 'local',
        encode_pathvars: true,
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
          auth_field_format: 'Basic {b64}{username}:{password}{/b64}',
          auth_logging: false,
          client_id: '',
          client_secret: '',
          grant_type: ''
        },
        healthcheck: {
          type: 'none',
          frequency: 60000,
          query_object: {}
        },
        throttle: {
          throttle_enabled: false,
          number_pronghorns: 1,
          sync_async: 'sync',
          max_in_queue: 1000,
          concurrent_max: 1,
          expire_timeout: 0,
          avg_runtime: 200,
          priorities: [
            {
              value: 0,
              percent: 100
            }
          ]
        },
        request: {
          number_redirects: 0,
          number_retries: 3,
          limit_retry_error: [0],
          failover_codes: [],
          attempt_timeout: attemptTimeout,
          global_request: {
            payload: {},
            uriOptions: {},
            addlHeaders: {},
            authData: {}
          },
          healthcheck_on_timeout: true,
          return_raw: true,
          archiving: false,
          return_request: false
        },
        proxy: {
          enabled: false,
          host: '',
          port: 1,
          protocol: 'http',
          username: '',
          password: ''
        },
        ssl: {
          ecdhCurve: '',
          enabled: sslenable,
          accept_invalid_cert: sslinvalid,
          ca_file: '',
          key_file: '',
          cert_file: '',
          secure_protocol: '',
          ciphers: ''
        },
        mongo: {
          host: '',
          port: 0,
          database: '',
          username: '',
          password: '',
          replSet: '',
          db_ssl: {
            enabled: false,
            accept_invalid_cert: false,
            ca_file: '',
            key_file: '',
            cert_file: ''
          }
        }
      }
    }]
  }
};

global.$HOME = `${__dirname}/../..`;

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
const AdapterBase = require('../../adapterBase');

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

// Define test data at the top of the test section
const testData = {
  pronghorn: {
    id: 'test-adapter',
    name: 'Test Adapter',
    version: '1.0.0'
  },
  action: {
    actions: [{
      name: 'testAction',
      description: 'Test action description',
      method: 'GET',
      entitypath: '/test/path'
    }]
  },
  schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' }
    }
  },
  mock: {
    testData: 'value'
  }
};

describe('[unit] Adapter Base Test', () => {
  describe('Adapter Base Class Tests', () => {
    // Define constants we will use below
    const a = new AdapterBase(
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

    describe('#refreshProperties', () => {
      it('should have a refreshProperties function', (done) => {
        try {
          assert.equal(true, typeof a.refreshProperties === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('should update the properties file', (done) => {
        try {
          // Mock connections
          a.requestHandlerInst.refreshProperties = td.func();
          a.refreshProperties({ foo: 'bar' });
          // Run assert to verify we have updated a
          try {
            assert.equal(true, a.allProps.foo === 'bar');
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
      it('should fail if the validation does not match the schema', (done) => {
        try {
          // Mock connections
          a.propUtilInst.mergeProperties = td.func();
          a.refreshProperties('tacos');
          done();
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
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
      it('should have a healthCheck function', (done) => {
        try {
          assert.equal(true, typeof a.healthCheck === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('should be healthy', (done) => {
        try {
          a.healthCheck(null, (data) => {
            try {
              assert.equal(true, a.healthy);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
    });

    describe('#getAllFunctions', () => {
      it('should have a getAllFunctions function', (done) => {
        try {
          assert.equal(true, typeof a.getAllFunctions === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('should return a list of functions', (done) => {
        const returnedFunctions = ['checkActionFiles', 'checkProperties', 'connect', 'encryptProperty', 'genericAdapterRequest', 'genericAdapterRequestNoBasePath',
          'getAllFunctions', 'getConfig', 'getConfigAuth', 'getDevice', 'getDeviceAuth', 'getDevicesFiltered', 'getDevicesFilteredAuth', 'hasEntities', 'hasEntitiesAuth',
          'healthCheck', 'iapActivateTasks', 'iapDeactivateTasks', 'iapExpandedGenericAdapterRequest', 'iapFindAdapterPath', 'iapGetAdapterInventory', 'iapGetAdapterQueue',
          'iapGetAdapterWorkflowFunctions', 'iapGetDeviceCount', 'iapGetDeviceCountAuth', 'iapMoveAdapterEntitiesToDB', 'iapPopulateEntityCache', 'iapRetrieveEntitiesCache',
          'iapRunAdapterBasicGet', 'iapRunAdapterConnectivity', 'iapRunAdapterHealthcheck', 'iapRunAdapterLint', 'iapRunAdapterTests', 'iapSuspendAdapter', 'iapTroubleshootAdapter',
          'iapUnsuspendAdapter', 'iapUpdateAdapterConfiguration', 'isAlive', 'isAliveAuth', 'parseIapMetadata', 'refreshProperties', 'addListener', 'emit', 'eventNames', 'getMaxListeners',
          'listenerCount', 'listeners', 'off', 'on', 'once', 'prependListener', 'prependOnceListener', 'rawListeners', 'removeAllListeners', 'removeListener', 'setMaxListeners'];
        try {
          const expectedFunctions = a.getAllFunctions();
          try {
            assert.equal(JSON.stringify(expectedFunctions), JSON.stringify(returnedFunctions));
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

    describe('#iapGetAdapterWorkflowFunctions', () => {
      it('should have a iapGetAdapterWorkflowFunctions function', (done) => {
        try {
          assert.equal(true, typeof a.iapGetAdapterWorkflowFunctions === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });
      it('should retrieve workflow functions', (done) => {
        try {
          const expectedFunctions = a.iapGetAdapterWorkflowFunctions([]);
          try {
            assert.equal(0, expectedFunctions.length);
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
      it('should return no updated if no changes are provided', (done) => {
        try {
          a.iapUpdateAdapterConfiguration(null, null, null, null, null, null, (data, error) => {
            try {
              assert.equal('No configuration updates to make', data.response);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('should throw an error if missing configuration file', (done) => {
        try {
          a.iapUpdateAdapterConfiguration(null, { name: 'fakeChange' }, null, null, null, null, (data, error) => {
            try {
              const displayE = 'configFile is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-Base-adapterBase-iapUpdateAdapterConfiguration', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('if not package.json, entity is required', (done) => {
        try {
          a.iapUpdateAdapterConfiguration('notPackage', { name: 'fakeChange' }, null, null, null, null, (data, error) => {
            try {
              const displayE = 'Unsupported Configuration Change or Missing Entity';
              runErrorAsserts(data, error, 'AD.999', 'Test-Base-adapterBase-iapUpdateAdapterConfiguration', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('if not package.json, type is required', (done) => {
        try {
          a.iapUpdateAdapterConfiguration('notPackage', { name: 'fakeChange' }, 'entity', null, null, null, (data, error) => {
            try {
              const displayE = 'type is required';
              runErrorAsserts(data, error, 'AD.300', 'Test-Base-adapterBase-iapUpdateAdapterConfiguration', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
      it('if not package.json, entity must be valid', (done) => {
        try {
          a.iapUpdateAdapterConfiguration('notPackage', { name: 'fakeChange' }, 'fakeEntity', 'fakeType', null, null, (data, error) => {
            try {
              const displayE = 'Incomplete Configuration Change: Invalid Entity - fakeEntity';
              runErrorAsserts(data, error, 'AD.999', 'Test-Base-adapterBase-iapUpdateAdapterConfiguration', displayE);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);

      // Single working test for action update
      // it('should update an action configuration', (done) => {
      //   const adapterId = testData.pronghorn.id;

      //   // Create mock fs module with promises
      //   const mockFs = {
      //     existsSync: td.func('existsSync'),
      //     lstatSync: td.func('lstatSync'),
      //     promises: {
      //       writeFile: td.func('writeFile')
      //     }
      //   };

      //   // Replace fs module
      //   td.replace('fs', mockFs);
      //   td.replace('fs-extra', mockFs);

      //   // Mock MongoDB connection
      //   const mockMongoDBConnection = td.constructor(['connect', 'closeConnection']);
      //   td.replace('../../utils/mongoDbConnection', mockMongoDBConnection);

      //   // Set up MongoDB properties
      //   a.allProps = {
      //     mongo: {
      //       host: 'localhost',
      //       port: 27017,
      //       database: 'test'
      //     }
      //   };

      //   // Mock MongoDB operations
      //   const mockDb = {
      //     collection: td.func('collection')
      //   };
      //   const mockCollection = {
      //     findOne: td.func('findOne'),
      //     updateOne: td.func('updateOne')
      //   };

      //   td.when(mockMongoDBConnection.prototype.connect()).thenResolve({ db: mockDb });
      //   td.when(mockDb.collection('adapter_configs')).thenReturn(mockCollection);
      //   td.when(mockCollection.findOne(td.matchers.anything())).thenResolve({
      //     id: 'test',
      //     type: adapterId,
      //     entity: 'testEntity',
      //     actions: []
      //   });
      //   td.when(mockCollection.updateOne(td.matchers.anything(), td.matchers.anything())).thenResolve({ modifiedCount: 1 });

      //   // Test the update
      //   a.iapUpdateAdapterConfiguration(
      //     'action.json',
      //     { name: 'testAction', method: 'GET', entitypath: '/test/path' },
      //     'testEntity',
      //     'action',
      //     'testAction',
      //     null,
      //     (data, error) => {
      //       assert.equal(null, data);
      //       assert.notEqual(null, error);
      //       assert.equal('AD.999', error.icode);
      //       done();
      //     }
      //   );
      // });

      // it('should update a schema configuration', (done) => {
      //   const adapterId = testData.pronghorn.id;

      //   // Create mock fs module with promises
      //   const mockFs = {
      //     existsSync: td.func('existsSync'),
      //     lstatSync: td.func('lstatSync'),
      //     promises: {
      //       writeFile: td.func('writeFile')
      //     }
      //   };

      //   // Replace fs module
      //   td.replace('fs', mockFs);
      //   td.replace('fs-extra', mockFs);

      //   // Mock MongoDB connection
      //   const mockMongoDBConnection = td.constructor(['connect', 'closeConnection']);
      //   td.replace('../../utils/mongoDbConnection', mockMongoDBConnection);

      //   // Set up MongoDB properties
      //   a.allProps = {
      //     mongo: {
      //       host: 'localhost',
      //       port: 27017,
      //       database: 'test'
      //     }
      //   };

      //   // Mock MongoDB operations
      //   const mockDb = {
      //     collection: td.func('collection')
      //   };
      //   const mockCollection = {
      //     findOne: td.func('findOne'),
      //     updateOne: td.func('updateOne')
      //   };

      //   td.when(mockMongoDBConnection.prototype.connect()).thenResolve({ db: mockDb });
      //   td.when(mockDb.collection('adapter_configs')).thenReturn(mockCollection);
      //   td.when(mockCollection.findOne(td.matchers.anything())).thenResolve({
      //     id: 'test',
      //     type: adapterId,
      //     entity: 'testEntity',
      //     schema: []
      //   });
      //   td.when(mockCollection.updateOne(td.matchers.anything(), td.matchers.anything())).thenResolve({ modifiedCount: 1 });

      //   // Test the update
      //   a.iapUpdateAdapterConfiguration(
      //     'schema.json',
      //     { type: 'object', properties: { newField: { type: 'string' } } },
      //     'testEntity',
      //     'schema',
      //     null,
      //     false,
      //     (data, error) => {
      //       assert.equal(null, data);
      //       assert.notEqual(null, error);
      //       assert.equal('AD.999', error.icode);
      //       done();
      //     }
      //   );
      // });

      // it('should update a mock data configuration', (done) => {
      //   const adapterId = testData.pronghorn.id;

      //   // Create mock fs module with promises
      //   const mockFs = {
      //     existsSync: td.func('existsSync'),
      //     lstatSync: td.func('lstatSync'),
      //     promises: {
      //       writeFile: td.func('writeFile'),
      //       mkdir: td.func('mkdir')
      //     }
      //   };

      //   // Replace fs module
      //   td.replace('fs', mockFs);
      //   td.replace('fs-extra', mockFs);

      //   // Mock MongoDB connection
      //   const mockMongoDBConnection = td.constructor(['connect', 'closeConnection']);
      //   td.replace('../../utils/mongoDbConnection', mockMongoDBConnection);

      //   // Set up MongoDB properties
      //   a.allProps = {
      //     mongo: {
      //       host: 'localhost',
      //       port: 27017,
      //       database: 'test'
      //     }
      //   };

      //   // Mock MongoDB operations
      //   const mockDb = {
      //     collection: td.func('collection')
      //   };
      //   const mockCollection = {
      //     findOne: td.func('findOne'),
      //     updateOne: td.func('updateOne')
      //   };

      //   td.when(mockMongoDBConnection.prototype.connect()).thenResolve({ db: mockDb });
      //   td.when(mockDb.collection('adapter_configs')).thenReturn(mockCollection);
      //   td.when(mockCollection.findOne(td.matchers.anything())).thenResolve({
      //     id: 'test',
      //     type: adapterId,
      //     entity: 'testEntity',
      //     mockdatafiles: {}
      //   });
      //   td.when(mockCollection.updateOne(td.matchers.anything(), td.matchers.anything())).thenResolve({ modifiedCount: 1 });

      //   // Test the update
      //   a.iapUpdateAdapterConfiguration(
      //     'mock.json',
      //     { testData: 'new value' },
      //     'testEntity',
      //     'mock',
      //     null,
      //     true,
      //     (data, error) => {
      //       assert.equal(null, data);
      //       assert.notEqual(null, error);
      //       assert.equal('AD.999', error.icode);
      //       done();
      //     }
      //   );
      // });

      // it('should handle MongoDB errors', (done) => {
      //   const adapterId = testData.pronghorn.id;
      //   const changes = {
      //     name: 'testAction',
      //     method: 'GET',
      //     entitypath: '/test/path'
      //   };

      //   // Mock MongoDBConnection to simulate error
      //   const originalMongoDBConnection = require('../../utils/mongoDbConnection').MongoDBConnection;
      //   const mockMongoDBConnection = {
      //     connect: td.func('connect'),
      //     db: {
      //       collection: td.func('collection')
      //     },
      //     closeConnection: td.func('closeConnection')
      //   };
      //   require('../../utils/mongoDbConnection').MongoDBConnection = function () {
      //     return mockMongoDBConnection;
      //   };

      //   // Set up MongoDB properties
      //   a.allProps = {
      //     mongo: {
      //       host: 'localhost',
      //       port: 27017,
      //       database: 'test'
      //     }
      //   };

      //   // Mock MongoDB operations to fail
      //   td.when(mockMongoDBConnection.connect()).thenReject(new Error('MongoDB error'));

      //   a.iapUpdateAdapterConfiguration('action.json', changes, 'testEntity', 'action', 'testAction', null, (data, error) => {
      //     assert.equal(null, data);
      //     assert.notEqual(null, error);
      //     assert.equal('AD.999', error.icode);
      //     // Restore original MongoDBConnection
      //     require('../../utils/mongoDbConnection').MongoDBConnection = originalMongoDBConnection;
      //     done();
      //   });
      // }).timeout(attemptTimeout);
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
      it('should successfully suspend the adapter', (done) => {
        try {
          a.iapSuspendAdapter('nopause', (data, error) => {
            try {
              assert.notEqual(null, data);
              assert.notEqual(null, data.suspended);
              assert.equal(true, data.suspended);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
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
      it('should successfully unsuspend the adapter', (done) => {
        try {
          a.iapUnsuspendAdapter((data, error) => {
            try {
              assert.notEqual(null, data);
              assert.notEqual(null, data.suspend);
              assert.equal(false, data.suspend);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
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
      it('should get information for all of the requests currently in the queue', (done) => {
        try {
          a.iapGetAdapterQueue((data, error) => {
            try {
              assert.notEqual(null, data);
              assert.equal(0, data.length);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
              done(err);
            }
          });
        } catch (error) {
          log.error(`Adapter Exception: ${error}`);
          done(error);
        }
      }).timeout(attemptTimeout);
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
      it('should fail - missing path', (done) => {
        try {
          a.iapFindAdapterPath(null, (data, error) => {
            try {
              assert.notEqual(null, error);
              assert.notEqual(null, error.message);
              assert.equal('NO PATH PROVIDED!', error.message);
              done();
            } catch (err) {
              log.error(`Test Failure: ${err}`);
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
      beforeEach(() => {
        td.replace(troubleshootingAdapter, 'troubleshoot', td.func());
      });

      afterEach(() => {
        td.reset();
      });

      it('should have a iapTroubleshootAdapter function', (done) => {
        try {
          assert.equal(true, typeof a.iapTroubleshootAdapter === 'function');
          done();
        } catch (error) {
          log.error(`Test Failure: ${error}`);
          done(error);
        }
      });

      // it('should successfully troubleshoot adapter with valid properties', (done) => {
      //   try {
      //     const mockResult = {
      //       connectivity: { failCount: 0 },
      //       healthCheck: true,
      //       basicGet: { passCount: 1 }
      //     };

      //     td.when(troubleshootingAdapter.troubleshoot(td.matchers.anything(), false, td.matchers.anything()))
      //       .thenResolve(mockResult);

      //     a.iapTroubleshootAdapter({}, false, a, (result, error) => {
      //       try {
      //         assert.equal(undefined, error);
      //         assert.notEqual(undefined, result);
      //         assert.notEqual(null, result);
      //         assert.equal(true, result.healthCheck);
      //         assert.equal(0, result.connectivity.failCount);
      //         assert.equal(1, result.basicGet.passCount);
      //         done();
      //       } catch (err) {
      //         log.error(`Test Failure: ${err}`);
      //         done(err);
      //       }
      //     });
      //   } catch (error) {
      //     log.error(`Adapter Exception: ${error}`);
      //     done(error);
      //   }
      // }).timeout(attemptTimeout);

      // it('should handle failed troubleshooting', (done) => {
      //   try {
      //     const mockResult = {
      //       connectivity: { failCount: 1 },
      //       healthCheck: false,
      //       basicGet: { passCount: 0 }
      //     };

      //     td.when(troubleshootingAdapter.troubleshoot(td.matchers.anything(), false, td.matchers.anything()))
      //       .thenResolve(mockResult);

      //     a.iapTroubleshootAdapter({}, false, a, (result, error) => {
      //       try {
      //         assert.equal(null, result);
      //         assert.notEqual(undefined, error);
      //         assert.notEqual(null, error);
      //         assert.equal(false, error.healthCheck);
      //         assert.equal(1, error.connectivity.failCount);
      //         assert.equal(0, error.basicGet.passCount);
      //         done();
      //       } catch (err) {
      //         log.error(`Test Failure: ${err}`);
      //         done(err);
      //       }
      //     });
      //   } catch (error) {
      //     log.error(`Adapter Exception: ${error}`);
      //     done(error);
      //   }
      // }).timeout(attemptTimeout);

      // it('should handle troubleshooting errors', (done) => {
      //   try {
      //     td.when(troubleshootingAdapter.troubleshoot(td.matchers.anything(), false, td.matchers.anything()))
      //       .thenReject(new Error('Troubleshooting failed'));

      //     a.iapTroubleshootAdapter({}, false, a, (result, error) => {
      //       try {
      //         assert.equal(null, result);
      //         assert.notEqual(undefined, error);
      //         assert.notEqual(null, error);
      //         assert.equal('Troubleshooting failed', error.message);
      //         done();
      //       } catch (err) {
      //         log.error(`Test Failure: ${err}`);
      //         done(err);
      //       }
      //     });
      //   } catch (error) {
      //     log.error(`Adapter Exception: ${error}`);
      //     done(error);
      //   }
      // }).timeout(attemptTimeout);

      // it('should handle missing adapter instance', (done) => {
      //   try {
      //     a.iapTroubleshootAdapter({}, false, null, (result, error) => {
      //       try {
      //         assert.equal(null, result);
      //         assert.notEqual(undefined, error);
      //         assert.notEqual(null, error);
      //         // Check for either error message format
      //         assert.ok(
      //           error.message === "Cannot read property 'healthCheck' of undefined"
      //           || error.message === "Cannot read properties of undefined (reading 'healthCheck')",
      //           `Unexpected error message: ${error.message}`
      //         );
      //         done();
      //       } catch (err) {
      //         log.error(`Test Failure: ${err}`);
      //         done(err);
      //       }
      //     });
      //   } catch (error) {
      //     log.error(`Adapter Exception: ${error}`);
      //     done(error);
      //   }
      // }).timeout(attemptTimeout);
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

      // describe('Connection String Tests', () => {
      //   beforeEach(() => {
      //     // Initialize allProps if it doesn't exist
      //     if (!a.allProps) {
      //       a.allProps = {};
      //     }
      //     // Initialize mongo properties with defaults
      //     a.allProps.mongo = {
      //       host: '',
      //       port: 0,
      //       database: '',
      //       dbAuth: false,
      //       username: '',
      //       password: '',
      //       replSet: '',
      //       addSrv: false,
      //       db_ssl: {
      //         enabled: false,
      //         accept_invalid_cert: false,
      //         ca_file: '',
      //         key_file: '',
      //         cert_file: ''
      //       }
      //     };
      //   });

      //   it('should prioritize URL over individual properties when both are provided', (done) => {
      //     // Mock the moveEntitiesToDB function
      //     entitiesToDB.moveEntitiesToDB = td.func();

      //     // Set both URL and individual properties
      //     a.allProps.mongo.url = 'mongodb://localhost:27017/urldb';
      //     a.allProps.mongo.host = 'differenthost';
      //     a.allProps.mongo.port = 12345;
      //     a.allProps.mongo.database = 'propdb';

      //     // Mock successful database operation
      //     td.when(entitiesToDB.moveEntitiesToDB(
      //       td.matchers.anything(),
      //       td.matchers.contains({
      //         pronghornProps: {
      //           mongo: a.allProps.mongo
      //         },
      //         id: a.id
      //       })
      //     )).thenResolve({ insertedCount: 1 });

      //     // Call the function
      //     a.iapMoveAdapterEntitiesToDB((result, error) => {
      //       try {
      //         assert.notEqual(null, result);
      //         assert.equal(null, error);
      //         assert.equal(1, result.insertedCount);
      //         done();
      //       } catch (err) {
      //         done(err);
      //       }
      //     });
      //   }).timeout(attemptTimeout);

      //   it('should correctly form connection string from URL with database override', (done) => {
      //     // Mock the moveEntitiesToDB function
      //     entitiesToDB.moveEntitiesToDB = td.func();

      //     // Set URL-based connection with different database in URL vs properties
      //     a.allProps.mongo.url = 'mongodb://localhost:27017/urldb';
      //     a.allProps.mongo.database = 'propdb';

      //     // Mock successful database operation
      //     td.when(entitiesToDB.moveEntitiesToDB(
      //       td.matchers.anything(),
      //       td.matchers.contains({
      //         pronghornProps: {
      //           mongo: a.allProps.mongo
      //         },
      //         id: a.id
      //       })
      //     )).thenResolve({ insertedCount: 1 });

      //     // Call the function
      //     a.iapMoveAdapterEntitiesToDB((result, error) => {
      //       try {
      //         assert.notEqual(null, result);
      //         assert.equal(null, error);
      //         assert.equal(1, result.insertedCount);
      //         done();
      //       } catch (err) {
      //         done(err);
      //       }
      //     });
      //   }).timeout(attemptTimeout);

      //   it('should correctly form connection string from individual properties with SSL', (done) => {
      //     // Mock the moveEntitiesToDB function
      //     entitiesToDB.moveEntitiesToDB = td.func();

      //     // Update adapter properties with SSL configuration without sensitive data
      //     a.allProps.mongo = {
      //       host: 'localhost',
      //       port: 27017,
      //       database: 'testdb',
      //       replSet: 'rs0',
      //       addSrv: false,
      //       db_ssl: {
      //         enabled: true,
      //         accept_invalid_cert: true
      //       }
      //     };

      //     // Mock successful database operation
      //     td.when(entitiesToDB.moveEntitiesToDB(
      //       td.matchers.anything(),
      //       td.matchers.contains({
      //         pronghornProps: {
      //           mongo: a.allProps.mongo
      //         },
      //         id: a.id
      //       })
      //     )).thenResolve({ insertedCount: 1 });

      //     // Call the function
      //     a.iapMoveAdapterEntitiesToDB((result, error) => {
      //       try {
      //         assert.notEqual(null, result);
      //         assert.equal(null, error);
      //         assert.equal(1, result.insertedCount);
      //         done();
      //       } catch (err) {
      //         done(err);
      //       }
      //     });
      //   }).timeout(attemptTimeout);

      //   it('should handle missing required properties', (done) => {
      //     // Mock the moveEntitiesToDB function to throw an error
      //     entitiesToDB.moveEntitiesToDB = td.func();
      //     td.when(entitiesToDB.moveEntitiesToDB(td.matchers.anything(), td.matchers.anything()))
      //       .thenReject(new Error('Missing required property: database'));

      //     // Call the function with incomplete properties
      //     a.allProps.mongo = {
      //       host: 'localhost',
      //       port: 27017
      //       // Missing database property
      //     };

      //     a.iapMoveAdapterEntitiesToDB((result, error) => {
      //       try {
      //         assert.equal(null, result);
      //         assert.notEqual(null, error);
      //         assert.equal('Missing required property: database', error);
      //         done();
      //       } catch (err) {
      //         done(err);
      //       }
      //     });
      //   }).timeout(attemptTimeout);

      //   it('should handle invalid URL format', (done) => {
      //     // Mock the moveEntitiesToDB function to throw an error
      //     entitiesToDB.moveEntitiesToDB = td.func();
      //     td.when(entitiesToDB.moveEntitiesToDB(td.matchers.anything(), td.matchers.anything()))
      //       .thenReject(new Error('Invalid URL format'));

      //     // Call the function with invalid URL
      //     a.allProps.mongo.url = 'invalid-url';

      //     a.iapMoveAdapterEntitiesToDB((result, error) => {
      //       try {
      //         assert.equal(null, result);
      //         assert.notEqual(null, error);
      //         assert.equal('Invalid URL format', error);
      //         done();
      //       } catch (err) {
      //         done(err);
      //       }
      //     });
      //   }).timeout(attemptTimeout);

      //   it('should handle connection errors gracefully', (done) => {
      //     // Mock the moveEntitiesToDB function to throw a connection error
      //     entitiesToDB.moveEntitiesToDB = td.func();
      //     td.when(entitiesToDB.moveEntitiesToDB(td.matchers.anything(), td.matchers.anything()))
      //       .thenReject(new Error('Failed to connect to MongoDB'));

      //     // Set valid connection properties
      //     a.allProps.mongo = {
      //       host: 'localhost',
      //       port: 27017,
      //       database: 'testdb'
      //     };

      //     a.iapMoveAdapterEntitiesToDB((result, error) => {
      //       try {
      //         assert.equal(null, result);
      //         assert.notEqual(null, error);
      //         assert.equal('Failed to connect to MongoDB', error);
      //         done();
      //       } catch (err) {
      //         done(err);
      //       }
      //     });
      //   }).timeout(attemptTimeout);

      //   it('should handle authentication errors', (done) => {
      //     // Mock the moveEntitiesToDB function to throw an auth error
      //     entitiesToDB.moveEntitiesToDB = td.func();
      //     td.when(entitiesToDB.moveEntitiesToDB(td.matchers.anything(), td.matchers.anything()))
      //       .thenReject(new Error('Authentication failed'));

      //     // Set properties without any sensitive data
      //     a.allProps.mongo = {
      //       host: 'localhost',
      //       port: 27017,
      //       database: 'testdb',
      //       dbAuth: true
      //     };

      //     a.iapMoveAdapterEntitiesToDB((result, error) => {
      //       try {
      //         assert.equal(null, result);
      //         assert.notEqual(null, error);
      //         assert.equal('Authentication failed', error);
      //         done();
      //       } catch (err) {
      //         done(err);
      //       }
      //     });
      //   }).timeout(attemptTimeout);

      //   it('should handle missing connection properties', (done) => {
      //     // Mock the moveEntitiesToDB function to throw an error
      //     entitiesToDB.moveEntitiesToDB = td.func();
      //     td.when(entitiesToDB.moveEntitiesToDB(td.matchers.anything(), td.matchers.anything()))
      //       .thenReject(new Error('No connection properties provided'));

      //     // Clear all connection properties
      //     a.allProps.mongo = {};

      //     a.iapMoveAdapterEntitiesToDB((result, error) => {
      //       try {
      //         assert.equal(null, result);
      //         assert.notEqual(null, error);
      //         assert.equal('No connection properties provided', error);
      //         done();
      //       } catch (err) {
      //         done(err);
      //       }
      //     });
      //   }).timeout(attemptTimeout);
      // });
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
    });
  });
});
