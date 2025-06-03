#!/usr/bin/env node
/* @copyright Itential, LLC 2025 */

/* eslint global-require:warn */
/* eslint import/no-dynamic-require:warn */
/* eslint prefer-destructuring:warn */

/**
 * This script will determine the information about the adapter and store
 * it into a file in the adapter. This is self contained and only depends on
 * finding files within the adapter to gather information.
 *
 * This utility is used when adapters are committed and pushed. It is not used by
 * any customers nor is it references in any scripts.
 */

const path = require('path');
const fs = require('fs-extra');

/**
 * @summary Count the number of lines in a file
 * @param {string} filePath - The path to the file
 * @returns {number} The total number of lines in the file
 */
function countLinesInFile(filePath) {
  if (fs.existsSync(filePath)) {
    const cFile = fs.readFileSync(filePath, 'utf8');
    return cFile.split('\n').length;
  }
  console.log(`Missing - ${path.basename(filePath)}`);
  return 0;
}

/**
 * @summary Count the number of lines across multiple files
 * @param {array} filePaths - An array of file paths
 * @returns {number} The total number of lines across all files
 */
function countLinesInFiles(filePaths) {
  return filePaths.reduce((total, filePath) => total + countLinesInFile(filePath), 0);
}

/**
 * @summary Count the number of lines in all json files within an entity directory
 * @param {string} entityDir - The entity directory
 * @returns {number} The total number of lines across all JSON files in the entity directory
 */
function countEntityLines(entityDir) {
  let totalLines = 0;

  if (!fs.existsSync(entityDir)) {
    console.log('Could not find the entities directory');
    return totalLines;
  }
  const entities = fs.readdirSync(entityDir);
  for (let e = 0; e < entities.length; e += 1) {
    const entityPath = path.join(entityDir, entities[e]);
    if (fs.statSync(entityPath).isDirectory()) {
      const jsonFiles = fs.readdirSync(entityPath).filter((f) => f.endsWith('.json'));
      for (let j = 0; j < jsonFiles.length; j += 1) {
        totalLines += countLinesInFile(path.join(entityPath, jsonFiles[j]));
      }
    }
  }
  return totalLines;
}

/**
 * @summary Count the number of test cases in a file
 * @param {string} filePath - The path to the test file
 * @returns {number} The total number of test cases in the file
 */
function countTestsInFile(filePath) {
  if (fs.existsSync(filePath)) {
    const tFile = fs.readFileSync(filePath, 'utf8');
    const ttestCount = tFile.split('it(\'').length;
    return ttestCount;
  }
  console.log(`Missing - ${path.basename(filePath)}`);
  return 0;
}

/**
 * @summary Count the number of test cases across multiple files
 * @param {array} filePaths - An array of test file paths
 * @returns {number} The total number of test cases across all files
 */
function countTestsInFiles(filePaths) {
  return filePaths.reduce((total, filePath) => total + countTestsInFile(filePath), 0);
}

function adapterInfo() {
  // set the base pase of the adapter - tool shoud be one level up in utils
  let adaptdir = __dirname;
  const infoRes = {};

  if (adaptdir.endsWith('/utils')) {
    adaptdir = adaptdir.substring(0, adaptdir.length - 6);
  }

  // if no package.json then not in right place - end with error
  if (!fs.existsSync(`${adaptdir}/package.json`)) {
    throw new Error('Missing - package.json');
  }
  const pack = require(`${adaptdir}/package.json`);
  infoRes.version = pack.version;

  let configCount = 0;
  const configFiles = ['pronghorn.json', 'propertiesSchema.json', 'error.json'].map((f) => path.join(adaptdir, f));
  configCount = countLinesInFiles(configFiles);

  const entityDir = path.join(adaptdir, '/entities');
  configCount += countEntityLines(entityDir);

  infoRes.configLines = configCount;

  const utilFiles = ['argParser', 'checkMigrate.js', 'entitiesToDB.js', 'findPath.js', 'logger.js', 'methodDocumentor.js', 'modify.js', 'mongoDbConnection.js',
    'mongoUtils.js', 'setup.js', 'taskMover.js', 'tbScript.js', 'tbUtils.js', 'testRunner.js', 'troubleshootingAdapter.js', 'updateAdapterConfig.js'
  ].map((f) => path.join(adaptdir, 'utils', f));

  infoRes.scriptLines = countLinesInFiles(utilFiles);

  const adapterFiles = ['adapter.js', 'adapterBase.js'].map((f) => path.join(adaptdir, f));
  infoRes.codeLines = countLinesInFiles(adapterFiles);

  const testFiles = [
    'test/integration/adapterTestBasicGet.js',
    'test/integration/adapterTestConnectivity.js',
    'test/integration/adapterTestIntegration.js',
    'test/unit/adapterBaseTestUnit.js',
    'test/unit/adapterTestUnit.js'
  ].map((f) => path.join(adaptdir, f));
  infoRes.testLines = countLinesInFiles(testFiles);
  infoRes.testCases = countTestsInFiles(testFiles);

  infoRes.totalCodeLines = infoRes.scriptLines + infoRes.codeLines + infoRes.testLines;

  if (fs.existsSync(`${adaptdir}/pronghorn.json`)) {
    // Read the entity schema from the file system
    const phFile = path.join(adaptdir, '/pronghorn.json');
    const prong = require(phFile);
    infoRes.wfTasks = prong.methods.length;
  } else {
    console.log('Missing - pronghorn.json');
  }

  console.log(JSON.stringify(infoRes));
  fs.writeFileSync(`${adaptdir}/report/adapterInfo.json`, JSON.stringify(infoRes, null, 2));
}

try {
  adapterInfo();
} catch (err) {
  console.error(err.message);
  process.exit();
}
