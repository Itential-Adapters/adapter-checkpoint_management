const fs = require('fs-extra');

class MongoUtils {
  /**
     * Parses a MongoDB connection string and extracts its components.
     * @param {string} connectionString - The MongoDB connection string.
     * @returns {object} Parsed connection details.
     */
  static parseConnectionString(connectionString) {
    try {
      const url = new URL(connectionString);
      return {
        protocol: url.protocol.replace(':', ''),
        host: url.hostname,
        port: url.port || '27017',
        database: url.pathname.replace('/', ''),
        username: url.username || null,
        password: url.password || null,
        options: Object.fromEntries(url.searchParams.entries())
      };
    } catch (error) {
      throw new Error(`Invalid MongoDB URI: ${error.message}`);
    }
  }

  /**
     * Generates a MongoDB connection string from given properties.
     * @param {object} config - MongoDB connection properties.
     * @returns {string} A valid MongoDB connection string.
     */
  static generateConnectionString(config) {
    // Determine protocol based on addSrv flag
    const protocol = config.addSrv ? 'mongodb+srv' : 'mongodb';

    // Build authentication part if credentials are provided and dbAuth is true
    const authPart = (config.dbAuth && config.username && config.password)
      ? `${encodeURIComponent(config.username)}:${encodeURIComponent(config.password)}@`
      : '';

    // Build host and port part
    const hostPart = config.host;
    const portPart = !config.addSrv && config.port ? `:${config.port}` : '';

    // Build options part
    let optionsPart = '';
    if (config.options && Object.keys(config.options).length) {
      optionsPart = `?${new URLSearchParams(config.options).toString()}`;
    }

    // Build database part
    const dbPart = config.database ? `/${config.database}` : '';

    return `${protocol}://${authPart}${hostPart}${portPart}${dbPart}${optionsPart}`;
  }

  /**
     * Generates TLS settings for MongoDB connection
     * @param {object} properties - Connection properties containing TLS configuration
     * @returns {object} TLS settings object
     */
  static generateTlsSettings(properties) {
    // Handle TLS properties
    if (properties.tls) {
      return {
        tls: properties.tls.enabled,
        tlsAllowInvalidCertificates: properties.tls.tlsAllowInvalidCertificates || false,
        tlsCAFile: properties.tls.tlsCAFile
      };
    }

    // Handle db_ssl properties (standard adapter format)
    if (!properties.db_ssl) {
      return { tls: false };
    }

    const tlsProperties = {
      tls: properties.db_ssl.enabled || false,
      tlsAllowInvalidCertificates: properties.db_ssl.accept_invalid_cert || false
    };

    const hasValidCaFile = properties.db_ssl.enabled && properties.db_ssl.ca_file && fs.existsSync(properties.db_ssl.ca_file);

    if (hasValidCaFile) {
      tlsProperties.tlsCAFile = properties.db_ssl.ca_file;
    }

    return tlsProperties;
  }

  /**
     * Generates a connection object from properties
     * @param {object} properties - Connection properties
     * @returns {object} Connection object with host, port, database, and credentials
     */
  static generateConnectionObj(properties) {
    try {
      const connectionObj = {
        host: properties.host,
        port: properties.port,
        database: properties.database,
        addSrv: properties.addSrv || false,
        dbAuth: properties.dbAuth || false,
        options: properties.replSet && !properties.addSrv ? { replicaSet: properties.replSet } : undefined
      };

      // Only include credentials if dbAuth is true
      if (properties.dbAuth) {
        // Validate that both username and password are provided when dbAuth is true
        if (!properties.username || !properties.password) {
          throw new Error('Both username and password are required when dbAuth is enabled');
        }
        connectionObj.username = properties.username;
        connectionObj.password = properties.password;
      }

      return connectionObj;
    } catch (error) {
      throw new Error(`Invalid MongoDB configuration: ${error.message}`);
    }
  }

  /**
     * Resolves MongoDB error messages to user-friendly format
     * @param {object} mongoError - The MongoDB error object
     * @returns {string} User-friendly error message
     */
  static resolveMongoError(mongoError) {
    if (mongoError && mongoError.code === 13) {
      return 'User unauthorized to perform the requested action: ';
    }
    if (mongoError && mongoError.code === 18) {
      return `User Authentication failed. Username/Password combination is incorrect ${mongoError}`;
    }
    return mongoError;
  }

  /**
     * Helper function to validate and process MongoDB connection properties
     * @param {Object} mongoProps - MongoDB connection properties to validate
     * @returns {Object|undefined} - Validated and processed MongoDB properties or undefined if invalid
    */
  static getAndValidateMongoProps(mongoProps) {
    if (!mongoProps) return undefined;

    // Handle URL-based connection
    const url = mongoProps.url && mongoProps.url.trim();
    if (!url) {
      // Handle host-based connection
      const hasHost = mongoProps.hostname || mongoProps.host;
      const hasDatabase = mongoProps.database;
      return (hasHost && hasDatabase) ? mongoProps : undefined;
    }

    // Process URL-based connection
    const props = { ...mongoProps };
    const { database } = props;
    const urlHasDatabase = database && url.includes(`/${database}`);
    return urlHasDatabase ? props : { ...props, url: `${url}/${database}` };
  }
}

module.exports = MongoUtils;
