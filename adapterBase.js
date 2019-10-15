/* @copyright Itential, LLC 2018-9 */

// Set globals
/* global log */
/* eslint class-methods-use-this:warn */
/* eslint import/no-dynamic-require: warn */

/* Required libraries.  */
const fs = require('fs-extra');
const path = require('path');
const EventEmitterCl = require('events').EventEmitter;

/* The schema validator */
const AjvCl = require('ajv');

/* Fetch in the other needed components for the this Adaptor */
const PropUtilCl = require(path.join(__dirname, '/node_modules/@itential/adapter-utils/lib/propertyUtil.js'));
const RequestHandlerCl = require(path.join(__dirname, '/node_modules/@itential/adapter-utils/lib/requestHandler.js'));


/* GENERAL ADAPTER FUNCTIONS THESE SHOULD NOT BE DIRECTLY MODIFIED */
/* IF YOU NEED MODIFICATIONS, REDEFINE THEM IN adapter.js!!! */
class AdapterBase extends EventEmitterCl {
  /**
   * [System] Adapter
   * @constructor
   */
  constructor(prongid, properties) {
    // Instantiate the EventEmitter super class
    super();

    // Capture the adapter id
    this.id = prongid;
    this.propUtilInst = new PropUtilCl(prongid, __dirname);

    this.alive = false;
    this.healthy = false;
    this.caching = false;
    this.repeatCacheCount = 0;
    this.allowFailover = 'AD.300';
    this.noFailover = 'AD.500';

    // set up the properties I care about
    this.refreshProperties(properties);

    // Instantiate the other components for this Adapter
    try {
      this.requestHandlerInst = new RequestHandlerCl(this.id, this.allProps, __dirname);
    } catch (e) {
      log.error(e);
    }
  }


  /**
   * @callback healthCallback
   * @param {Object} result - the result of the get request (contains an id and a status)
   */
  /**
   * @callback getCallback
   * @param {Object} result - the result of the get request (entity/ies)
   * @param {String} error - any error that occured
   */
  /**
   * @callback createCallback
   * @param {Object} item - the newly created entity
   * @param {String} error - any error that occured
   */
  /**
   * @callback updateCallback
   * @param {String} status - the status of the update action
   * @param {String} error - any error that occured
   */
  /**
   * @callback deleteCallback
   * @param {String} status - the status of the delete action
   * @param {String} error - any error that occured
   */


  /**
   * refreshProperties is used to set up all of the properties for the connector.
   * It allows properties to be changed later by simply calling refreshProperties rather
   * than having to restart the connector.
   *
   * @function refreshProperties
   * @param {Object} properties - an object containing all of the properties
   * @param {boolean} init - are we initializing -- is so no need to refresh throtte engine
   */
  refreshProperties(properties) {
    // Read the properties schema from the file system
    const propertiesSchema = JSON.parse(fs.readFileSync(path.join(__dirname, 'propertiesSchema.json'), 'utf-8'));

    // add any defaults to the data
    const defProps = this.propUtilInst.setDefaults(propertiesSchema);
    this.allProps = this.propUtilInst.mergeProperties(properties, defProps);

    // validate the entity against the schema
    const ajvInst = new AjvCl();
    const validate = ajvInst.compile(propertiesSchema);
    const result = validate(this.allProps);

    // if invalid properties throw an error
    if (!result) {
      log.error(`Error on validation of properties: ${JSON.stringify(validate.errors)}`);
      throw new Error(validate.errors[0].message);
    }

    // properties that this code cares about
    this.healthcheckType = this.allProps.healthcheck.type;
    this.healthcheckInterval = this.allProps.healthcheck.frequency;

    // set the failover codes from properties
    if (this.allProps.request.failover_codes) {
      if (Array.isArray(this.allProps.request.failover_codes)) {
        this.failoverCodes = this.allProps.request.failover_codes;
      } else {
        this.failoverCodes = [this.allProps.request.failover_codes];
      }
    } else {
      this.failoverCodes = [];
    }

    // set the caching flag from properties
    if (this.allProps.cache_location) {
      if (this.allProps.cache_location === 'redis' || this.allProps.cache_location === 'local') {
        this.caching = true;
      }
    }

    // if this is truly a refresh and we have a request handler, refresh it
    if (this.requestHandlerInst) {
      this.requestHandlerInst.refreshProperties(properties);
    }
  }

  /**
   * @summary Connect function is used during Pronghorn startup to provide instantiation feedback.
   *
   * @function connect
   */
  connect() {
    // initially set as off
    this.emit('OFFLINE', { id: this.id });
    this.alive = true;

    // if there is no healthcheck just change the emit to ONLINE
    // We do not recommend no healthcheck!!!
    if (this.healthcheckType === 'none') {
      // validate all of the action files - normally done in healthcheck
      this.emit('ONLINE', { id: this.id });
      this.healthy = true;
    }

    // is the healthcheck only suppose to run on startup
    // (intermittent runs on startup and after that)
    if (this.healthcheckType === 'startup' || this.healthcheckType === 'intermittent') {
      // run an initial healthcheck
      this.healthCheck((status) => {
        log.debug(status);
      });
    }

    // is the healthcheck suppose to run intermittently
    if (this.healthcheckType === 'intermittent') {
      // run the healthcheck in an interval
      setInterval(() => {
        // try to see if mongo is available
        this.healthCheck((status) => {
          log.debug(status);
        });
      }, this.healthcheckInterval);
    }
  }

