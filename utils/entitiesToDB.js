/* @copyright Itential, LLC 2021 */

// Set globals
/* global log */

/* eslint import/no-dynamic-require: warn */
/* eslint global-require: warn */
/* eslint no-unused-vars: warn */
/* eslint import/no-unresolved: warn */

/**
 *  This script is used to read through an adapter's entities files
 *  and then creates documents and enters them into the IAP mongodb
 */

const fs = require('fs');
const { MongoClient } = require('mongodb');
const path = require('path');
// const { argv } = require('process');
// const { string } = require('yargs');

// get the pronghorn database information
const getPronghornProps = async (iapDir) => {
  log.trace('Retrieving properties.json file...');
  const rawProps = require(path.join(iapDir, 'properties.json'));
  log.trace('Decrypting properties...');
  const { PropertyEncryption } = require('@itential/itential-utils');
  const propertyEncryption = new PropertyEncryption();
  const pronghornProps = await propertyEncryption.decryptProps(rawProps);
  log.trace('Found properties.\n');
  return pronghornProps;
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
const optionsHandler = (options) => {
  // if the database properties were provided in the options - return them
  if (options.pronghornProps) {
    if (typeof options.pronghornProps === 'string') {
      return JSON.parse(options.pronghornProps);
    }
    return new Promise((resolve, reject) => resolve(options.pronghornProps));
  }

  // if the directory was provided, get the pronghorn props from the directory
  if (options.iapDir) {
    return getPronghornProps(options.iapDir);
  }

  // if nothing was provided, error
  return new Promise((resolve, reject) => reject(new Error('Neither pronghornProps nor iapDir defined in options!')));
};

/**
 *  Function used to put the adapter configuration into the provided database
 */
const moveEntitiesToDB = (targetPath, options) => {
  // set local variables
  let myOpts = options;
  let myPath = targetPath;

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

  // get the pronghorn database properties
  optionsHandler(options).then((currentProps) => {
    let mongoUrl;
    let dbName;

    // find the mongo properties so we can connect
    if (currentProps.mongoProps) {
      mongoUrl = currentProps.mongoProps.url;
      dbName = currentProps.mongoProps.db;
    } else if (currentProps.mongo) {
      if (currentProps.mongo.url) {
        mongoUrl = currentProps.mongo.url;
      } else {
        mongoUrl = `mongodb://${currentProps.mongo.host}:${currentProps.mongo.port}`;
      }
      dbName = currentProps.mongo.database;
    } else {
      throw new Error('Mongo properties are not specified in adapter preferences!');
    }

    // Check valid filepath provided
    if (!myPath) {
      // if no path use the current directory without the utils
      myPath = path.join(__dirname, '../');
    } else if (myPath.slice(-1) === '/') {
      myPath = myPath.slice(0, -1);
    }

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
    MongoClient.connect(mongoUrl, (err, db) => {
      if (err) {
        log.error(JSON.stringify(err));
        throw err;
      }

      // get the proper collection
      const collection = db.db(dbName).collection(myOpts.targetCollection);
      // insert the documents into the collection
      collection.insertMany(docs, { checkKeys: false }, (error, res) => {
        if (error) {
          log.error(JSON.stringify(error));
          throw error;
        }
        // log the insertion, close the database and return
        log.debug(`Inserted ${docs.length} documents to ${dbName}.${myOpts.targetCollection} with response ${JSON.stringify(res)}`);
        db.close();
        return res;
      });
    });
  });
};

// const args = process.argv.slice(2);

// throw new SyntaxError(args[0]);

// if (args.length === 0) {
//   console.error('ERROR: target path not specified!');
// } else if (args[0] === 'help') {
//   log.trace('node ./entitiesToDB <target path> <options object: {iapDir: string, pronghornProps: string, targetCollection: string}>');
// } else if (args.length === 1) {
//   console.error('ERROR: IAP directory not specified');
// } else {
//   moveEntitiesToDB(args[0], args[1]);
// }

module.exports = { moveEntitiesToDB };
