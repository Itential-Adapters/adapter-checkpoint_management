/* @copyright Itential, LLC 2020 */

/* global describe it log before after */
/* eslint global-require: warn */
/* eslint no-unused-vars: warn */
/* eslint import/no-extraneous-dependencies: warn */
/* eslint import/no-dynamic-require: warn */
/* eslint import/no-unresolved: warn */
/* eslint no-loop-func: warn */

/* This performs a number of GET calls (defaults to 5 calls) which do not reuire an input, to test connectivity and functionality.
The number of calls can be modified if running from CLI. */

const assert = require('assert');

const log = require('../../utils/logger');
const { id } = require('../../package.json');
const { methods } = require('../../pronghorn.json');
const { parseArgs } = require('../../utils/argParser');

const {
  properties, maxCalls
} = parseArgs();

// require the adapter that we are going to be using
const TestAdapter = require('../../adapter');

if (!properties) {
  log.warn('No properties provided. Exiting process.');
  process.exit(1);
}

let successCount = 0;
let calls = 0;
let attemptTimeout = 60000;
if (properties.request && properties.request.attempt_timeout) {
  attemptTimeout = properties.request.attempt_timeout;
}

// turn off stub mode - basic get should not be run in stub mode
properties.stub = false;

describe('[integration] Adapter BasicGET Test', () => {
  describe('Class Tests', () => {
    const testAdapter = new TestAdapter(
      id,
      properties
    );

    after((done) => {
      if (successCount === calls) {
        log.info('\x1b[32m%s\x1b[0m', `\n\nSUCCESS: ${successCount} test(s) passed of ${calls} executed!`);
      } else if (successCount > 0) {
        log.error('\x1b[32m%s\x1b[0m', `\n\nPARTIAL SUCCESS: ${successCount} test(s) passed of ${calls} executed!`);
      } else {
        log.error('\x1b[31m%s\x1b[0m', '\n\nFAILURE: All tests failed.');
      }
      done();
    });

    const basicGets = methods.filter((method) => {
      // ignore iapMetadata as the input since its optional and all functions will have it
      const inputKeys = (method.input || [])
        .map((param) => param.name)
        .filter((name) => name !== 'iapMetadata');
      return method.route.verb === 'GET' && inputKeys.length === 0 && !method.name.startsWith('iap');
    });

    if (basicGets.length === 0) {
      log.warn('No non-parameter GET calls found.');
      process.exitCode = 0;
      return;
    }

    const functionNames = basicGets.map((g) => g.name);
    calls = functionNames.length;
    if (calls > maxCalls) {
      calls = maxCalls;
    }

    // test up to the first 5 get calls without parameters
    for (let f = 0; f < calls; f += 1) {
      const fnName = functionNames[f];
      const method = basicGets.find((m) => m.name === fnName);
      const hasIapMetadata = Array.isArray(method.input) && method.input.some((param) => param.name === 'iapMetadata');
      describe(`#${functionNames[f]}`, () => {
        it('should return valid response without error', (done) => {
          const callback = (data, error) => {
            try {
              assert.equal(undefined, error);
              assert.notEqual(undefined, data);
              assert.notEqual(null, data);
              assert.notEqual(undefined, data.response);
              assert.notEqual(null, data.response);
              successCount += 1;
              done();
            } catch (err) {
              log.error(`Test Failure in ${fnName}: ${err}`);
              done(err);
            }
          };

          try {
            if (hasIapMetadata) {
              testAdapter[fnName](null, callback);
            } else {
              testAdapter[fnName](callback);
            }
          } catch (err) {
            log.error(`Unexpected error in test for ${fnName}: ${err}`);
            done(err);
          }
        }).timeout(attemptTimeout);
      });
    }
  });
});
