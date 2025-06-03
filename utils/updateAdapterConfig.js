/* @copyright Itential, LLC 2025 */

// Set globals
/* global log */

const fs = require('fs');
const path = require('path');
const PropUtilCl = require('@itentialopensource/adapter-utils').PropertyUtility;
const MongoDBConnection = require('./mongoDbConnection');

const propUtil = new PropUtilCl();

/**
 * Updates action configuration in the document
 * @param {Object} doc - Document to update
 * @param {string} action - Action name
 * @param {Object} changes - Changes to apply
 * @returns {Object} Updated document
 */
function updateActionConfig(doc, action, changes) {
  const updateDoc = { ...doc };
  if (!updateDoc.actions) updateDoc.actions = [];
  const actionIndex = updateDoc.actions.findIndex((a) => a.name === action);
  if (actionIndex >= 0) {
    updateDoc.actions[actionIndex] = propUtil.mergeProperties(changes, updateDoc.actions[actionIndex]);
  } else {
    updateDoc.actions.push({ name: action, ...changes });
  }
  return updateDoc;
}

/**
 * Updates schema configuration in the document
 * @param {Object} doc - Document to update
 * @param {string} configFile - Configuration file name
 * @param {Object} changes - Changes to apply
 * @returns {Object} Updated document
 */
function updateSchemaConfig(doc, configFile, changes) {
  const updateDoc = { ...doc };
  if (!updateDoc.schema) updateDoc.schema = [];
  const schemaIndex = updateDoc.schema.findIndex((s) => s.name === configFile);
  if (schemaIndex >= 0) {
    updateDoc.schema[schemaIndex].schema = propUtil.mergeProperties(changes, updateDoc.schema[schemaIndex].schema);
  } else {
    updateDoc.schema.push({ name: configFile, schema: changes });
  }
  return updateDoc;
}

/**
 * Updates mock data configuration in the document
 * @param {Object} doc - Document to update
 * @param {string} configFile - Configuration file name
 * @param {Object} changes - Changes to apply
 * @param {boolean} replace - Whether to replace or merge
 * @returns {Object} Updated document
 */
function updateMockConfig(doc, configFile, changes, replace) {
  const updateDoc = { ...doc };
  if (!updateDoc.mockdatafiles) updateDoc.mockdatafiles = {};
  updateDoc.mockdatafiles[configFile] = replace ? changes : propUtil.mergeProperties(changes, updateDoc.mockdatafiles[configFile] || {});
  return updateDoc;
}

/**
 * Configuration update strategies for different types
 */
const updateStrategies = {
  action: (doc, configFile, changes, action) => (!action ? doc : updateActionConfig(doc, action, changes)),
  schema: (doc, configFile, changes) => updateSchemaConfig(doc, configFile, changes),
  mock: (doc, configFile, changes, replace) => updateMockConfig(doc, configFile, changes, replace)
};

/**
 * Updates MongoDB configuration for an adapter entity
 * @param {Object} options - Configuration options
 * @param {string} options.id - Adapter ID
 * @param {Object} options.mongoProps - MongoDB connection properties
 * @param {string} options.entity - Entity name
 * @param {string} options.type - Update type (action/schema/mock)
 * @param {string} options.configFile - Configuration file name
 * @param {Object} options.changes - Changes to apply
 * @param {string} options.action - Action name (for action type updates)
 * @param {boolean} options.replace - Whether to replace or merge (for mock type updates)
 * @returns {Promise<void>}
 */
async function updateMongoDBConfig(options) {
  const {
    id,
    mongoProps,
    entity,
    type,
    configFile,
    changes,
    action,
    replace
  } = options;

  if (!mongoProps) {
    log.error('MongoDB properties not found');
    return;
  }

  let mongoConnection = null;
  try {
    // Get adapter type from pronghorn.json
    const pronghornPath = path.join(__dirname, '../pronghorn.json');
    const pronghornData = JSON.parse(fs.readFileSync(pronghornPath, 'utf8'));
    const adapterType = pronghornData.id;

    mongoConnection = new MongoDBConnection(mongoProps);
    await mongoConnection.connect();

    const collection = mongoConnection.db.collection('adapter_configs');
    const query = {
      id,
      type: adapterType,
      entity
    };

    const existingConfig = await collection.findOne(query);
    if (!existingConfig) {
      log.debug(`No existing configuration found for entity ${entity}`);
      return;
    }

    // Update the configuration based on type
    const updateStrategy = updateStrategies[type];
    if (!updateStrategy) {
      log.error(`Unsupported update type: ${type}`);
      return;
    }

    const updatedDoc = updateStrategy(existingConfig, configFile, changes, action || replace);

    // Remove _id from updateDoc as it can't be modified
    const { _id, ...updateDocWithoutId } = updatedDoc;
    const updateResult = await collection.updateOne(
      { id, type: adapterType, entity },
      { $set: updateDocWithoutId }
    );

    if (updateResult.modifiedCount === 0) {
      log.warn(`No documents were modified for entity ${entity}`);
    }
    log.info(`Successfully updated MongoDB configuration for entity ${entity}`);
  } catch (error) {
    log.error(`Error updating MongoDB configuration: ${error.message}`);
    throw error;
  } finally {
    if (mongoConnection) {
      await mongoConnection.closeConnection();
    }
  }
}

module.exports = { updateMongoDBConfig };
