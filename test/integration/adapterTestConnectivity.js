/* @copyright Itential, LLC 2020 */

/* global describe it context before after */
/* eslint no-unused-vars: warn */

const assert = require('assert');
const https = require('https');
const mocha = require('mocha');
const ping = require('ping');
const dns = require('dns');
const { parseArgs } = require('../../utils/argParser');

const dnsPromises = dns.promises;
const { host } = parseArgs();

describe('[integration] Adapter Test', () => {
  context(`Testing network connection on ${host}`, () => {
    after((done) => {
      done();
    });

    it('DNS resolve', (done) => {
      dnsPromises.lookup(host, { all: true })
        .then((result) => {
          try {
            assert.ok(result.length > 0);
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((err) => {
          done(err);
        });
    });

    it('Responds to ping', (done) => {
      ping.promise.probe(host)
        .then((result) => {
          try {
            assert.ok(result.alive);
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((err) => {
          done(err);
        });
    });

    it('Support HTTPS on port 443', (done) => {
      const requestOptions = {
        host,
        port: 443,
        method: 'HEAD'
      };

      const req = https.request(requestOptions, (res) => {
        try {
          assert.ok(res.statusCode >= 200 && res.statusCode < 400);
          done();
        } catch (error) {
          done(error);
        }
      });

      req.on('error', (err) => {
        done(err);
      });

      req.end();
    });

    it('Support IPv4', (done) => {
      const options = {
        family: 4,
        hints: dns.ADDRCONFIG
      };

      dnsPromises.lookup(host, options)
        .then((result) => {
          try {
            const { address, family } = result;
            assert.ok(address !== null && family === 4);
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((err) => {
          done(err);
        });
    });

    it('Support IPv6', (done) => {
      const options = {
        family: 6,
        hints: dns.ADDRCONFIG
      };

      dnsPromises.lookup(host, options)
        .then((result) => {
          try {
            const { address, family } = result;
            assert.ok(address !== null && family === 6);
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
