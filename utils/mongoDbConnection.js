// Set globals
/* global log */

const { MongoClient } = require('mongodb');
const MongoUtils = require('./mongoUtils');

class MongoDBConnection {
  constructor(properties) {
    this.properties = properties;
    this.initialize(properties);
  }

  initialize(properties) {
    const {
      url, database, maxPoolSize, appname
    } = properties;

    // Handle URL first - if provided, it takes precedence
    if (url) {
      const urlObj = new URL(url);
      const urlDbName = urlObj.pathname.slice(1);
      this.dbName = database || urlDbName;

      // Update URL if database name is different
      if (this.dbName !== urlDbName) {
        urlObj.pathname = `${this.dbName}`;
      }

      this.url = urlObj.toString();
    } else {
      const connectionObj = MongoUtils.generateConnectionObj(properties);
      this.url = MongoUtils.generateConnectionString(connectionObj);
      this.dbName = database;
    }

    // Set options using generateTlsSettings
    this.options = MongoUtils.generateTlsSettings(properties);

    // Add maxPoolSize if configured
    if (maxPoolSize > 0 && maxPoolSize <= 65535) {
      this.options.maxPoolSize = maxPoolSize;
    }

    // Add application name if provided
    if (appname) {
      this.options.appname = appname;
    }
  }

  async closeConnection() {
    if (this.connection && this.connection.close) {
      try {
        await this.connection.close();
      } catch (err) {
        log.error(`Failed to close MongoDB connection - ${err.message}`);
      }
    }
  }

  async connect() {
    const client = new MongoClient(this.url, this.options);

    client.on('serverHeartbeatSucceeded', (msg) => log.info(`Connection established and heartbeat succeeded - ${JSON.stringify(msg)}`));
    client.on('connectionClosed', (msg) => log.info(`Connection closed - ${JSON.stringify(msg)}`));
    client.on('error', (msg) => log.error(`Connection error - ${JSON.stringify(msg)}`));
    client.on('commandFailed', (msg) => log.error(`Command failed - ${JSON.stringify(msg)}`));
    client.on('serverHeartbeatFailed', (msg) => log.error(`Connection timeout - ${JSON.stringify(msg)}`));

    await client.connect().catch((error) => {
      throw new Error(MongoUtils.resolveMongoError(error));
    });

    this.db = client.db(this.dbName);
    this.connection = client;
    return this;
  }
}

module.exports = MongoDBConnection;
