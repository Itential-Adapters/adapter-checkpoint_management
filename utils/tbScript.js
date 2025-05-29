/* @copyright Itential, LLC 2025 */

/**
 * This script will determine which troubleshooting script the user is trying to run and then start the
 * process to run it.
 *
 * This utility is executed from a script in the package.json by `node utils/tbScript.js <script>`. As a result,
 * this utility is exposed and available to customers but exclusively through the CLI.
 */

const program = require('commander');
const rls = require('readline-sync');
const utils = require('./tbUtils');
const sampleProperties = require('../sampleProperties.json');
const { troubleshoot } = require('./troubleshootingAdapter');

/**
 * @summary tbScript is how many of the troubleshooting scripts are called from the command line (scripts in package.json)
 *
 *   execution:   node utils/tbScript.js healthcheck   (or one of the other supported scripts)
 */
const main = async (command, maxCalls) => {
  console.info('> Using sampleProperties.json configuration');
  const samProps = sampleProperties.properties;

  // perform the desired action
  switch (command) {
    case 'connectivity': {
      const { host } = samProps;
      console.log(`perform networking diagnositics to ${host}`);
      utils.runConnectivity(host, true);
      break;
    }
    case 'healthcheck': {
      const a = utils.getAdapterInstance({ properties: sampleProperties });
      console.log(`perform healthcheck on instantiated adapter with properties: ${sampleProperties.properties}`);
      await utils.healthCheck(a);
      break;
    }
    case 'basicget': {
      console.log(`perform basic get to ${samProps.host}`);
      utils.runBasicGet(samProps, true, maxCalls);
      break;
    }
    default: {
      if (rls.keyInYN('Troubleshooting without IAP?')) {
        await troubleshoot(samProps, true, null);
      }
    }
  }
  process.exit(0);
};

program
  .command('connectivity')
  .alias('c')
  .description('networking diagnostics')
  .action(() => {
    main('connectivity');
  });

program
  .command('healthcheck')
  .alias('hc')
  .description('perfom none interative healthcheck with current setting')
  .action(() => {
    main('healthcheck');
  });

program
  .command('basicget')
  .alias('bg')
  .description('perfom basicget')
  .option(
    '--maxcalls <n>',
    'maximum number of GET calls (overrides default)',
    parseInt
  )
  .action((cmd) => {
    main('basicget', cmd.maxcalls);
  });

program
  .command('troubleshoot')
  .alias('tb')
  .description('perfom troubleshooting')
  .action(() => {
    main('troubleshoot');
  });

// Allow commander to parse process.argv
// tbScript is called with an argument of the desired script
program.parse(process.argv);

if (process.argv.length < 3) {
  main();
}
const allowedParams = ['healthcheck', 'basicget', 'connectivity', 'troubleshoot'];
if (process.argv.length === 3 && !allowedParams.includes(process.argv[2])) {
  console.log(`unknown parameter ${process.argv[2]}`);
  console.log('try `node troubleshootingAdapter.js -h` to see allowed parameters. Exiting...');
  process.exit(0);
}
