const { execSync } = require('child_process');
const fs = require('fs-extra');
const rls = require('readline-sync');
const { existsSync } = require('fs-extra');

/**
 * @summary Creates a backup zip file of current adapter
 *
 * @function backup
 */
function backup() {
  // zip all files except node_modules and package-lock
  const backupCmd = 'zip -r previousVersion.zip .';
  execSync(backupCmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 2 });
}

/**
 * @summary Archives previous modifications and removes the modification package
 *
 * @function archiveMod
 * @param {String} modType - update(UPD) or migrate(MIG)
 */
function archiveMod(modType) {
  if (!existsSync('./adapter_modifications/archive')) {
    execSync('mkdir ./adapter_modifications/archive');
  }
  const zipFile = modType === 'UPD' ? 'updatePackage.zip' : 'migrationPackage.zip';
  const now = new Date();
  const archiveName = `${modType}-${now.toISOString()}`;
  execSync(`mkdir adapter_modifications/archive/${archiveName}`);
  const archiveCmd = 'mv adapter_modifications/archive .'
    + ` && mv adapter_modifications/* archive/${archiveName}`
    + ' && mv archive adapter_modifications'
    + ` && rm ${zipFile}`;
  execSync(archiveCmd, { encoding: 'utf-8' });
}

/**
 * @summary Reverts modifications using backup zip file
 *
 * @function revertMod
 */
function revertMod() {
  const files = fs.readdirSync('./');
  // remove all files except previousVersion
  files.forEach((file) => {
    if (file !== 'previousVersion.zip') {
      fs.removeSync(file);
    }
  });
  // unzip previousVersion, reinstall dependencies and delete zipfile
  execSync('unzip -o previousVersion.zip && rm -rf node_modules && rm package-lock.json && npm install', { maxBuffer: 1024 * 1024 * 2 });
  execSync('rm previousVersion.zip');
  console.log('Changes have been reverted');
}

/**
 * @summary Handle migration logic
 */
function handleMigration() {
  if (!existsSync('migrationPackage.zip')) {
    throw new Error('Migration Package not found. Download and place migrationPackage in the adapter root directory');
  }

  backup();
  console.log('Migrating adapter and running tests...');
  const migrateCmd = 'unzip -o migrationPackage.zip'
    + ' && cd adapter_modifications'
    + ' && node migrate';
  const migrateOutput = execSync(migrateCmd, { encoding: 'utf-8' });
  console.log(migrateOutput);

  if (migrateOutput.includes('Lint exited with code 1') || migrateOutput.includes('Tests exited with code 1')) {
    if (rls.keyInYN('Adapter failed tests or lint after migrating. Would you like to revert the changes?')) {
      console.log('Reverting changes...');
      revertMod();
      throw new Error('Adapter failed tests or lint after migrating. Changes reverted');
    }
    console.log('Adapter Migration will continue. If you want to revert the changes, run the command npm run adapter:revert');
  }

  console.log('Installing new dependencies..');
  const updatePackageCmd = 'rm -rf node_modules && rm package-lock.json && npm install';
  const updatePackageOutput = execSync(updatePackageCmd, { encoding: 'utf-8' });
  console.log(updatePackageOutput);
  console.log('New dependencies installed');
  archiveMod('MIG');
}

/**
 * @summary Handle update logic
 */
function handleUpdate() {
  if (!existsSync('updatePackage.zip')) {
    throw new Error('Update Package not found. Download and place updateAdapter.zip in the adapter root directory');
  }

  backup();
  const updateCmd = 'unzip -o updatePackage.zip'
    + ' && cd adapter_modifications'
    + ' && node update.js updateFiles';
  execSync(updateCmd, { encoding: 'utf-8' });
  const updateOutput = execSync(updateCmd, { encoding: 'utf-8' });

  if (updateOutput.includes('Lint exited with code 1') || updateOutput.includes('Tests exited with code 1')) {
    if (rls.keyInYN('Adapter failed tests or lint after updating. Would you like to revert the changes?')) {
      console.log('Reverting changes...');
      revertMod();
      throw new Error('Adapter failed tests or lint after updating. Changes reverted');
    }
    console.log('Adapter Update will continue. If you want to revert the changes, run the command npm run adapter:revert');
  }

  console.log(updateOutput);
  console.log('Adapter Successfully Updated. Restart adapter in IAP to apply the changes');
  archiveMod('UPD');
}

/**
 * @summary Handle revert logic
 */
function handleRevert() {
  if (!existsSync('previousVersion.zip')) {
    throw new Error('Previous adapter version not found. There are no changes to revert');
  }
  revertMod();
}

/**
 * @summary Entrypoint for the script
 */
function main() {
  const flags = process.argv[2];

  switch (flags) {
    case '-m':
      return handleMigration();
    case '-u':
      return handleUpdate();
    case '-r':
      return handleRevert();
    default:
      throw new Error('Invalid flag. Use -m for migrate, -u for update, or -r for revert.');
  }
}

try {
  main();
  process.exit(0);
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
