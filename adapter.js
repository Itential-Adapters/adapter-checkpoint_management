/* @copyright Itential, LLC 2019 */

/* eslint import/no-dynamic-require: warn */
/* eslint object-curly-newline: warn */
/* eslint no-underscore-dangle: warn  */
/* eslint camelcase: warn  */

// Set globals
/* global log */

/* Required libraries.  */
const path = require('path');
// const xmldom = require('xmldom');

/* Fetch in the other needed components for the this Adaptor */
const AdapterBaseCl = require(path.join(__dirname, 'adapterBase.js'));


/**
 * This is the adapter/interface into Checkpoint
 */

/* GENERAL ADAPTER FUNCTIONS */
class Checkpoint extends AdapterBaseCl {
  /**
   * Checkpoint Adapter
   * @constructor
  constructor(prongid, properties) {
    // Instantiate the AdapterBase super class
    super(prongid, properties);

    // Uncomment if you have things to add to the constructor like using your own properties.
    // Otherwise the constructor in the adapterBase will be used.
    // Capture my own properties - they need to be defined in propertiesSchema.json
    if (this.allProps && this.allProps.myownproperty) {
      mypropvariable = this.allProps.myownproperty;
    }
  }
  */


  /**
   * @callback healthCallback
   * @param {Object} result - the result of the get request (contains an id and a status)
   */
  /**
   * @callback getCallback
   * @param {Object} result - the result of the get request (entity/ies)
   * @param {String} error - any error that occurred
   */
  /**
   * @callback createCallback
   * @param {Object} item - the newly created entity
   * @param {String} error - any error that occurred
   */
  /**
   * @callback updateCallback
   * @param {String} status - the status of the update action
   * @param {String} error - any error that occurred
   */
  /**
   * @callback deleteCallback
   * @param {String} status - the status of the delete action
   * @param {String} error - any error that occurred
   */

  /**
   * @summary Determines if this adapter supports the specific entity
   *
   * @function hasEntity
   * @param {String} entityType - the entity type to check for
   * @param {String/Array} entityId - the specific entity we are looking for
   *
   * @param {Callback} callback - An array of whether the adapter can has the
   *                              desired capability or an error
   */
  hasEntity(entityType, entityId, callback) {
    // Make the call -
    // verifyCapability(entityType, actionType, entityId, callback)
    return this.verifyCapability(entityType, null, entityId, callback);
  }

  /**
   * @summary Provides a way for the adapter to tell north bound integrations
   * whether the adapter supports type, action and specific entity
   *
   * @function verifyCapability
   * @param {String} entityType - the entity type to check for
   * @param {String} actionType - the action type to check for
   * @param {String/Array} entityId - the specific entity we are looking for
   *
   * @param {Callback} callback - An array of whether the adapter can has the
   *                              desired capability or an error
   */
  verifyCapability(entityType, actionType, entityId, callback) {
    // if caching
    if (this.caching) {
      // Make the call - verifyCapability(entityType, actionType, entityId, callback)
      return this.requestHandlerInst.verifyCapability(entityType, actionType, entityId, (results, error) => {
        if (error) {
          return callback(null, error);
        }

        // if the cache needs to be updated, update and try again
        if (results && results[0] === 'needupdate') {
          switch (entityType) {
            case 'template_entity': {
              // if the cache is invalid, update the cache
              return this.getEntities(null, null, null, null, (data, err) => {
                if (err) {
                  return callback(null, `Could not update ${entityType} cache`);
                }

                // need to check the cache again since it has been updated
                return this.requestHandlerInst.verifyCapability(entityType, actionType, entityId, (vcapable, verror) => {
                  if (verror) {
                    return callback(null, verror);
                  }

                  return this.capabilityResults(vcapable, callback);
                });
              });
            }
            default: {
              // unsupported entity type
              const result = [false];

              // put false in array for all entities
              if (Array.isArray(entityId)) {
                for (let e = 1; e < entityId.length; e += 1) {
                  result.push(false);
                }
              }

              return callback(result);
            }
          }
        }

        // return the results
        return this.capabilityResults(results, callback);
      });
    }

    // if no entity id
    if (!entityId) {
      // need to check the cache again since it has been updated
      return this.requestHandlerInst.verifyCapability(entityType, actionType, null, (vcapable, verror) => {
        if (verror) {
          return callback(null, verror);
        }

        return this.capabilityResults(vcapable, callback);
      });
    }

    // if not caching
    switch (entityType) {
      case 'template_entity': {
        // need to get the entities to check
        return this.getEntities(null, null, null, null, (data, err) => {
          if (err) {
            return callback(null, `Could not update ${entityType} cache`);
          }

          // need to check the cache again since it has been updated
          return this.requestHandlerInst.verifyCapability(entityType, actionType, null, (vcapable, verror) => {
            if (verror) {
              return callback(null, verror);
            }

            // is the entity in the list?
            const isEntity = this.entityInList(entityId, data.response, callback);
            const res = [];

            // not found
            for (let i = 0; i < isEntity.length; i += 1) {
              if (vcapable) {
                res.push(isEntity[i]);
              } else {
                res.push(false);
              }
            }

            return callback(res);
          });
        });
      }
      default: {
        // unsupported entity type
        const result = [false];

        // put false in array for all entities
        if (Array.isArray(entityId)) {
          for (let e = 1; e < entityId.length; e += 1) {
            result.push(false);
          }
        }

        return callback(result);
      }
    }
  }

  /**
   * @summary Updates the cache for all entities by call the get All entity method
   *
   * @function updateEntityCache
   *
   */
  updateEntityCache() {
    if (this.caching) {
      // if the cache is invalid, update the cache
      this.getEntities(null, null, null, null, (data, err) => {
        if (err) {
          log.trace(`Could not load template_entity into cache - ${err}`);
        }
      });
    }
  }