  /**
   * @summary HealthCheck function is used to provide Pronghorn the status of this adapter.
   *
   * @function healthCheck
   */
  healthCheck(callback) {
    // call to the healthcheck in connector
    return this.requestHandlerInst.identifyHealthcheck(null, (res, error) => {
      // unhealthy
      if (error) {
        // if we were healthy, toggle health
        if (this.healthy) {
          this.emit('OFFLINE', { id: this.id });
          this.healthy = false;
          log.error(`${this.id} HEALTH CHECK - Error ${error}`);
        } else {
          // still log but set the level to trace
          log.trace(`${this.id} HEALTH CHECK - Still Errors ${error}`);
        }

        return callback(false);
      }

      // if we were unhealthy, toggle health
      if (!this.healthy) {
        this.emit('ONLINE', { id: this.id });
        this.healthy = true;
        log.info(`${this.id} HEALTH CHECK SUCCESSFUL`);
      } else {
        // still log but set the level to trace
        log.trace(`${this.id} HEALTH CHECK STILL SUCCESSFUL`);
      }

      return callback(true);
    });
  }

  /**
   * checkActionFiles is used to update the validation of the action files.
   *
   * @function checkActionFiles
   */
  checkActionFiles() {
    const origin = `${this.myid}-requestHandler-checkActionFiles`;
    log.trace(origin);

    // validate the action files for the adapter
    try {
      return this.requestHandlerInst.checkActionFiles();
    } catch (e) {
      return false;
    }
  }

  /**
   * getQueue is used to get information for all of the requests currently in the queue.
   *
   * @function getQueue
   * @param {Callback} callback - a callback function to return the result (Queue) or the error
   */
  getQueue(callback) {
    return this.requestHandlerInst.getQueue(callback);
  }

  /**
   * @summary Takes in property text and an encoding/encryption and returns the resulting
   * encoded/encrypted string
   *
   * @function encryptProperty
   * @param {String} property - the property to encrypt
   * @param {String} technique - the technique to use to encrypt
   *
   * @param {Callback} callback - a callback function to return the result
   *                              Encrypted String or the Error
   */
  encryptProperty(property, technique, callback) {
    // Make the call -
    // encryptProperty(property, technique, callback)
    this.requestHandlerInst.encryptProperty(property, technique, callback);
  }

  /**
   * @summary take the entities and add them to the cache
   *
   * @function addEntityCache
   * @param {String} entityType - the type of the entities
   * @param {Array} data - the list of entities
   * @param {String} key - unique key for the entities
   *
   * @param {Callback} callback - An array of whether the adapter can has the
   *                              desired capability or an error
   */
  addEntityCache(entityType, entities, key, callback) {
    // list containing the items to add to the cache
    const entityIds = [];

    if (entities && Object.hasOwnProperty.call(entities, 'response')
        && Array.isArray(entities.response)) {
      for (let e = 0; e < entities.response.length; e += 1) {
        entityIds.push(entities.response[e][key]);
      }
    }

    // add the entities to the cache
    return this.requestHandlerInst.addEntityCache(entityType, entityIds, (loaded, error) => {
      if (!loaded) {
        return callback(null, `Could not load ${entityType} into cache - ${error}`);
      }

      return callback(loaded);
    });
  }

  /**
   * @summary sees if the entity is in the entity list or not
   *
   * @function entityInList
   * @param {String/Array} entityId - the specific entity we are looking for
   * @param {Array} data - the list of entities
   *
   * @param {Callback} callback - An array of whether the adapter can has the
   *                              desired capability or an error
   */
  entityInList(entityId, data, callback) {
    // need to check on the entities that were passed in
    if (Array.isArray(entityId)) {
      const resEntity = [];

      for (let e = 0; e < entityId.length; e += 1) {
        if (data.includes(entityId)) {
          resEntity.push(true);
        } else {
          resEntity.push(false);
        }
      }

      return callback(resEntity);
    }

    // does the entity list include the specific entity
    return callback([data.includes(entityId)]);
  }

  /**
   * @summary prepare results for verify capability so they are true/false
   *
   * @function capabilityResults
   * @param {Array} results - the results from the capability check
   *
   * @param {Callback} callback - An array of whether the adapter can has the
   *                              desired capability or an error
   */
  capabilityResults(results, callback) {
    let locResults = results;

    if (locResults && locResults[0] === 'needupdate') {
      this.repeatCacheCount += 1;
      return callback(null, 'Could not update entity cache');
    }

    // if an error occured, return the error
    if (locResults && locResults[0] === 'error') {
      return callback(null, 'Error verifying entity - please check the logs');
    }

    // go through the response and change to true/false
    if (locResults) {
      // if not an array, just convert the return
      if (!Array.isArray(locResults)) {
        if (locResults === 'found') {
          locResults = [true];
        } else {
          locResults = [false];
        }
      } else {
        const temp = [];

        // go through each element in the array to convert
        for (let r = 0; r < locResults.length; r += 1) {
          if (locResults[r] === 'found') {
            temp.push(true);
          } else {
            temp.push(false);
          }
        }
        locResults = temp;
      }
    }

    // return the results
    return callback(locResults);
  }

  /**
   * @summary Provides a way for the adapter to tell north bound integrations
   * all of the capabilities for the current adapter
   *
   * @function getAllCapabilities
   *
   * @return {Array} - containing the entities and the actions available on each entity
   */
  getAllCapabilities() {
    // Make the call -
    // getAllCapabilities()
    return this.requestHandlerInst.getAllCapabilities();
  }
}

module.exports = AdapterBase;
