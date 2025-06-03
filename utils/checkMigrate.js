/* @copyright Itential, LLC 2025 */

/**
 * This script will determine if the adapter needs to be upgraded, a migration is needed or
 * a remediation is needed. This is self contained and depends on accessing GitLab repos as well as
 * finding files within the adapter to gather and compare information.
 *
 * This utility is executed from a script in the package.json by `npm run adapter:checkMigrate`. As a result,
 * this utility is exposed and available to customers but exclusively through the CLI.
 */

const { execSync } = require('child_process');
const semver = require('semver');
const packageJson = require('../package.json');
const { get } = require('./tbUtils');

const localAdaptVer = packageJson.version;
const localEngineVer = packageJson.engineVersion;
const localUtils = execSync('npm list @itentialopensource/adapter-utils', { encoding: 'utf-8' });
const localUtilsVer = localUtils.split('@').pop().replace(/(\r\n|\n|\r| )/gm, '');

/**
 * @summary Checks if adapter is the latest version
 *
 * @function updateNeeded
 */
async function updateNeeded() {
  const adapterUrl = `https://registry.npmjs.org/${packageJson.name}`;
  const latestAdapterVer = (await get(adapterUrl)).data['dist-tags'].latest;
  console.log('\n[Upgrade Check]');
  console.log(`Local Adapter Version : ${localAdaptVer}`);
  console.log(`Latest Adapter Version: ${latestAdapterVer}`);
  return semver.lt(localAdaptVer, latestAdapterVer);
}

/**
 * @summary Checks if adapter is up-to-date or if migration is needed
 *
 * @function migrateNeeded
 */
async function migrateNeeded() {
  const engineUrl = 'https://adapters.itential.io/engineVersion';
  const latestEngineVer = (await get(engineUrl)).data;
  console.log('\n[Migration Check]');
  console.log(`Local Engine Version : ${localEngineVer}`);
  console.log(`Latest Engine Version: ${latestEngineVer}`);
  return semver.lt(localEngineVer, latestEngineVer);
}

/**
 * @summary Checks if adapter is up-to-date or if remediation is needed
 *
 * @function remediationNeeded
 */
async function remediationNeeded() {
  const utilsUrl = 'https://registry.npmjs.org/@itentialopensource/adapter-utils';
  const latestUtilsVer = (await get(utilsUrl)).data['dist-tags'].latest;
  console.log('\n[Remediation Check]');
  console.log(`Local Utils Version : ${localUtilsVer}`);
  console.log(`Latest Utils Version: ${latestUtilsVer}`);
  return semver.lt(localUtilsVer, latestUtilsVer);
}

/**
 * @summary Main Script (rest of file)
 *
 * Input - None
 * Process - gets the adapter version from the package.json and compares it to the latest version of the adapter,
 *      then get the engine version from the package.json and compare it to the adapter engine version in the repo.
 *      then get the local adapter-utils version and compare that to the latest version of adapter-utils.
 * Output - console logs providing state and path forward
 *
 */
updateNeeded().then((needed) => {
  if (needed) {
    console.log('You should update the adapter to the latest available version -- git pull');
  } else {
    console.log('Update is not needed at the current time.');
  }
}).catch((error) => {
  console.log('Could not get latest adapter version. Confirm the adapter is an open source adapter.', error.message);
});

migrateNeeded().then((needed) => {
  if (needed) {
    console.log('Migration is needed -- if open source, request Itential migrate the adapter');
  } else {
    console.log('Migration is not needed at the current time.');
  }
}).catch((error) => {
  console.log('Could not get latest engine version. Confirm the adapter was built by the Itential Adapter Builder.', error.message);
});

remediationNeeded().then((needed) => {
  if (needed) {
    console.log('Remediation is needed -- update the version of adapter-utils in the package.json, remove node modules and package-lock and run npm install');
  } else {
    console.log('Remediation is not needed at the current time.');
  }
}).catch((error) => {
  console.log('Could not get latest utils version. Confirm the adapter utilizes the Itential adapter foundation.', error.message);
});