  /**
   * @summary login
   *
   * @function postLogin
   * @param {string} ContentType - ContentType param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postLogin(ContentType, body, callback) {
    log.debug('postLogin');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postLogin';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postLogin';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('01SessionManagement', 'postLogin', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary publish
   *
   * @function postPublish
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postPublish(ContentType, Xchkpsid, body, callback) {
    log.debug('postPublish');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postPublish';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postPublish';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postPublish';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });
 let headers = { 
  "X-chkp-sid" : Xchkpsid
 };
    const reqObj = {
      addlHeaders: headers,
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('01SessionManagement', 'postPublish', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary discard
   *
   * @function postDiscard
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDiscard(ContentType, Xchkpsid, body, callback) {
    log.debug('postDiscard');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDiscard';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDiscard';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDiscard';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('01SessionManagement', 'postDiscard', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary logout
   *
   * @function postLogout
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postLogout(ContentType, Xchkpsid, body, callback) {
    log.debug('postLogout');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postLogout';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postLogout';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postLogout';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });
 let headers = { 
  "X-chkp-sid" : Xchkpsid
 };
    const reqObj = {
      addlHeaders: headers,
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('01SessionManagement', 'postLogout', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary disconnect
   *
   * @function postDisconnect
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDisconnect(ContentType, Xchkpsid, body, callback) {
    log.debug('postDisconnect');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDisconnect';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDisconnect';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDisconnect';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('01SessionManagement', 'postDisconnect', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary keepalive
   *
   * @function postKeepalive
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postKeepalive(ContentType, Xchkpsid, body, callback) {
    log.debug('postKeepalive');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postKeepalive';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postKeepalive';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postKeepalive';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('01SessionManagement', 'postKeepalive', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-session
   *
   * @function postShowSession
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowSession(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowSession');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowSession';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowSession';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowSession';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('02Session', 'postShowSession', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-session
   *
   * @function postSetSession
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetSession(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetSession');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetSession';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetSession';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetSession';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('02Session', 'postSetSession', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary continue-session-in-smartconsole
   *
   * @function postContinueSessionInSmartconsole
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postContinueSessionInSmartconsole(ContentType, Xchkpsid, body, callback) {
    log.debug('postContinueSessionInSmartconsole');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postContinueSessionInSmartconsole';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postContinueSessionInSmartconsole';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postContinueSessionInSmartconsole';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('02Session', 'postContinueSessionInSmartconsole', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-last-published-session
   *
   * @function postShowLastPublishedSession
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowLastPublishedSession(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowLastPublishedSession');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowLastPublishedSession';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowLastPublishedSession';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowLastPublishedSession';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('02Session', 'postShowLastPublishedSession', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary purge-published-sessions by count
   *
   * @function postPurgePublishedSessions
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postPurgePublishedSessions(ContentType, Xchkpsid, body, callback) {
    log.debug('postPurgePublishedSessions');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postPurgePublishedSessions';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postPurgePublishedSessions';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postPurgePublishedSessions';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('02Session', 'postPurgePublishedSessions', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary switch-session
   *
   * @function postSwitchSession
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSwitchSession(ContentType, Xchkpsid, body, callback) {
    log.debug('postSwitchSession');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSwitchSession';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSwitchSession';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSwitchSession';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('02Session', 'postSwitchSession', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary assign-session
   *
   * @function postAssignSession
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAssignSession(ContentType, Xchkpsid, body, callback) {
    log.debug('postAssignSession');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAssignSession';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAssignSession';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAssignSession';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('02Session', 'postAssignSession', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary take-over-session
   *
   * @function postTakeOverSession
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postTakeOverSession(ContentType, Xchkpsid, body, callback) {
    log.debug('postTakeOverSession');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postTakeOverSession';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postTakeOverSession';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postTakeOverSession';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('02Session', 'postTakeOverSession', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-sessions
   *
   * @function postShowSessions
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowSessions(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowSessions');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowSessions';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowSessions';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowSessions';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('02Session', 'postShowSessions', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-login-message
   *
   * @function postShowLoginMessage
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowLoginMessage(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowLoginMessage');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowLoginMessage';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowLoginMessage';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowLoginMessage';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('03LoginMessage', 'postShowLoginMessage', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-login-message
   *
   * @function postSetLoginMessage
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetLoginMessage(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetLoginMessage');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetLoginMessage';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetLoginMessage';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetLoginMessage';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('03LoginMessage', 'postSetLoginMessage', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-host
   *
   * @function postAddHost
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddHost(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddHost');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddHost';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddHost';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddHost';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('04Host', 'postAddHost', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-host
   *
   * @function postShowHost
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowHost(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowHost');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowHost';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowHost';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowHost';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('04Host', 'postShowHost', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-host
   *
   * @function postSetHost
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetHost(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetHost');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetHost';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetHost';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetHost';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('04Host', 'postSetHost', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-host
   *
   * @function postDeleteHost
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteHost(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteHost');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteHost';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteHost';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteHost';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('04Host', 'postDeleteHost', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-hosts
   *
   * @function postShowHosts
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowHosts(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowHosts');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowHosts';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowHosts';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowHosts';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('04Host', 'postShowHosts', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-network
   *
   * @function postAddNetwork
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddNetwork(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddNetwork');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddNetwork';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddNetwork';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddNetwork';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('05Network', 'postAddNetwork', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-network
   *
   * @function postShowNetwork
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowNetwork(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowNetwork');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowNetwork';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowNetwork';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowNetwork';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('05Network', 'postShowNetwork', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-network
   *
   * @function postSetNetwork
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetNetwork(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetNetwork');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetNetwork';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetNetwork';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetNetwork';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('05Network', 'postSetNetwork', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-network
   *
   * @function postDeleteNetwork
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteNetwork(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteNetwork');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteNetwork';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteNetwork';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteNetwork';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('05Network', 'postDeleteNetwork', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-networks
   *
   * @function postShowNetworks
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowNetworks(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowNetworks');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowNetworks';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowNetworks';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowNetworks';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('05Network', 'postShowNetworks', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-wildcard
   *
   * @function postAddWildcard
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddWildcard(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddWildcard');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddWildcard';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddWildcard';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddWildcard';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('06Wildcard', 'postAddWildcard', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-wildcard
   *
   * @function postShowWildcard
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowWildcard(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowWildcard');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowWildcard';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowWildcard';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowWildcard';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('06Wildcard', 'postShowWildcard', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-wildcard
   *
   * @function postSetWildcard
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetWildcard(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetWildcard');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetWildcard';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetWildcard';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetWildcard';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('06Wildcard', 'postSetWildcard', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-wildcard
   *
   * @function postDeleteWildcard
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteWildcard(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteWildcard');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteWildcard';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteWildcard';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteWildcard';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('06Wildcard', 'postDeleteWildcard', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-wildcards
   *
   * @function postShowWildcards
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowWildcards(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowWildcards');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowWildcards';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowWildcards';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowWildcards';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('06Wildcard', 'postShowWildcards', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-group with group
   *
   * @function postAddGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddGroup(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('07Group', 'postAddGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-group
   *
   * @function postShowGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowGroup(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('07Group', 'postShowGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-group
   *
   * @function postSetGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Ses - Ses param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetGroup(ContentType, Ses, Xchkpsid, body, callback) {
    log.debug('postSetGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetGroup';
      return callback(null, err);
    }
    if (!Ses) {
      const err = 'Ses is required for postSetGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('07Group', 'postSetGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-group
   *
   * @function postDeleteGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Ses - Ses param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteGroup(ContentType, Ses, Xchkpsid, body, callback) {
    log.debug('postDeleteGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteGroup';
      return callback(null, err);
    }
    if (!Ses) {
      const err = 'Ses is required for postDeleteGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('07Group', 'postDeleteGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-groups
   *
   * @function postShowGroups
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowGroups(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowGroups');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowGroups';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowGroups';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowGroups';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('07Group', 'postShowGroups', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-address-range
   *
   * @function postAddAddressRange
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddAddressRange(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddAddressRange');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddAddressRange';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddAddressRange';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddAddressRange';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('08AddressRange', 'postAddAddressRange', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-address-range
   *
   * @function postShowAddressRange
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowAddressRange(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowAddressRange');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowAddressRange';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowAddressRange';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowAddressRange';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('08AddressRange', 'postShowAddressRange', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-address-range
   *
   * @function postSetAddressRange
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetAddressRange(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetAddressRange');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetAddressRange';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetAddressRange';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetAddressRange';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('08AddressRange', 'postSetAddressRange', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-address-range
   *
   * @function postDeleteAddressRange
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteAddressRange(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteAddressRange');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteAddressRange';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteAddressRange';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteAddressRange';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('08AddressRange', 'postDeleteAddressRange', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-address-ranges
   *
   * @function postShowAddressRanges
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowAddressRanges(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowAddressRanges');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowAddressRanges';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowAddressRanges';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowAddressRanges';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('08AddressRange', 'postShowAddressRanges', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-multicast-address-range-ip-range
   *
   * @function postAddMulticastAddressRange
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddMulticastAddressRange(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddMulticastAddressRange');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddMulticastAddressRange';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddMulticastAddressRange';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddMulticastAddressRange';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('09MulticastAddressRange', 'postAddMulticastAddressRange', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-multicast-address-range
   *
   * @function postShowMulticastAddressRange
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowMulticastAddressRange(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowMulticastAddressRange');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowMulticastAddressRange';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowMulticastAddressRange';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowMulticastAddressRange';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('09MulticastAddressRange', 'postShowMulticastAddressRange', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-multicast-address-range
   *
   * @function postSetMulticastAddressRange
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetMulticastAddressRange(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetMulticastAddressRange');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetMulticastAddressRange';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetMulticastAddressRange';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetMulticastAddressRange';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('09MulticastAddressRange', 'postSetMulticastAddressRange', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-multicast-address-range
   *
   * @function postDeleteMulticastAddressRange
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteMulticastAddressRange(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteMulticastAddressRange');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteMulticastAddressRange';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteMulticastAddressRange';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteMulticastAddressRange';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('09MulticastAddressRange', 'postDeleteMulticastAddressRange', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-multicast-address-ranges
   *
   * @function postShowMulticastAddressRanges
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowMulticastAddressRanges(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowMulticastAddressRanges');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowMulticastAddressRanges';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowMulticastAddressRanges';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowMulticastAddressRanges';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('09MulticastAddressRange', 'postShowMulticastAddressRanges', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-group-with-exclusion
   *
   * @function postAddGroupWithExclusion
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddGroupWithExclusion(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddGroupWithExclusion');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddGroupWithExclusion';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddGroupWithExclusion';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddGroupWithExclusion';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('10Groupwithexclusion', 'postAddGroupWithExclusion', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-group-with-exclusion
   *
   * @function postShowGroupWithExclusion
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowGroupWithExclusion(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowGroupWithExclusion');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowGroupWithExclusion';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowGroupWithExclusion';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowGroupWithExclusion';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('10Groupwithexclusion', 'postShowGroupWithExclusion', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-group-with-exclusion
   *
   * @function postSetGroupWithExclusion
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetGroupWithExclusion(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetGroupWithExclusion');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetGroupWithExclusion';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetGroupWithExclusion';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetGroupWithExclusion';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('10Groupwithexclusion', 'postSetGroupWithExclusion', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-group-with-exclusion
   *
   * @function postDeleteGroupWithExclusion
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteGroupWithExclusion(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteGroupWithExclusion');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteGroupWithExclusion';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteGroupWithExclusion';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteGroupWithExclusion';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('10Groupwithexclusion', 'postDeleteGroupWithExclusion', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-groups-with-exclusion
   *
   * @function postShowGroupsWithExclusion
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowGroupsWithExclusion(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowGroupsWithExclusion');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowGroupsWithExclusion';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowGroupsWithExclusion';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowGroupsWithExclusion';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('10Groupwithexclusion', 'postShowGroupsWithExclusion', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-simple-gateway
   *
   * @function postAddSimpleGateway
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddSimpleGateway(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddSimpleGateway');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddSimpleGateway';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddSimpleGateway';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddSimpleGateway';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('11SimpleGateway', 'postAddSimpleGateway', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-simple-gateway
   *
   * @function postShowSimpleGateway
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowSimpleGateway(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowSimpleGateway');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowSimpleGateway';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowSimpleGateway';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowSimpleGateway';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('11SimpleGateway', 'postShowSimpleGateway', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-simple-gateway
   *
   * @function postSetSimpleGateway
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetSimpleGateway(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetSimpleGateway');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetSimpleGateway';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetSimpleGateway';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetSimpleGateway';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('11SimpleGateway', 'postSetSimpleGateway', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-simple-gateway
   *
   * @function postDeleteSimpleGateway
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteSimpleGateway(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteSimpleGateway');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteSimpleGateway';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteSimpleGateway';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteSimpleGateway';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('11SimpleGateway', 'postDeleteSimpleGateway', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-simple-gateways
   *
   * @function postShowSimpleGateways
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowSimpleGateways(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowSimpleGateways');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowSimpleGateways';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowSimpleGateways';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowSimpleGateways';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('11SimpleGateway', 'postShowSimpleGateways', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-security-zone
   *
   * @function postAddSecurityZone
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddSecurityZone(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddSecurityZone');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddSecurityZone';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddSecurityZone';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddSecurityZone';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('12SecurityZone', 'postAddSecurityZone', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-security-zone
   *
   * @function postShowSecurityZone
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowSecurityZone(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowSecurityZone');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowSecurityZone';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowSecurityZone';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowSecurityZone';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('12SecurityZone', 'postShowSecurityZone', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-security-zone
   *
   * @function postSetSecurityZone
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetSecurityZone(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetSecurityZone');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetSecurityZone';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetSecurityZone';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetSecurityZone';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('12SecurityZone', 'postSetSecurityZone', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-security-zone
   *
   * @function postDeleteSecurityZone
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteSecurityZone(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteSecurityZone');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteSecurityZone';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteSecurityZone';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteSecurityZone';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('12SecurityZone', 'postDeleteSecurityZone', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-security-zones
   *
   * @function postShowSecurityZones
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowSecurityZones(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowSecurityZones');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowSecurityZones';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowSecurityZones';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowSecurityZones';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('12SecurityZone', 'postShowSecurityZones', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-time
   *
   * @function postAddTime
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddTime(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddTime');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddTime';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddTime';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddTime';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('13Time', 'postAddTime', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-time
   *
   * @function postShowTime
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowTime(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowTime');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowTime';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowTime';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowTime';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('13Time', 'postShowTime', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-time
   *
   * @function postSetTime
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetTime(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetTime');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetTime';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetTime';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetTime';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('13Time', 'postSetTime', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-time
   *
   * @function postDeleteTime
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteTime(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteTime');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteTime';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteTime';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteTime';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('13Time', 'postDeleteTime', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-times
   *
   * @function postShowTimes
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowTimes(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowTimes');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowTimes';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowTimes';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowTimes';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('13Time', 'postShowTimes', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-time-group
   *
   * @function postAddTimeGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddTimeGroup(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddTimeGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddTimeGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddTimeGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddTimeGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('14TimeGroup', 'postAddTimeGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-time-group
   *
   * @function postShowTimeGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowTimeGroup(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowTimeGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowTimeGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowTimeGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowTimeGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('14TimeGroup', 'postShowTimeGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-time-group
   *
   * @function postSetTimeGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetTimeGroup(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetTimeGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetTimeGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetTimeGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetTimeGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('14TimeGroup', 'postSetTimeGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-time-group
   *
   * @function postDeleteTimeGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteTimeGroup(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteTimeGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteTimeGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteTimeGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteTimeGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('14TimeGroup', 'postDeleteTimeGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-time-groups
   *
   * @function postShowTimeGroups
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowTimeGroups(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowTimeGroups');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowTimeGroups';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowTimeGroups';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowTimeGroups';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('14TimeGroup', 'postShowTimeGroups', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-access-role
   *
   * @function postAddAccessRole
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddAccessRole(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddAccessRole');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddAccessRole';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddAccessRole';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddAccessRole';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('15AccessRole', 'postAddAccessRole', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-access-role
   *
   * @function postShowAccessRole
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowAccessRole(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowAccessRole');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowAccessRole';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowAccessRole';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowAccessRole';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('15AccessRole', 'postShowAccessRole', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-access-role
   *
   * @function postSetAccessRole
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetAccessRole(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetAccessRole');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetAccessRole';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetAccessRole';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetAccessRole';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('15AccessRole', 'postSetAccessRole', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-access-role
   *
   * @function postDeleteAccessRole
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteAccessRole(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteAccessRole');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteAccessRole';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteAccessRole';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteAccessRole';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('15AccessRole', 'postDeleteAccessRole', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-access-roles
   *
   * @function postShowAccessRoles
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowAccessRoles(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowAccessRoles');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowAccessRoles';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowAccessRoles';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowAccessRoles';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('15AccessRole', 'postShowAccessRoles', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-dynamic-object
   *
   * @function postAddDynamicObject
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddDynamicObject(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddDynamicObject');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddDynamicObject';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddDynamicObject';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddDynamicObject';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('16DynamicObject', 'postAddDynamicObject', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-dynamic-object
   *
   * @function postShowDynamicObject
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowDynamicObject(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowDynamicObject');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowDynamicObject';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowDynamicObject';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowDynamicObject';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('16DynamicObject', 'postShowDynamicObject', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-dynamic-object
   *
   * @function postSetDynamicObject
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetDynamicObject(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetDynamicObject');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetDynamicObject';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetDynamicObject';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetDynamicObject';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('16DynamicObject', 'postSetDynamicObject', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-dynamic-object
   *
   * @function postDeleteDynamicObject
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteDynamicObject(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteDynamicObject');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteDynamicObject';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteDynamicObject';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteDynamicObject';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('16DynamicObject', 'postDeleteDynamicObject', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-dynamic-objects
   *
   * @function postShowDynamicObjects
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowDynamicObjects(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowDynamicObjects');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowDynamicObjects';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowDynamicObjects';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowDynamicObjects';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('16DynamicObject', 'postShowDynamicObjects', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-trusted-client
   *
   * @function postAddTrustedClient
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddTrustedClient(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddTrustedClient');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddTrustedClient';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddTrustedClient';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddTrustedClient';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('17TrustedClient', 'postAddTrustedClient', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-trusted-client
   *
   * @function postShowTrustedClient
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowTrustedClient(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowTrustedClient');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowTrustedClient';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowTrustedClient';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowTrustedClient';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('17TrustedClient', 'postShowTrustedClient', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-trusted-client
   *
   * @function postSetTrustedClient
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetTrustedClient(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetTrustedClient');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetTrustedClient';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetTrustedClient';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetTrustedClient';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('17TrustedClient', 'postSetTrustedClient', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-trusted-client
   *
   * @function postDeleteTrustedClient
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteTrustedClient(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteTrustedClient');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteTrustedClient';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteTrustedClient';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteTrustedClient';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('17TrustedClient', 'postDeleteTrustedClient', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-trusted-clients
   *
   * @function postShowTrustedClients
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowTrustedClients(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowTrustedClients');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowTrustedClients';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowTrustedClients';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowTrustedClients';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('17TrustedClient', 'postShowTrustedClients', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-tag
   *
   * @function postAddTag
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddTag(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddTag');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddTag';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddTag';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddTag';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('18Tags', 'postAddTag', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-tag
   *
   * @function postShowTag
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowTag(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowTag');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowTag';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowTag';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowTag';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('18Tags', 'postShowTag', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-tag
   *
   * @function postSetTag
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetTag(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetTag');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetTag';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetTag';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetTag';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('18Tags', 'postSetTag', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-tag
   *
   * @function postDeleteTag
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteTag(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteTag');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteTag';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteTag';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteTag';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('18Tags', 'postDeleteTag', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-tags
   *
   * @function postShowTags
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowTags(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowTags');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowTags';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowTags';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowTags';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('18Tags', 'postShowTags', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-dns-domain
   *
   * @function postAddDnsDomain
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddDnsDomain(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddDnsDomain');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddDnsDomain';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddDnsDomain';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddDnsDomain';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('19DNSDomain', 'postAddDnsDomain', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-dns-domain
   *
   * @function postShowDnsDomain
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowDnsDomain(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowDnsDomain');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowDnsDomain';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowDnsDomain';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowDnsDomain';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('19DNSDomain', 'postShowDnsDomain', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-dns-domain
   *
   * @function postSetDnsDomain
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetDnsDomain(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetDnsDomain');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetDnsDomain';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetDnsDomain';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetDnsDomain';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('19DNSDomain', 'postSetDnsDomain', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-dns-domain
   *
   * @function postDeleteDnsDomain
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteDnsDomain(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteDnsDomain');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteDnsDomain';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteDnsDomain';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteDnsDomain';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('19DNSDomain', 'postDeleteDnsDomain', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-dns-domains
   *
   * @function postShowDnsDomains
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowDnsDomains(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowDnsDomains');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowDnsDomains';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowDnsDomains';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowDnsDomains';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('19DNSDomain', 'postShowDnsDomains', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-opsec-application
   *
   * @function postAddOpsecApplication
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddOpsecApplication(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddOpsecApplication');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddOpsecApplication';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddOpsecApplication';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddOpsecApplication';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('20OPSECApplication', 'postAddOpsecApplication', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-opsec-application
   *
   * @function postShowOpsecApplication
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowOpsecApplication(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowOpsecApplication');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowOpsecApplication';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowOpsecApplication';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowOpsecApplication';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('20OPSECApplication', 'postShowOpsecApplication', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-opsec-application
   *
   * @function postSetOpsecApplication
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetOpsecApplication(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetOpsecApplication');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetOpsecApplication';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetOpsecApplication';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetOpsecApplication';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('20OPSECApplication', 'postSetOpsecApplication', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-opsec-application
   *
   * @function postDeleteOpsecApplication
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteOpsecApplication(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteOpsecApplication');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteOpsecApplication';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteOpsecApplication';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteOpsecApplication';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('20OPSECApplication', 'postDeleteOpsecApplication', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-opsec-applications
   *
   * @function postShowOpsecApplications
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowOpsecApplications(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowOpsecApplications');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowOpsecApplications';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowOpsecApplications';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowOpsecApplications';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('20OPSECApplication', 'postShowOpsecApplications', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-data-center-content
   *
   * @function postShowDataCenterContent
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowDataCenterContent(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowDataCenterContent');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowDataCenterContent';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowDataCenterContent';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowDataCenterContent';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('21DataCenter', 'postShowDataCenterContent', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-data-center
   *
   * @function postShowDataCenter
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowDataCenter(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowDataCenter');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowDataCenter';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowDataCenter';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowDataCenter';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('22DataCenter', 'postShowDataCenter', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-data-centers
   *
   * @function postShowDataCenters
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowDataCenters(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowDataCenters');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowDataCenters';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowDataCenters';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowDataCenters';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('22DataCenter', 'postShowDataCenters', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-data-center-object with group
   *
   * @function postAddDataCenterObject
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddDataCenterObject(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddDataCenterObject');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddDataCenterObject';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddDataCenterObject';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddDataCenterObject';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('23DataCenterObject', 'postAddDataCenterObject', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-data-center-object
   *
   * @function postShowDataCenterObject
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowDataCenterObject(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowDataCenterObject');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowDataCenterObject';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowDataCenterObject';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowDataCenterObject';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('23DataCenterObject', 'postShowDataCenterObject', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-data-center-object
   *
   * @function postDeleteDataCenterObject
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteDataCenterObject(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteDataCenterObject');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteDataCenterObject';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteDataCenterObject';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteDataCenterObject';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('23DataCenterObject', 'postDeleteDataCenterObject', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-data-center-objects
   *
   * @function postShowDataCenterObjects
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowDataCenterObjects(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowDataCenterObjects');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowDataCenterObjects';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowDataCenterObjects';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowDataCenterObjects';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('23DataCenterObject', 'postShowDataCenterObjects', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-updatable-objects-repository-content
   *
   * @function postShowUpdatableObjectsRepositoryContent
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowUpdatableObjectsRepositoryContent(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowUpdatableObjectsRepositoryContent');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowUpdatableObjectsRepositoryContent';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowUpdatableObjectsRepositoryContent';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowUpdatableObjectsRepositoryContent';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('24UpdatableObjectsRepository', 'postShowUpdatableObjectsRepositoryContent', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary update-updatable-objects-repository-content
   *
   * @function postUpdateUpdatableObjectsRepositoryContent
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postUpdateUpdatableObjectsRepositoryContent(ContentType, Xchkpsid, body, callback) {
    log.debug('postUpdateUpdatableObjectsRepositoryContent');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postUpdateUpdatableObjectsRepositoryContent';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postUpdateUpdatableObjectsRepositoryContent';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postUpdateUpdatableObjectsRepositoryContent';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('24UpdatableObjectsRepository', 'postUpdateUpdatableObjectsRepositoryContent', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-updatable-object
   *
   * @function postAddUpdatableObject
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddUpdatableObject(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddUpdatableObject');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddUpdatableObject';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddUpdatableObject';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddUpdatableObject';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('25UpdatableObject', 'postAddUpdatableObject', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-updatable-object
   *
   * @function postShowUpdatableObject
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowUpdatableObject(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowUpdatableObject');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowUpdatableObject';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowUpdatableObject';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowUpdatableObject';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('25UpdatableObject', 'postShowUpdatableObject', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-updatable-object
   *
   * @function postDeleteUpdatableObject
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteUpdatableObject(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteUpdatableObject');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteUpdatableObject';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteUpdatableObject';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteUpdatableObject';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('25UpdatableObject', 'postDeleteUpdatableObject', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-updatable-objects
   *
   * @function postShowUpdatableObjects
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowUpdatableObjects(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowUpdatableObjects');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowUpdatableObjects';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowUpdatableObjects';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowUpdatableObjects';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('25UpdatableObject', 'postShowUpdatableObjects', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-service-tcp
   *
   * @function postAddServiceTcp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddServiceTcp(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddServiceTcp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddServiceTcp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddServiceTcp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddServiceTcp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('26ServiceTCP', 'postAddServiceTcp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-service-tcp
   *
   * @function postShowServiceTcp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServiceTcp(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowServiceTcp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowServiceTcp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServiceTcp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServiceTcp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('26ServiceTCP', 'postShowServiceTcp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-service-tcp
   *
   * @function postSetServiceTcp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetServiceTcp(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetServiceTcp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetServiceTcp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetServiceTcp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetServiceTcp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('26ServiceTCP', 'postSetServiceTcp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-service-tcp
   *
   * @function postDeleteServiceTcp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteServiceTcp(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteServiceTcp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteServiceTcp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteServiceTcp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteServiceTcp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('26ServiceTCP', 'postDeleteServiceTcp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-services-tcp
   *
   * @function postShowServicesTcp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServicesTcp(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowServicesTcp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowServicesTcp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServicesTcp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServicesTcp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('26ServiceTCP', 'postShowServicesTcp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-service-udp
   *
   * @function postAddServiceUdp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddServiceUdp(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddServiceUdp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddServiceUdp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddServiceUdp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddServiceUdp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('27ServiceUDP', 'postAddServiceUdp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-service-udp
   *
   * @function postShowServiceUdp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServiceUdp(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowServiceUdp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowServiceUdp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServiceUdp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServiceUdp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('27ServiceUDP', 'postShowServiceUdp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-service-udp
   *
   * @function postSetServiceUdp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetServiceUdp(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetServiceUdp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetServiceUdp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetServiceUdp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetServiceUdp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('27ServiceUDP', 'postSetServiceUdp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-service-udp
   *
   * @function postDeleteServiceUdp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteServiceUdp(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteServiceUdp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteServiceUdp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteServiceUdp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteServiceUdp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('27ServiceUDP', 'postDeleteServiceUdp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-services-udp
   *
   * @function postShowServicesUdp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServicesUdp(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowServicesUdp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowServicesUdp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServicesUdp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServicesUdp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('27ServiceUDP', 'postShowServicesUdp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-service-icmp
   *
   * @function postAddServiceIcmp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddServiceIcmp(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddServiceIcmp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddServiceIcmp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddServiceIcmp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddServiceIcmp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('28ServiceICMP', 'postAddServiceIcmp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-service-icmp
   *
   * @function postShowServiceIcmp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServiceIcmp(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowServiceIcmp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowServiceIcmp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServiceIcmp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServiceIcmp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('28ServiceICMP', 'postShowServiceIcmp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-service-icmp
   *
   * @function postSetServiceIcmp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetServiceIcmp(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetServiceIcmp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetServiceIcmp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetServiceIcmp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetServiceIcmp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('28ServiceICMP', 'postSetServiceIcmp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-service-icmp
   *
   * @function postDeleteServiceIcmp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteServiceIcmp(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteServiceIcmp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteServiceIcmp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteServiceIcmp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteServiceIcmp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('28ServiceICMP', 'postDeleteServiceIcmp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-services-icmp
   *
   * @function postShowServicesIcmp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServicesIcmp(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowServicesIcmp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowServicesIcmp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServicesIcmp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServicesIcmp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('28ServiceICMP', 'postShowServicesIcmp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-service-icmp6
   *
   * @function postAddServiceIcmp6
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddServiceIcmp6(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddServiceIcmp6');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddServiceIcmp6';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddServiceIcmp6';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddServiceIcmp6';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('29ServiceICMP6', 'postAddServiceIcmp6', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-service-icmp6
   *
   * @function postShowServiceIcmp6
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServiceIcmp6(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowServiceIcmp6');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowServiceIcmp6';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServiceIcmp6';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServiceIcmp6';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('29ServiceICMP6', 'postShowServiceIcmp6', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-service-icmp6
   *
   * @function postSetServiceIcmp6
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetServiceIcmp6(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetServiceIcmp6');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetServiceIcmp6';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetServiceIcmp6';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetServiceIcmp6';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('29ServiceICMP6', 'postSetServiceIcmp6', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-service-icmp6
   *
   * @function postDeleteServiceIcmp6
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteServiceIcmp6(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteServiceIcmp6');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteServiceIcmp6';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteServiceIcmp6';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteServiceIcmp6';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('29ServiceICMP6', 'postDeleteServiceIcmp6', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-services-icmp6
   *
   * @function postShowServicesIcmp6
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServicesIcmp6(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowServicesIcmp6');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowServicesIcmp6';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServicesIcmp6';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServicesIcmp6';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('29ServiceICMP6', 'postShowServicesIcmp6', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-service-sctp
   *
   * @function postAddServiceSctp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddServiceSctp(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddServiceSctp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddServiceSctp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddServiceSctp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddServiceSctp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('30ServiceSCTP', 'postAddServiceSctp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-service-sctp
   *
   * @function postShowServiceSctp
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {string} ContentType - ContentType param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServiceSctp(Xchkpsid, ContentType, body, callback) {
    log.debug('postShowServiceSctp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServiceSctp';
      return callback(null, err);
    }
    if (!ContentType) {
      const err = 'ContentType is required for postShowServiceSctp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServiceSctp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('30ServiceSCTP', 'postShowServiceSctp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-service-sctp
   *
   * @function postSetServiceSctp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetServiceSctp(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetServiceSctp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetServiceSctp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetServiceSctp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetServiceSctp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('30ServiceSCTP', 'postSetServiceSctp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-service-sctp
   *
   * @function postDeleteServiceSctp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteServiceSctp(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteServiceSctp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteServiceSctp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteServiceSctp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteServiceSctp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('30ServiceSCTP', 'postDeleteServiceSctp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-services-sctp
   *
   * @function postShowServicesSctp
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServicesSctp(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowServicesSctp');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowServicesSctp';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServicesSctp';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServicesSctp';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('30ServiceSCTP', 'postShowServicesSctp', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-service-other
   *
   * @function postAddServiceOther
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddServiceOther(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddServiceOther');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddServiceOther';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddServiceOther';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddServiceOther';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('31ServiceOther', 'postAddServiceOther', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-service-other
   *
   * @function postShowServiceOther
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {string} ContentType - ContentType param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServiceOther(Xchkpsid, ContentType, body, callback) {
    log.debug('postShowServiceOther');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServiceOther';
      return callback(null, err);
    }
    if (!ContentType) {
      const err = 'ContentType is required for postShowServiceOther';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServiceOther';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('31ServiceOther', 'postShowServiceOther', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-service-other
   *
   * @function postSetServiceOther
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetServiceOther(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetServiceOther');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetServiceOther';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetServiceOther';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetServiceOther';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('31ServiceOther', 'postSetServiceOther', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-service-other
   *
   * @function postDeleteServiceOther
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteServiceOther(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteServiceOther');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteServiceOther';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteServiceOther';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteServiceOther';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('31ServiceOther', 'postDeleteServiceOther', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-services-other
   *
   * @function postShowServicesOther
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServicesOther(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowServicesOther');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowServicesOther';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServicesOther';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServicesOther';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('31ServiceOther', 'postShowServicesOther', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-service-group
   *
   * @function postAddServiceGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddServiceGroup(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddServiceGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddServiceGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddServiceGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddServiceGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('32ServiceGroup', 'postAddServiceGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-service-group
   *
   * @function postShowServiceGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServiceGroup(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowServiceGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowServiceGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServiceGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServiceGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('32ServiceGroup', 'postShowServiceGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-service-group
   *
   * @function postSetServiceGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Ses - Ses param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetServiceGroup(ContentType, Ses, Xchkpsid, body, callback) {
    log.debug('postSetServiceGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetServiceGroup';
      return callback(null, err);
    }
    if (!Ses) {
      const err = 'Ses is required for postSetServiceGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetServiceGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetServiceGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('32ServiceGroup', 'postSetServiceGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-service-group
   *
   * @function postDeleteServiceGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Ses - Ses param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteServiceGroup(ContentType, Ses, Xchkpsid, body, callback) {
    log.debug('postDeleteServiceGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteServiceGroup';
      return callback(null, err);
    }
    if (!Ses) {
      const err = 'Ses is required for postDeleteServiceGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteServiceGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteServiceGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('32ServiceGroup', 'postDeleteServiceGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-service-groups
   *
   * @function postShowServiceGroups
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServiceGroups(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowServiceGroups');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowServiceGroups';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServiceGroups';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServiceGroups';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('32ServiceGroup', 'postShowServiceGroups', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-application-site
   *
   * @function postAddApplicationSite
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddApplicationSite(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddApplicationSite');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddApplicationSite';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddApplicationSite';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddApplicationSite';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('33Application', 'postAddApplicationSite', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-application-site
   *
   * @function postShowApplicationSite
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowApplicationSite(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowApplicationSite');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowApplicationSite';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowApplicationSite';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowApplicationSite';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('33Application', 'postShowApplicationSite', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-application-site
   *
   * @function postSetApplicationSite
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetApplicationSite(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetApplicationSite');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetApplicationSite';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetApplicationSite';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetApplicationSite';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('33Application', 'postSetApplicationSite', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-application-site
   *
   * @function postDeleteApplicationSite
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteApplicationSite(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteApplicationSite');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteApplicationSite';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteApplicationSite';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteApplicationSite';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('33Application', 'postDeleteApplicationSite', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-application-sites
   *
   * @function postShowApplicationSites
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowApplicationSites(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowApplicationSites');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowApplicationSites';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowApplicationSites';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowApplicationSites';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('33Application', 'postShowApplicationSites', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-application-site-category
   *
   * @function postAddApplicationSiteCategory
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddApplicationSiteCategory(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddApplicationSiteCategory');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddApplicationSiteCategory';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddApplicationSiteCategory';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddApplicationSiteCategory';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('34ApplicationCategory', 'postAddApplicationSiteCategory', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-application-site-category
   *
   * @function postShowApplicationSiteCategory
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowApplicationSiteCategory(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowApplicationSiteCategory');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowApplicationSiteCategory';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowApplicationSiteCategory';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowApplicationSiteCategory';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('34ApplicationCategory', 'postShowApplicationSiteCategory', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-application-site-category
   *
   * @function postSetApplicationSiteCategory
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetApplicationSiteCategory(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetApplicationSiteCategory');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetApplicationSiteCategory';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetApplicationSiteCategory';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetApplicationSiteCategory';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('34ApplicationCategory', 'postSetApplicationSiteCategory', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-application-site-category
   *
   * @function postDeleteApplicationSiteCategory
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteApplicationSiteCategory(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteApplicationSiteCategory');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteApplicationSiteCategory';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteApplicationSiteCategory';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteApplicationSiteCategory';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('34ApplicationCategory', 'postDeleteApplicationSiteCategory', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-application-site-categories
   *
   * @function postShowApplicationSiteCategories
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowApplicationSiteCategories(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowApplicationSiteCategories');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowApplicationSiteCategories';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowApplicationSiteCategories';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowApplicationSiteCategories';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('34ApplicationCategory', 'postShowApplicationSiteCategories', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-application-site-group
   *
   * @function postAddApplicationSiteGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddApplicationSiteGroup(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddApplicationSiteGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddApplicationSiteGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddApplicationSiteGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddApplicationSiteGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('35ApplicationGroup', 'postAddApplicationSiteGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-application-site-group
   *
   * @function postShowApplicationSiteGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowApplicationSiteGroup(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowApplicationSiteGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowApplicationSiteGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowApplicationSiteGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowApplicationSiteGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('35ApplicationGroup', 'postShowApplicationSiteGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-application-site-group
   *
   * @function postSetApplicationSiteGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Ses - Ses param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetApplicationSiteGroup(ContentType, Ses, Xchkpsid, body, callback) {
    log.debug('postSetApplicationSiteGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetApplicationSiteGroup';
      return callback(null, err);
    }
    if (!Ses) {
      const err = 'Ses is required for postSetApplicationSiteGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetApplicationSiteGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetApplicationSiteGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('35ApplicationGroup', 'postSetApplicationSiteGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-application-site-group
   *
   * @function postDeleteApplicationSiteGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Ses - Ses param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteApplicationSiteGroup(ContentType, Ses, Xchkpsid, body, callback) {
    log.debug('postDeleteApplicationSiteGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteApplicationSiteGroup';
      return callback(null, err);
    }
    if (!Ses) {
      const err = 'Ses is required for postDeleteApplicationSiteGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteApplicationSiteGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteApplicationSiteGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('35ApplicationGroup', 'postDeleteApplicationSiteGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-application-site-groups
   *
   * @function postShowApplicationSiteGroups
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowApplicationSiteGroups(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowApplicationSiteGroups');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowApplicationSiteGroups';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowApplicationSiteGroups';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowApplicationSiteGroups';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('35ApplicationGroup', 'postShowApplicationSiteGroups', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-service-dce-rpc
   *
   * @function postAddServiceDceRpc
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddServiceDceRpc(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddServiceDceRpc');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddServiceDceRpc';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddServiceDceRpc';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddServiceDceRpc';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('36ServiceDCERPC', 'postAddServiceDceRpc', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-service-dce-rpc
   *
   * @function postShowServiceDceRpc
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServiceDceRpc(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowServiceDceRpc');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowServiceDceRpc';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServiceDceRpc';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServiceDceRpc';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('36ServiceDCERPC', 'postShowServiceDceRpc', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-service-dce-rpc
   *
   * @function postSetServiceDceRpc
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetServiceDceRpc(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetServiceDceRpc');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetServiceDceRpc';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetServiceDceRpc';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetServiceDceRpc';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('36ServiceDCERPC', 'postSetServiceDceRpc', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-service-dce-rpc
   *
   * @function postDeleteServiceDceRpc
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteServiceDceRpc(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteServiceDceRpc');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteServiceDceRpc';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteServiceDceRpc';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteServiceDceRpc';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('36ServiceDCERPC', 'postDeleteServiceDceRpc', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-services-dce-rpc
   *
   * @function postShowServicesDceRpc
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServicesDceRpc(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowServicesDceRpc');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowServicesDceRpc';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServicesDceRpc';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServicesDceRpc';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('36ServiceDCERPC', 'postShowServicesDceRpc', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-service-rpc
   *
   * @function postAddServiceRpc
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddServiceRpc(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddServiceRpc');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddServiceRpc';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddServiceRpc';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddServiceRpc';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('37ServiceRPC', 'postAddServiceRpc', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-service-rpc
   *
   * @function postShowServiceRpc
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServiceRpc(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowServiceRpc');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowServiceRpc';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServiceRpc';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServiceRpc';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('37ServiceRPC', 'postShowServiceRpc', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-service-rpc
   *
   * @function postSetServiceRpc
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetServiceRpc(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetServiceRpc');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetServiceRpc';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetServiceRpc';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetServiceRpc';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('37ServiceRPC', 'postSetServiceRpc', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-service-rpc
   *
   * @function postDeleteServiceRpc
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteServiceRpc(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteServiceRpc');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteServiceRpc';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteServiceRpc';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteServiceRpc';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('37ServiceRPC', 'postDeleteServiceRpc', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-services-rpc
   *
   * @function postShowServicesRpc
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowServicesRpc(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowServicesRpc');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowServicesRpc';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowServicesRpc';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowServicesRpc';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('37ServiceRPC', 'postShowServicesRpc', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-access-rule
   *
   * @function postAddAccessRule
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddAccessRule(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddAccessRule');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddAccessRule';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddAccessRule';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddAccessRule';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('38AccessRule', 'postAddAccessRule', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-access-rulebase
   *
   * @function postShowAccessRulebase
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowAccessRulebase(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowAccessRulebase');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowAccessRulebase';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowAccessRulebase';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowAccessRulebase';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('38AccessRule', 'postShowAccessRulebase', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-access-rule
   *
   * @function postShowAccessRule
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowAccessRule(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowAccessRule');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowAccessRule';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowAccessRule';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowAccessRule';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('38AccessRule', 'postShowAccessRule', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-access-rule
   *
   * @function postSetAccessRule
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetAccessRule(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetAccessRule');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetAccessRule';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetAccessRule';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetAccessRule';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('38AccessRule', 'postSetAccessRule', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-access-rule
   *
   * @function postDeleteAccessRule
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteAccessRule(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteAccessRule');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteAccessRule';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteAccessRule';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteAccessRule';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('38AccessRule', 'postDeleteAccessRule', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-access-section
   *
   * @function postAddAccessSection
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddAccessSection(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddAccessSection');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddAccessSection';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddAccessSection';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddAccessSection';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('39AccessSection', 'postAddAccessSection', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-access-section
   *
   * @function postShowAccessSection
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowAccessSection(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowAccessSection');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowAccessSection';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowAccessSection';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowAccessSection';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('39AccessSection', 'postShowAccessSection', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-access-section
   *
   * @function postSetAccessSection
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetAccessSection(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetAccessSection');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetAccessSection';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetAccessSection';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetAccessSection';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('39AccessSection', 'postSetAccessSection', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-access-section
   *
   * @function postDeleteAccessSection
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteAccessSection(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteAccessSection');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteAccessSection';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteAccessSection';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteAccessSection';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('39AccessSection', 'postDeleteAccessSection', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-access-layer
   *
   * @function postAddAccessLayer
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddAccessLayer(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddAccessLayer');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddAccessLayer';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddAccessLayer';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddAccessLayer';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('40AccessLayer', 'postAddAccessLayer', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-access-layer
   *
   * @function postShowAccessLayer
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowAccessLayer(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowAccessLayer');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowAccessLayer';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowAccessLayer';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowAccessLayer';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('40AccessLayer', 'postShowAccessLayer', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-access-layer
   *
   * @function postSetAccessLayer
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetAccessLayer(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetAccessLayer');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetAccessLayer';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetAccessLayer';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetAccessLayer';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('40AccessLayer', 'postSetAccessLayer', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-access-layer
   *
   * @function postDeleteAccessLayer
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteAccessLayer(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteAccessLayer');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteAccessLayer';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteAccessLayer';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteAccessLayer';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('40AccessLayer', 'postDeleteAccessLayer', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-access-layers
   *
   * @function postShowAccessLayers
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowAccessLayers(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowAccessLayers');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowAccessLayers';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowAccessLayers';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowAccessLayers';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('40AccessLayer', 'postShowAccessLayers', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-nat-rule
   *
   * @function postAddNatRule
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddNatRule(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddNatRule');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddNatRule';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddNatRule';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddNatRule';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });
 let headers = { 
  "X-chkp-sid" : Xchkpsid
 };
    const reqObj = {
      addlHeaders: headers,
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('41NATRule', 'postAddNatRule', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-nat-rulebase
   *
   * @function postShowNatRulebase
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowNatRulebase(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowNatRulebase');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowNatRulebase';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowNatRulebase';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowNatRulebase';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });
let headers = {
  "X-chkp-sid" : Xchkpsid
 };
    const reqObj = {
      addlHeaders: headers,
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('41NATRule', 'postShowNatRulebase', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-nat-rule
   *
   * @function postShowNatRule
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowNatRule(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowNatRule');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowNatRule';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowNatRule';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowNatRule';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('41NATRule', 'postShowNatRule', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-nat-rule
   *
   * @function postSetNatRule
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetNatRule(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetNatRule');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetNatRule';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetNatRule';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetNatRule';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('41NATRule', 'postSetNatRule', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-nat-rule
   *
   * @function postDeleteNatRule
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteNatRule(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteNatRule');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteNatRule';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteNatRule';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteNatRule';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('41NATRule', 'postDeleteNatRule', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-nat-section
   *
   * @function postAddNatSection
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddNatSection(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddNatSection');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddNatSection';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddNatSection';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddNatSection';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('42NATSection', 'postAddNatSection', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-nat-section
   *
   * @function postShowNatSection
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowNatSection(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowNatSection');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowNatSection';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowNatSection';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowNatSection';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('42NATSection', 'postShowNatSection', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-nat-section
   *
   * @function postSetNatSection
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetNatSection(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetNatSection');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetNatSection';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetNatSection';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetNatSection';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('42NATSection', 'postSetNatSection', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-nat-section
   *
   * @function postDeleteNatSection
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteNatSection(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteNatSection');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteNatSection';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteNatSection';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteNatSection';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('42NATSection', 'postDeleteNatSection', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-vpn-community-meshed
   *
   * @function postAddVpnCommunityMeshed
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddVpnCommunityMeshed(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddVpnCommunityMeshed');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddVpnCommunityMeshed';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddVpnCommunityMeshed';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddVpnCommunityMeshed';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('43VPNCommunityMeshed', 'postAddVpnCommunityMeshed', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-vpn-community-meshed
   *
   * @function postShowVpnCommunityMeshed
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowVpnCommunityMeshed(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowVpnCommunityMeshed');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowVpnCommunityMeshed';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowVpnCommunityMeshed';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowVpnCommunityMeshed';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('43VPNCommunityMeshed', 'postShowVpnCommunityMeshed', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-vpn-community-meshed
   *
   * @function postSetVpnCommunityMeshed
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetVpnCommunityMeshed(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetVpnCommunityMeshed');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetVpnCommunityMeshed';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetVpnCommunityMeshed';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetVpnCommunityMeshed';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('43VPNCommunityMeshed', 'postSetVpnCommunityMeshed', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-vpn-community-meshed
   *
   * @function postDeleteVpnCommunityMeshed
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteVpnCommunityMeshed(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteVpnCommunityMeshed');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteVpnCommunityMeshed';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteVpnCommunityMeshed';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteVpnCommunityMeshed';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('43VPNCommunityMeshed', 'postDeleteVpnCommunityMeshed', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-vpn-communities-meshed
   *
   * @function postShowVpnCommunitiesMeshed
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowVpnCommunitiesMeshed(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowVpnCommunitiesMeshed');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowVpnCommunitiesMeshed';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowVpnCommunitiesMeshed';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowVpnCommunitiesMeshed';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('43VPNCommunityMeshed', 'postShowVpnCommunitiesMeshed', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-vpn-community-star
   *
   * @function postAddVpnCommunityStar
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddVpnCommunityStar(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddVpnCommunityStar');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddVpnCommunityStar';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddVpnCommunityStar';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddVpnCommunityStar';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('44VPNCommunityStar', 'postAddVpnCommunityStar', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-vpn-community-star
   *
   * @function postShowVpnCommunityStar
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowVpnCommunityStar(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowVpnCommunityStar');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowVpnCommunityStar';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowVpnCommunityStar';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowVpnCommunityStar';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('44VPNCommunityStar', 'postShowVpnCommunityStar', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-vpn-community-star
   *
   * @function postSetVpnCommunityStar
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetVpnCommunityStar(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetVpnCommunityStar');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetVpnCommunityStar';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetVpnCommunityStar';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetVpnCommunityStar';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('44VPNCommunityStar', 'postSetVpnCommunityStar', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-vpn-community-star
   *
   * @function postDeleteVpnCommunityStar
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteVpnCommunityStar(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteVpnCommunityStar');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteVpnCommunityStar';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteVpnCommunityStar';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteVpnCommunityStar';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('44VPNCommunityStar', 'postDeleteVpnCommunityStar', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-vpn-communities-star
   *
   * @function postShowVpnCommunitiesStar
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowVpnCommunitiesStar(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowVpnCommunitiesStar');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowVpnCommunitiesStar';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowVpnCommunitiesStar';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowVpnCommunitiesStar';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('44VPNCommunityStar', 'postShowVpnCommunitiesStar', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-threat-rule
   *
   * @function postAddThreatRule
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddThreatRule(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddThreatRule');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddThreatRule';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddThreatRule';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddThreatRule';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('45ThreatRule', 'postAddThreatRule', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-threat-rulebase
   *
   * @function postShowThreatRulebase
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowThreatRulebase(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowThreatRulebase');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowThreatRulebase';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowThreatRulebase';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowThreatRulebase';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('45ThreatRule', 'postShowThreatRulebase', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-threat-rule
   *
   * @function postShowThreatRule
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowThreatRule(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowThreatRule');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowThreatRule';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowThreatRule';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowThreatRule';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('45ThreatRule', 'postShowThreatRule', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-threat-rule
   *
   * @function postSetThreatRule
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetThreatRule(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetThreatRule');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetThreatRule';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetThreatRule';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetThreatRule';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('45ThreatRule', 'postSetThreatRule', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-threat-rule
   *
   * @function postDeleteThreatRule
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteThreatRule(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteThreatRule');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteThreatRule';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteThreatRule';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteThreatRule';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('45ThreatRule', 'postDeleteThreatRule', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-threat-exception
   *
   * @function postAddThreatException
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddThreatException(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddThreatException');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddThreatException';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddThreatException';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddThreatException';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('46ThreatException', 'postAddThreatException', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-threat-rule-exception-rulebase
   *
   * @function postShowThreatRuleExceptionRulebase
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowThreatRuleExceptionRulebase(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowThreatRuleExceptionRulebase');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowThreatRuleExceptionRulebase';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowThreatRuleExceptionRulebase';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowThreatRuleExceptionRulebase';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('46ThreatException', 'postShowThreatRuleExceptionRulebase', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-threat-exception
   *
   * @function postShowThreatException
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowThreatException(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowThreatException');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowThreatException';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowThreatException';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowThreatException';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('46ThreatException', 'postShowThreatException', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-threat-exception
   *
   * @function postSetThreatException
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetThreatException(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetThreatException');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetThreatException';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetThreatException';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetThreatException';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('46ThreatException', 'postSetThreatException', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-threat-exception
   *
   * @function postDeleteThreatException
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteThreatException(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteThreatException');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteThreatException';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteThreatException';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteThreatException';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('46ThreatException', 'postDeleteThreatException', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-exception-group
   *
   * @function postAddExceptionGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddExceptionGroup(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddExceptionGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddExceptionGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddExceptionGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddExceptionGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('47ThreatExceptionGroup', 'postAddExceptionGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-exception-group
   *
   * @function postShowExceptionGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowExceptionGroup(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowExceptionGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowExceptionGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowExceptionGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowExceptionGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('47ThreatExceptionGroup', 'postShowExceptionGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-exception-group
   *
   * @function postSetExceptionGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetExceptionGroup(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetExceptionGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetExceptionGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetExceptionGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetExceptionGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('47ThreatExceptionGroup', 'postSetExceptionGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-exception-group
   *
   * @function postDeleteExceptionGroup
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteExceptionGroup(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteExceptionGroup');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteExceptionGroup';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteExceptionGroup';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteExceptionGroup';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('47ThreatExceptionGroup', 'postDeleteExceptionGroup', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-exception-groups
   *
   * @function postShowExceptionGroups
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowExceptionGroups(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowExceptionGroups');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowExceptionGroups';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowExceptionGroups';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowExceptionGroups';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('47ThreatExceptionGroup', 'postShowExceptionGroups', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-threat-protection
   *
   * @function postShowThreatProtection
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowThreatProtection(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowThreatProtection');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowThreatProtection';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowThreatProtection';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowThreatProtection';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('48ThreatProtection', 'postShowThreatProtection', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-threat-protection
   *
   * @function postSetThreatProtection
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetThreatProtection(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetThreatProtection');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetThreatProtection';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetThreatProtection';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetThreatProtection';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('48ThreatProtection', 'postSetThreatProtection', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-threat-protections
   *
   * @function postShowThreatProtections
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowThreatProtections(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowThreatProtections');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowThreatProtections';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowThreatProtections';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowThreatProtections';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('48ThreatProtection', 'postShowThreatProtections', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-threat-protections
   *
   * @function postAddThreatProtections
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddThreatProtections(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddThreatProtections');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddThreatProtections';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddThreatProtections';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddThreatProtections';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('48ThreatProtection', 'postAddThreatProtections', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-threat-protections
   *
   * @function postDeleteThreatProtections
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteThreatProtections(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteThreatProtections');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteThreatProtections';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteThreatProtections';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteThreatProtections';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('48ThreatProtection', 'postDeleteThreatProtections', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-threat-profile
   *
   * @function postAddThreatProfile
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddThreatProfile(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddThreatProfile');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddThreatProfile';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddThreatProfile';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddThreatProfile';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('49ThreatProfile', 'postAddThreatProfile', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-threat-profile
   *
   * @function postShowThreatProfile
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowThreatProfile(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowThreatProfile');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowThreatProfile';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowThreatProfile';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowThreatProfile';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('49ThreatProfile', 'postShowThreatProfile', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-threat-profile
   *
   * @function postSetThreatProfile
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetThreatProfile(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetThreatProfile');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetThreatProfile';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetThreatProfile';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetThreatProfile';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('49ThreatProfile', 'postSetThreatProfile', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-threat-profile
   *
   * @function postDeleteThreatProfile
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteThreatProfile(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteThreatProfile');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteThreatProfile';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteThreatProfile';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteThreatProfile';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('49ThreatProfile', 'postDeleteThreatProfile', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-threat-profiles
   *
   * @function postShowThreatProfiles
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowThreatProfiles(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowThreatProfiles');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowThreatProfiles';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowThreatProfiles';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowThreatProfiles';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('49ThreatProfile', 'postShowThreatProfiles', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-threat-indicator
   *
   * @function postAddThreatIndicator
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddThreatIndicator(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddThreatIndicator');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddThreatIndicator';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddThreatIndicator';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddThreatIndicator';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('50ThreatIndicator', 'postAddThreatIndicator', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-threat-indicator
   *
   * @function postShowThreatIndicator
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowThreatIndicator(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowThreatIndicator');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowThreatIndicator';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowThreatIndicator';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowThreatIndicator';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('50ThreatIndicator', 'postShowThreatIndicator', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-threat-indicator
   *
   * @function postSetThreatIndicator
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetThreatIndicator(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetThreatIndicator');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetThreatIndicator';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetThreatIndicator';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetThreatIndicator';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('50ThreatIndicator', 'postSetThreatIndicator', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-threat-indicator
   *
   * @function postDeleteThreatIndicator
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteThreatIndicator(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteThreatIndicator');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteThreatIndicator';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteThreatIndicator';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteThreatIndicator';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('50ThreatIndicator', 'postDeleteThreatIndicator', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-threat-indicators
   *
   * @function postShowThreatIndicators
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowThreatIndicators(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowThreatIndicators');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowThreatIndicators';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowThreatIndicators';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowThreatIndicators';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('50ThreatIndicator', 'postShowThreatIndicators', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-threat-layer
   *
   * @function postAddThreatLayer
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddThreatLayer(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddThreatLayer');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddThreatLayer';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddThreatLayer';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddThreatLayer';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('51ThreatLayer', 'postAddThreatLayer', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-threat-layer
   *
   * @function postShowThreatLayer
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowThreatLayer(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowThreatLayer');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowThreatLayer';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowThreatLayer';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowThreatLayer';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('51ThreatLayer', 'postShowThreatLayer', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-threat-layer
   *
   * @function postSetThreatLayer
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetThreatLayer(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetThreatLayer');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetThreatLayer';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetThreatLayer';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetThreatLayer';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('51ThreatLayer', 'postSetThreatLayer', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-threat-layer
   *
   * @function postDeleteThreatLayer
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteThreatLayer(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteThreatLayer');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteThreatLayer';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteThreatLayer';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteThreatLayer';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('51ThreatLayer', 'postDeleteThreatLayer', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-threat-layers
   *
   * @function postShowThreatLayers
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowThreatLayers(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowThreatLayers');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowThreatLayers';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowThreatLayers';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowThreatLayers';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('51ThreatLayer', 'postShowThreatLayers', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-ips-update-schedule
   *
   * @function postShowIpsUpdateSchedule
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowIpsUpdateSchedule(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowIpsUpdateSchedule');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowIpsUpdateSchedule';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowIpsUpdateSchedule';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowIpsUpdateSchedule';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('52IPS', 'postShowIpsUpdateSchedule', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-ips-update-schedule-interval
   *
   * @function postSetIpsUpdateSchedule
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetIpsUpdateSchedule(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetIpsUpdateSchedule');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetIpsUpdateSchedule';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetIpsUpdateSchedule';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetIpsUpdateSchedule';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('52IPS', 'postSetIpsUpdateSchedule', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary run-ips-update
   *
   * @function postRunIpsUpdate
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postRunIpsUpdate(ContentType, Xchkpsid, body, callback) {
    log.debug('postRunIpsUpdate');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postRunIpsUpdate';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postRunIpsUpdate';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postRunIpsUpdate';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('52IPS', 'postRunIpsUpdate', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-ips-status
   *
   * @function postShowIpsStatus
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowIpsStatus(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowIpsStatus');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowIpsStatus';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowIpsStatus';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowIpsStatus';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('52IPS', 'postShowIpsStatus', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-ips-protection-extended-attribute
   *
   * @function postShowIpsProtectionExtendedAttribute
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowIpsProtectionExtendedAttribute(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowIpsProtectionExtendedAttribute');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowIpsProtectionExtendedAttribute';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowIpsProtectionExtendedAttribute';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowIpsProtectionExtendedAttribute';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('53IPSExtendedAttributes', 'postShowIpsProtectionExtendedAttribute', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-ips-protection-extended-attributes
   *
   * @function postShowIpsProtectionExtendedAttributes
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowIpsProtectionExtendedAttributes(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowIpsProtectionExtendedAttributes');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowIpsProtectionExtendedAttributes';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowIpsProtectionExtendedAttributes';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowIpsProtectionExtendedAttributes';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('53IPSExtendedAttributes', 'postShowIpsProtectionExtendedAttributes', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary run-threat-emulation-file-types-offline-update
   *
   * @function postRunThreatEmulationFileTypesOfflineUpdate
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postRunThreatEmulationFileTypesOfflineUpdate(ContentType, Xchkpsid, body, callback) {
    log.debug('postRunThreatEmulationFileTypesOfflineUpdate');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postRunThreatEmulationFileTypesOfflineUpdate';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postRunThreatEmulationFileTypesOfflineUpdate';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postRunThreatEmulationFileTypesOfflineUpdate';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('54ThreatEmulation', 'postRunThreatEmulationFileTypesOfflineUpdate', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary verify-policy
   *
   * @function postVerifyPolicy
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postVerifyPolicy(ContentType, Xchkpsid, body, callback) {
    log.debug('postVerifyPolicy');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postVerifyPolicy';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postVerifyPolicy';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postVerifyPolicy';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('55Policy', 'postVerifyPolicy', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary install-policy
   *
   * @function postInstallPolicy
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postInstallPolicy(ContentType, Xchkpsid, body, callback) {
    log.debug('postInstallPolicy');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postInstallPolicy';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postInstallPolicy';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postInstallPolicy';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('55Policy', 'postInstallPolicy', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-package
   *
   * @function postAddPackage
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddPackage(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddPackage');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddPackage';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddPackage';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddPackage';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('56PolicyPackage', 'postAddPackage', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-package
   *
   * @function postShowPackage
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowPackage(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowPackage');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowPackage';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowPackage';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowPackage';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('56PolicyPackage', 'postShowPackage', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-package
   *
   * @function postSetPackage
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetPackage(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetPackage');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetPackage';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetPackage';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetPackage';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('56PolicyPackage', 'postSetPackage', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-package
   *
   * @function postDeletePackage
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeletePackage(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeletePackage');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeletePackage';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeletePackage';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeletePackage';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('56PolicyPackage', 'postDeletePackage', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-packages
   *
   * @function postShowPackages
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowPackages(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowPackages');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowPackages';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowPackages';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowPackages';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('56PolicyPackage', 'postShowPackages', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-domain
   *
   * @function postAddDomain
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddDomain(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddDomain');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddDomain';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddDomain';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddDomain';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('57Domain', 'postAddDomain', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-domain
   *
   * @function postShowDomain
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowDomain(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowDomain');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowDomain';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowDomain';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowDomain';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('57Domain', 'postShowDomain', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-domain
   *
   * @function postSetDomain
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetDomain(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetDomain');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetDomain';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetDomain';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetDomain';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('57Domain', 'postSetDomain', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-domain
   *
   * @function postDeleteDomain
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteDomain(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteDomain');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteDomain';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteDomain';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteDomain';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('57Domain', 'postDeleteDomain', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-domains
   *
   * @function postShowDomains
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowDomains(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowDomains');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowDomains';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowDomains';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowDomains';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('57Domain', 'postShowDomains', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-global-domain
   *
   * @function postShowGlobalDomain
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowGlobalDomain(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowGlobalDomain');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowGlobalDomain';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowGlobalDomain';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowGlobalDomain';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('58GlobalDomain', 'postShowGlobalDomain', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-global-domain
   *
   * @function postSetGlobalDomain
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetGlobalDomain(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetGlobalDomain');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetGlobalDomain';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetGlobalDomain';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetGlobalDomain';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('58GlobalDomain', 'postSetGlobalDomain', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-mds
   *
   * @function postShowMds
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowMds(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowMds');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowMds';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowMds';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowMds';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('59MultiDomainServerMDS', 'postShowMds', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-mdss
   *
   * @function postShowMdss
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowMdss(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowMdss');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowMdss';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowMdss';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowMdss';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('59MultiDomainServerMDS', 'postShowMdss', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-place-holder
   *
   * @function postShowPlaceHolder
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowPlaceHolder(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowPlaceHolder');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowPlaceHolder';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowPlaceHolder';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowPlaceHolder';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('60Placeholder', 'postShowPlaceHolder', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-global-assignment
   *
   * @function postAddGlobalAssignment
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddGlobalAssignment(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddGlobalAssignment');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddGlobalAssignment';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddGlobalAssignment';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddGlobalAssignment';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('61GlobalAssignment', 'postAddGlobalAssignment', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-global-assignment
   *
   * @function postShowGlobalAssignment
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowGlobalAssignment(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowGlobalAssignment');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowGlobalAssignment';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowGlobalAssignment';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowGlobalAssignment';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('61GlobalAssignment', 'postShowGlobalAssignment', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-global-assignment
   *
   * @function postSetGlobalAssignment
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetGlobalAssignment(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetGlobalAssignment');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetGlobalAssignment';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetGlobalAssignment';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetGlobalAssignment';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('61GlobalAssignment', 'postSetGlobalAssignment', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-global-assignment
   *
   * @function postDeleteGlobalAssignment
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteGlobalAssignment(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteGlobalAssignment');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteGlobalAssignment';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteGlobalAssignment';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteGlobalAssignment';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('61GlobalAssignment', 'postDeleteGlobalAssignment', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-global-assignments
   *
   * @function postShowGlobalAssignments
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowGlobalAssignments(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowGlobalAssignments');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowGlobalAssignments';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowGlobalAssignments';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowGlobalAssignments';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('61GlobalAssignment', 'postShowGlobalAssignments', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary assign-global-assignment
   *
   * @function postAssignGlobalAssignment
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAssignGlobalAssignment(ContentType, Xchkpsid, body, callback) {
    log.debug('postAssignGlobalAssignment');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAssignGlobalAssignment';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAssignGlobalAssignment';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAssignGlobalAssignment';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('61GlobalAssignment', 'postAssignGlobalAssignment', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary where-used
   *
   * @function postWhereUsed
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postWhereUsed(ContentType, Xchkpsid, body, callback) {
    log.debug('postWhereUsed');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postWhereUsed';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postWhereUsed';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postWhereUsed';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('62Misc', 'postWhereUsed', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-task
   *
   * @function postShowTask
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowTask(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowTask');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowTask';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowTask';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowTask';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('62Misc', 'postShowTask', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary run-script
   *
   * @function postRunScript
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postRunScript(ContentType, Xchkpsid, body, callback) {
    log.debug('postRunScript');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postRunScript';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postRunScript';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postRunScript';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('62Misc', 'postRunScript', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show  unused objects
   *
   * @function postShowUnusedObjects
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowUnusedObjects(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowUnusedObjects');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowUnusedObjects';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowUnusedObjects';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowUnusedObjects';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('62Misc', 'postShowUnusedObjects', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary export
   *
   * @function postExport
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postExport(ContentType, Xchkpsid, body, callback) {
    log.debug('postExport');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postExport';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postExport';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postExport';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('62Misc', 'postExport', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-changes between the dates
   *
   * @function postShowChanges
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowChanges(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowChanges');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowChanges';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowChanges';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowChanges';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('62Misc', 'postShowChanges', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-gateways-and-servers
   *
   * @function postShowGatewaysAndServers
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowGatewaysAndServers(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowGatewaysAndServers');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowGatewaysAndServers';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowGatewaysAndServers';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowGatewaysAndServers';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('62Misc', 'postShowGatewaysAndServers', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-objects of type group
   *
   * @function postShowObjects
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowObjects(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowObjects');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowObjects';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowObjects';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowObjects';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('62Misc', 'postShowObjects', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-validations
   *
   * @function postShowValidations
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowValidations(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowValidations');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowValidations';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowValidations';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowValidations';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('62Misc', 'postShowValidations', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-tasks
   *
   * @function postShowTasks
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowTasks(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowTasks');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowTasks';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowTasks';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowTasks';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('62Misc', 'postShowTasks', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-api-versions
   *
   * @function postShowApiVersions
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowApiVersions(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowApiVersions');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowApiVersions';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowApiVersions';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowApiVersions';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('62Misc', 'postShowApiVersions', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-object
   *
   * @function postShowObject
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowObject(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowObject');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowObject';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowObject';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowObject';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('62Misc', 'postShowObject', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-commands
   *
   * @function postShowCommands
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowCommands(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowCommands');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowCommands';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowCommands';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowCommands';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('62Misc', 'postShowCommands', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary put-file
   *
   * @function postPutFile
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postPutFile(ContentType, Xchkpsid, body, callback) {
    log.debug('postPutFile');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postPutFile';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postPutFile';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postPutFile';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('62Misc', 'postPutFile', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary add-administrator
   *
   * @function postAddAdministrator
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postAddAdministrator(ContentType, Xchkpsid, body, callback) {
    log.debug('postAddAdministrator');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postAddAdministrator';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postAddAdministrator';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postAddAdministrator';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('63Administrator', 'postAddAdministrator', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-administrator
   *
   * @function postShowAdministrator
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowAdministrator(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowAdministrator');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowAdministrator';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowAdministrator';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowAdministrator';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('63Administrator', 'postShowAdministrator', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-administrator
   *
   * @function postSetAdministrator
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetAdministrator(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetAdministrator');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetAdministrator';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetAdministrator';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetAdministrator';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('63Administrator', 'postSetAdministrator', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary delete-administrator
   *
   * @function postDeleteAdministrator
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postDeleteAdministrator(ContentType, Xchkpsid, body, callback) {
    log.debug('postDeleteAdministrator');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postDeleteAdministrator';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postDeleteAdministrator';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postDeleteAdministrator';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('63Administrator', 'postDeleteAdministrator', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-administrators
   *
   * @function postShowAdministrators
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowAdministrators(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowAdministrators');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowAdministrators';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowAdministrators';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowAdministrators';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('63Administrator', 'postShowAdministrators', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary unlock-administrator
   *
   * @function postUnlockAdministrator
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postUnlockAdministrator(ContentType, Xchkpsid, body, callback) {
    log.debug('postUnlockAdministrator');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postUnlockAdministrator';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postUnlockAdministrator';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postUnlockAdministrator';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('63Administrator', 'postUnlockAdministrator', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary show-api-settings
   *
   * @function postShowApiSettings
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postShowApiSettings(ContentType, Xchkpsid, body, callback) {
    log.debug('postShowApiSettings');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postShowApiSettings';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postShowApiSettings';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postShowApiSettings';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('64APISettings', 'postShowApiSettings', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }

  /**
   * @summary set-api-settings
   *
   * @function postSetApiSettings
   * @param {string} ContentType - ContentType param
   * @param {string} Xchkpsid - Xchkpsid param
   * @param {object} body - body param
   * @param {getCallback} callback - a callback function to return the result
   */
  /* YOU CAN CHANGE THE PARAMETERS YOU TAKE IN HERE AND IN THE pronghorn.json FILE */
  postSetApiSettings(ContentType, Xchkpsid, body, callback) {
    log.debug('postSetApiSettings');
    /* HERE IS WHERE YOU VALIDATE DATA */
    if (!ContentType) {
      const err = 'ContentType is required for postSetApiSettings';
      return callback(null, err);
    }
    if (!Xchkpsid) {
      const err = 'Xchkpsid is required for postSetApiSettings';
      return callback(null, err);
    }
    if (!body) {
      const err = 'body is required for postSetApiSettings';
      return callback(null, err);
    }

    /* HERE IS WHERE YOU SET THE DATA TO PASS INTO REQUEST */
    // set up the request object - payload, uriPathVars, uriQuery, uriOptions, addlHeaders

    const queryParamsAvailable = {};
    const queryParams = {};
    const pathVars = [];
    const bodyVars = body;

    // loop in template. long callback arg name to avoid identifier conflicts
    Object.keys(queryParamsAvailable).forEach((thisKeyInQueryParamsAvailable) => {
      if (queryParamsAvailable[thisKeyInQueryParamsAvailable]) {
        queryParams[thisKeyInQueryParamsAvailable] = queryParamsAvailable[thisKeyInQueryParamsAvailable];
      }
    });

    const reqObj = {
      payload: bodyVars,
      uriPathVars: pathVars,
      uriQuery: queryParams
    };

    try {
      // Make the call -
      // identifyRequest(entity, action, requestObj, returnDataFlag, callback)
      return this.requestHandlerInst.identifyRequest('64APISettings', 'postSetApiSettings', reqObj, true, (irReturnData, irReturnError) => {
        // if we received an error or their is no response on the results
        // return an error
        if (irReturnError) {
          /* HERE IS WHERE YOU CAN ALTER THE ERROR MESSAGE */
          // set the failover based on the returned failover and error code
          const errMsg = irReturnError;
          return callback(null, errMsg);
        }

        /* HERE IS WHERE YOU CAN ALTER THE RETURN DATA */
        // return the response
        return callback(irReturnData, null);
      });
    } catch (ex) {
      log.error(ex);
      return callback(null, ex);
    }
  }
}

module.exports = Checkpoint;
