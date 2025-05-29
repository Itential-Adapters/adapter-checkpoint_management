/* @copyright Itential, LLC 2021 */

// Set globals
/* global log */

/* eslint import/no-dynamic-require: warn */
/* eslint global-require: warn */
/* eslint no-unused-vars: warn */
/* eslint import/no-unresolved: warn */
/* eslint no-promise-executor-return: warn */

/**
 *  This script is used to read through an adapter's entities files
 *  and then creates documents and enters them into the IAP mongodb
 */

const fs = require('fs');
const path = require('path');
const tbUtils = require('./tbUtils');
const mongoUtils = require('./mongoUtils');

/**
 * Function to load sample properties from the file system
 */
const loadSampleProperties = async () => {
  const samplePath = path.join(__dirname, '../sampleProperties.json');
  if (fs.existsSync(samplePath)) {
    const fullProps = JSON.parse(fs.readFileSync(samplePath, 'utf-8'));
    return fullProps.properties.mongo;
  }
  throw new Error('sampleProperties.json not found');
};

/**
 *  Function used to take a file path to a entity directory and build
 *  a document that corresponds to the entity files.
 */
const buildDoc = (pathstring) => {
  let files = fs.readdirSync(pathstring);

  // load the mockdatafiles
  const mockdatafiles = {};
  if (files.includes('mockdatafiles') && fs.lstatSync(`${pathstring}/mockdatafiles`).isDirectory()) {
    fs.readdirSync(`${pathstring}/mockdatafiles`).forEach((file) => {
      if (file.split('.').pop() === 'json') {
        const mockpath = `${pathstring}/mockdatafiles/${file}`;
        const data = JSON.parse(fs.readFileSync(mockpath));
        mockdatafiles[mockpath.split('/').pop()] = data;
      }
    });
  }

  // load the action data
  let actions;
  if (files.includes('action.json')) {
    actions = JSON.parse(fs.readFileSync(`${pathstring}/action.json`));
  }

  // Load schema.json and other schemas in remaining json files
  files = files.filter((f) => (f !== 'action.json') && f.endsWith('.json'));
  const schema = [];
  files.forEach((file) => {
    const data = JSON.parse(fs.readFileSync(`${pathstring}/${file}`));
    schema.push({
      name: file,
      schema: data
    });
  });

  // return the data
  return {
    actions: actions.actions,
    schema,
    mockdatafiles
  };
};

/**
 *  Function used to get the database from the options or a provided directory
 */
const optionsHandler = async (options) => {
  try {
    // Try mongo properties from service config first
    const mongoPronghornProps = options?.pronghornProps?.mongo;
    const validatedPronghornProps = mongoPronghornProps ? mongoUtils.getAndValidateMongoProps(mongoPronghornProps) : undefined;
    if (validatedPronghornProps) return validatedPronghornProps;

    // Fallback to sample properties
    const sampleProps = await loadSampleProperties();
    const validatedSampleProps = mongoUtils.getAndValidateMongoProps(sampleProps);
    if (validatedSampleProps) return validatedSampleProps;

    throw new Error('No mongo properties provided! Need either a complete URL or both host and database');
  } catch (error) {
    log.error('Error in optionsHandler:', error.message);
    throw error;
  }
};

/**
 *  Function used to put the adapter configuration into the provided database
 */
const moveEntitiesToDB = async (targetPath, options) => {
  // set local variables
  let myOpts = options;
  let myPath = targetPath;
  let mongoConnection = null;

  // if we got a string parse into a JSON object
  if (typeof myOpts === 'string') {
    myOpts = JSON.parse(myOpts);
  }

  // if there is no target collection - set the collection to the default
  if (!myOpts.targetCollection) {
    myOpts.targetCollection = 'adapter_configs';
  }

  // if there is no id error since we need an id for the entities
  if (!myOpts.id) {
    throw new Error('Adapter ID required!');
  }

  // Check valid filepath provided
  if (!myPath) {
    // if no path use the current directory without the utils
    myPath = path.join(__dirname, '../');
  } else if (myPath.slice(-1) === '/') {
    myPath = myPath.slice(0, -1);
  }

  try {
    // get the database properties from adapter service instance configs
    const currentProps = await optionsHandler(options);

    // verify set the entity path
    const entitiesPath = `${myPath}/entities`;
    if (!fs.existsSync(entitiesPath)) {
      throw new Error(`Entities path does not exist in filesystem: ${entitiesPath}`);
    } else {
      log.trace('Target found on filesystem');
    }

    // Get adapter details
    if (!fs.existsSync(`${myPath}/pronghorn.json`)) {
      throw new Error(`pronghorn.json does not exist in path: ${myPath}`);
    } else {
      log.trace('pronghorn.json found on filesystem');
    }
    const adapterData = JSON.parse(fs.readFileSync(`${myPath}/pronghorn.json`));

    // Load files from the filesystem
    const docs = [];
    const entities = fs.readdirSync(entitiesPath);
    entities.forEach((entity) => {
      const entityPath = `${entitiesPath}/${entity}`;
      const isDir = fs.lstatSync(entitiesPath).isDirectory();

      // Build doc for entity
      if (isDir) {
        let doc = buildDoc(entityPath);
        doc = {
          id: myOpts.id,
          type: adapterData.id,
          entity,
          ...doc
        };
        docs.push(doc);
      }
    });

    // Upload documents to db collection
    mongoConnection = await tbUtils.connect(currentProps).catch((err) => { log.error(err); throw err; });
    if (!mongoConnection) {
      log.error('Error occurred when connecting to database', currentProps);
      throw new Error('Database not found');
    }

    const collection = mongoConnection.db.collection(myOpts.targetCollection);
    const res = await collection.insertMany(docs, { checkKeys: false }).catch((err) => { log.error(err); throw err; });
    return res;
  } finally {
    // Ensure connection is closed even if an error occurs
    if (mongoConnection) {
      await tbUtils.closeConnection(mongoConnection);
    }
  }
};

module.exports = { moveEntitiesToDB };
