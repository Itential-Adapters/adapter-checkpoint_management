# Adapter Utilities

Adapter Utilities is not the same thing as adapter-utils. Adapter Utilities refers to utilities that are provided within each adapter to perform generic functionality to assist with troubleshooting, configuration, and support. Where as adapter-utils is a library used by almost all open source adapters to perform core functionality (translation, communication, authentication, throttling, etc) with the external system.

If the customer is having issues getting the adapter up and running, they may utilize the adapter utilities to help them determine the issues. If the customer moves the adapter endpoint configuration from the file system to the database they will utilize the adapter utilities.


## Definitions

- **IP Workflow**: Defines the adapter method/task that has been provided in the Itential Platform Automation Studio as a task a customer can add to a workflow, this method can also be utilized in other parts of the Itential Platform such as JSON Forms and in other applications.
- **CLI**: How a customer would run the script which has been provided in the package.json on the Itential Platform Server command line.


## Adapter Troubleshooting Utilities

### Run Adapter Healthcheck
- **IP Workflow**: iapRunAdapterHealthcheck
- **CLI**: npm run healthcheck

This utility exposes a way to run the adapter healthcheck “on demand”. This method has no input and simply runs the healthcheck on the existing adapter and returns the results.

#### Input Parameters
There is no input for this call.

#### Operation Flow
The utility performs only one check:
1. **Health Check**: Validates the adapter's health check endpoint.

#### Output
Output format will vary based on whether the call is run from the Itential Platform or the command line. Essentially, the call will return whether the healthcheck was successful or not.

#### Best Practices
1. Run when:
   - Setting up a new adapter instance
   - Experiencing issues with the adapter or external system that are not obvious
   - After making configuration changes
2. Review the results
3. Use CLI for quick checks
4. Use IP Workflow for checking when there is no access to the CLI.
5. Use IP Workflow for automated testing. If adding this task to a "permanent" workflow understand that http(s) adapters are connectionless which means that one calls success has little to do with another calls success or failure. 

### Run Adapter Connectivity
- **IP Workflow**: iapRunAdapterConnectivity
- **CLI**: npm run connectivity

This utility provides the ability to run a connectivity check from the adapter and IP system to the down stream system. It checks things like DNS name resolution, ping, https on the port, etc. This is a nice test to use especially if curl is not available on the IP Server. It utilizes a mocha test that is contained within the adapter integration tests. There is no input required for this call.

#### Input Parameters
There is no input for this call.

#### Operation Flow
The utility performs several connectivity checks:
1. **DNS Resolution**: Validates the hostname for the external system can be resolved
2. **Ping Test**: Validates the external system is pingable, if not it could be that the system does not respond to ping or that it is not reachable.
3. **https to port**: Validates that we can https to the port for the external system. If the external system is http this is not a valid test. If https, then this test failing could mean there is a network issue not allowing the adapter to reach the external system.
4. **ip test**: Validates whether IPv4 and/or IPv6 are supported.

#### Output
Output format will vary based on whether the call is run from the Itential Platform or the command line. Essentially, the call will return the results of several tests. These include whether the host for the external system could be resolved, whether the external system is pingable, whether https to the port is successful, and whether the system supports IPv4 and IPv6.

#### Best Practices
1. Run when:
   - Setting up a new adapter instance
   - Experiencing issues with the adapter or external system that are not obvious
   - After making configuration changes
2. Review the results
3. Use CLI for quick checks
4. Use IP Workflow for checking when there is no access to the CLI. There should be no reason to use this call in any "permanent" workflows.

### Basic Get
- **IP Workflow**: iapRunAdapterBasicGet
- **CLI**: npm run basicget

This utility provides the ability to run get calls from the adapter and IP system to the down stream system. This goes beyond the connectivity check to actually check that authentication, endpoints and other components of the call are valid.  It utilizes a mocha test that is contained within the adapter integration tests. There is no input required for this call.

#### Input Parameters
The utility optionally accepts a single parameter, maxcalls, a number which references how many GET endpoints to test. If it is not provided the default is 5.

#### Operation Flow
The utility performs as many checks as you would like:
1. **Get Call(s) Test**: Validates as many of the *NO INPUT* get calls as you would like. The default number is 5 but you can change this by providing a maxCalls. Changing this will increase the time required for this test to complete. Partial success is often a success as the calls that fail could be the result of permission issues in the external system (e.g. the service account has permissions to do some things but not others).

#### Output
Output format will vary based on whether the call is run from the Itential Platform or the command line. Essentially, the call will returns the results, showing either failure (all tests failed), partial success (some tests succeeded), or success (all tests succeeded).

#### Best Practices
1. Run when:
   - Setting up a new adapter instance
   - Experiencing issues with the adapter or external system that are not obvious
   - After making configuration changes
2. Review the results
3. Use CLI for quick checks
4. Use IP Workflow for checking when there is no access to the CLI. There should be no reason to use this call in any "permanent" workflows.

### Troubleshoot Adapter
- **IP Workflow**: iapTroubleshootAdapter
- **CLI**: npm run troubleshoot

This utility provides the ability to troubleshoot an adapter. It includes comprehensive troubleshooting capabilities for the adapter by combining multiple diagnostic checks into a single operation. It verifies the adapter's connection, health status, and basic functionality. There is no input required for this call.

#### Input Parameters
No input is required from the command line, however the command line is interactive and will allow you to override the default properties taken from the samplePropperties.json file.
From the Itential Platform workflow, the utility optionally accepts a props object with the following structure:
```javascript
{
  connProps: {
    host: 'string',
    base_path: 'string',
    protocol: 'string',
    port: 'number',
    version: 'string'
  },
  healthCheckEndpoint: 'string',
  auth: {
    auth_method: 'string',
    username: 'string',
    password: 'string'
  }
}
```
If no properties are provided, the utility will use the current adapter service instance configuration.

#### Operation Flow
The utility performs three checks in sequence:
1. **Connectivity Check**: Verifies basic network connectivity
2. **Health Check**: Validates the adapter's health check endpoint
3. **Basic GET Operations**: Tests fundamental API operations

#### Output
Returns a result object containing:
- Connectivity test results
- Health check status
- Basic GET operation outcomes
- Any encountered errors or warnings

#### Best Practices
1. Run when:
   - Setting up a new adapter instance
   - Experiencing issues with the adapter or external system that are not obvious
   - After making configuration changes
2. Review all three check results to identify specific issues
3. Use CLI for quick checks: 
4. Use IP Workflow for checking when there is no access to the CLI. There should be no reason to use this call in any "permanent" workflows.

### Lint
- **IP Workflow**: iapRunAdapterLint
- **CLI**: npm run lint:errors

This utility provides the results of linting the adapter. This will be success if there are no errors or the actual lint errors if there are errors. This call can be helpful after installing an adapter and finding that it did not come up in the Platform. There is no input required for this call.

#### Input Parameters
There is no input for this call.

#### Operation Flow
The utility run lint on the adapter:
1. **Lint Test**: Validates that the adapter lints clean. While lint issues may not impact functionality, clean lint results are desireable and can often eliminate may functional issues. All of the Itential open source adapters are required to lint clean and linting is performed in their pipelines.

#### Output
Output format will vary based on whether the call is run from the Itential Platform or the command line. Essentially, the call will returns the results, showing either success or whatever linting errors it has found. npm run lint:errors will not return any other issues (warnings, etc) making it much easier to see any errors that exist.

#### Best Practices
1. Run when:
   - Setting up a new adapter instance
   - Making customizations to the code (js files) or configuration (json files) of any adapter
2. Review the results
3. Use CLI for quick checks
4. Use IP Workflow for checking when there is no access to the CLI. There should be no reason to use this call in any "permanent" workflows.

### Test
- **IP Workflow**: iapRunAdapterTests
- **CLI**: npm run test

This utility provides the results of running the adapter base unit and unit tests (uses sampleProperties - not actual properties) and returns the results. This will be success if there are no errors or the actual test errors if there are errors. This call can be helpful after installing an adapter and finding that it did not come up in the Platform. There is no input required for this call.

#### Input Parameters
There is no input for this call.

#### Operation Flow
The utility run tests on the adapter:
1. **Test Test**: Validates that the adapter tests clean. Adapters are built with unit and integration tests for every method. Many of these tests check for basic functionality. They can be used to make sure the adapter was installed properly (including dependencies). All of the Itential open source adapters are required to test clean and testing is performed in their pipelines.

#### Output
Output format will vary based on whether the call is run from the Itential Platform or the command line. Essentially, the call will returns the results, showing either success or whatever testing errors it has found.

#### Best Practices
1. Run when:
   - Setting up a new adapter instance
   - Making customizations to the code (js files) or configuration (json files) of any adapter
2. Review the results
3. Use CLI for quick checks
4. Use IP Workflow for checking when there is no access to the CLI. There should be no reason to use this call in any "permanent" workflows.


## Adapter Configuration & Information Utilities

### Find Adapter Path
- **IP Workflow**: iapFindAdapterPath
- **CLI**: npm run adapter:findpath

This utility provides a way for a customer to check to see if an endpoint is available within an adapter. The customer provides part of the path for the endpoint and this method returns all adapter endpoints that match the criteria. Since adapters can have hundreds of calls, this call pays huge dividends to identify whether a call exists and if it does what the call is. Takes in a path or partial path (e.g. /devices, /network/devices, etc).

#### Input Parameters
The partial path you are attempting to find. If the path has dynamic variables within it, those variables should be replaces with {pathv#} or you should use a partial path that excludes the variables.

#### Operation Flow
The utility checks all of the endpoints that the adapter uses to the external system.

#### Output
Returns all of the endpoints that match the path that was provided. It includes the entity and action where those endpoints are which helps to intentify the call that the customer should use.

#### Best Practices
1. Run when:
   - You are attempting to find if an endpoint exists in an adapter.
2. Review the results
3. Use CLI for quick checks
4. Use IP Workflow for checking when there is no access to the CLI. There should be no reason to use this call in any "permanent" workflows.

### Suspend Adapter
- **IP Workflow**: iapSuspendAdapter
- **CLI**: N/A

This utility provides the ability for an adapter to be put into a suspended state. In this state an adapter can either reject requests or queue those requests until the adapter is activated. This was originally built so that customers could suspend an adapter when it was known that the downstream system would be unavailable (maintenance window, etc) so that workflows would not fail. Takes as input the mode - if the mode is pause the adapter will queue the requests if it is anything else requests will be rejected.

#### Input Parameters
Mode - whether you want the adapter to pause (queue requests) or do nothing (reject all requests)

#### Operation Flow
The utility puts the adapter in a suspended state meaning the adapter will no longer send anything to the external system. This is useful if we know that the external system will be down for maintenance as instead of failing any requests, the adapter can queue requests and send them once the adapter resumes (e.g. is unsuspended). These reequests are stored in the adapter memory so subsequently restarting the adapter will remove all of the items in the queue.

#### Output
The state of the adapter is changed.

#### Best Practices
1. Run when:
   - The external system will be unavailable for some reason (e.g. it is under maintenance)

### Unsuspend Adapter
- **IP Workflow**: iapUnsuspendAdapter
- **CLI**: N/A

This utility provides the ability for an adapter to be made active from a suspended state. If requests were being queued, the adapter will start working down the queue. There is no input required for this call.

#### Input Parameters
There is no input for this call.

#### Operation Flow
The utility will unsuspend (make active) an adapter that has been suspended. When the adapter resumes, if it was paused and queueing requests, the adapter will work down the queue in order to complete all of the requests that had been submitted.

#### Output
The state of the adapter is changed.

#### Best Practices
1. Run when:
   - An adapter was suspended and the external system is available again

### Move Adapter Entities To DB
- **IP Workflow**: iapMoveAdapterEntitiesToDB
- **CLI**: N/A

This utility was created explicitly for SaaS environments. It provides the mechanism to move the adapter endpoint configurations from the entities directory on the file system into a database. The advantage of doing this was so that changes could be made to the adapter endpoint configuration that would persist when the SaaS IP instance was updated or reloaded. There is no input required for this call.

#### Requirements and Prerequisites
- MongoDB connection configuration in the adapter properties
- Valid database permissions to create and write documents
- Proper MongoDB URL format or individual connection properties

#### Configuration Options
The utility supports two ways to configure the MongoDB connection:
1. **URL-based connection**: Using a complete MongoDB URL
   ```json
   {
     "mongo": {
       "url": "mongodb://hostname:port/database"
     }
   }
   ```

2. **Individual properties**: Using separate connection parameters
   ```json
   {
     "mongo": {
       "host": "hostname",
       "port": 27017,
       "database": "dbname",
       "username": "user",
       "password": "pass"
     }
   }
   ```

#### Additional Features
- **Database Override**: Can override the database name specified in the URL
- **SSL Support**: Supports SSL/TLS connections with options for:
  - Certificate validation
  - Custom CA certificates
  - Client certificates
- **Authentication**: Supports various MongoDB authentication mechanisms
- **Replica Sets**: Supports MongoDB replica set configurations

#### Input Parameters
There is no input for this call.

#### Operation Flow
1. The utility will automatically:
   - Read all entities from the filesystem
   - Convert them to the appropriate format
   - Insert them into the specified MongoDB collection
2. Existing documents with the same ID will be overwritten
3. The operation is atomic - all entities are moved together
4. Backup your filesystem entities before running this utility

#### Output
Report whether the moving of the adapter endpoint configuration to the database was successful.

#### Error Handling
The utility handles various error scenarios:
- Missing connection properties
- Invalid URL format
- Authentication failures
- Connection timeouts
- Database write errors

#### Best Practices
1. Always backup configurations before updates
2. Test changes in non-production environment
3. Run when you need to make changes to the adapter endpoint configuration and do not have access to the Itential Platform Server to be able to make changes in the file system or if you are in the Itential SaaS environment and want to persist your adapter endpoint configuration changes.
4. In SaaS it is recommended that you review this with Itential Cloud Ops and the Adapter Team prior to using.

### Update Adapter Configuration
- **IP Workflow**: iapUpdateAdapterConfiguration
- **CLI**: N/A

This utility was created so that customers would not have to make modifications directly into the adapter files on the file system. It was originally built to work on the file system files but was extended to work in the instance when the adapter configuration had been moved to the database as well. This method takes in a lot of information include the name of the config file, the changes, entity and action information as well as a flag to determine whether it is to be appended to contents or replacement for contents.

#### Requirements and Prerequisites
- Valid entity path in the filesystem (required for all updates except package.json)
- Proper filesystem permissions to modify files
- Valid configuration changes that conform to expected schemas
- MongoDB connection configuration (optional, for database synchronization)

#### Configuration Options
The utility supports four types of configuration updates:

1. **Package Updates** (Dependencies Only)
   ```json
   {
     "configFile": "package.json",
     "changes": {
       "dependencies": {
         "package-name": "version"
       }
     }
   }
   ```
   Note: Only package dependencies can be updated. Other package.json fields cannot be modified.
   The adapter will automatically restart after package dependency updates.

2. **Action Updates**
   ```json
   {
     "configFile": "action.json",
     "changes": {
       "name": "actionName",
       "method": "GET",
       "entitypath": "/api/path"
     },
     "entity": "entityName",
     "type": "action",
     "action": "specificAction"
   }
   ```
   Note: The action file must exist in the entity directory.

3. **Schema Updates**
   ```json
   {
     "configFile": "schema.json",
     "changes": {
       "type": "object",
       "properties": {}
     },
     "entity": "entityName",
     "type": "schema"
   }
   ```
   Note: The schema file must exist in the entity directory.

4. **Mock Data Updates**
   ```json
   {
     "configFile": "mockData.json",
     "changes": {
       "key": "value"
     },
     "entity": "entityName",
     "type": "mock",
     "replace": false
   }
   ```
   Note: If the mock data directory doesn't exist, it will be created.

#### Input Parameters
- `configFile`: (Required) Name of the file to update
- `changes`: (Required) Object containing the modifications
- `entity`: (Required for action/schema/mock updates) Target entity name
- `type`: (Required for action/schema/mock updates) Type of update ("action", "schema", or "mock")
- `action`: (Required for action updates) Specific action name
- `replace`: (Required for mock updates) Boolean flag for replacing or merging data

#### Operation Flow
1. For package.json updates:
   - Validates changes contain only dependencies
   - Updates dependencies
   - Restarts adapter

2. For entity-based updates:
   - Validates entity exists in filesystem
   - Validates required parameters based on type
   - Updates filesystem files
   - If MongoDB is configured:
     - Attempts to synchronize changes to database
     - Maintains existing document structure
     - Logs any database operation failures

#### Output
Report whether the configuration changes were successful.

#### Error Handling
The utility returns errors for:
- Missing required parameters
- Non-existent entities
- Missing configuration files (except for mock data)
- Invalid file types
- File system permission issues
- MongoDB synchronization failures (non-blocking)

#### Best Practices
1. Always backup configurations before updates
2. Test changes in non-production environment
3. For mock data:
   - Use replace=false to merge changes
   - Use replace=true to overwrite entirely
4. Monitor logs for both filesystem and MongoDB operation results
5. Expect adapter restart after package dependency updates


## Adapter Support Utilities

### Check Migration Eligible
- **CLI**: node utils/checkMigrate.js

This utility determines three things:
1. Whether the adapter needs to be migrated to the latest adapter foundation. It compares the local adapter-engine version with the latest.
2. Whether a new adapter version needs to be pulled, it compares the current adapter version with the latest.
3. Whether remediation is needed, it compares the local adapter-utils version with the latest.
There is no input required for this call.

#### Input Parameters
There is no input for this call.

#### Operation Flow
The utility checks the state of the adapter to see if it is up to date:
1. **Adapter Test**: Validates that the adapter being used is the latest instance of the open source adapter. If it is out of date, it could be missing calls, capabilities, fixes, have vulnerabilities, etc.
2. **Migration Test**: Validates that the adapter foundation is up to date. This means that it has the ability to perform any and all capabilities that are available in the adapter foundation. Could also address security vulnerabilities that have been reported and fixed.
3. **Renmediation Test**: Validates that the adapter is on the latest adapter-utils version. This means that it has the ability to perform any and all capabilities that are available in the adapter foundation. Could also address bug fixes and security vulnerabilities that have been reported and fixed.

#### Output
Will report if adapter update, migration or remediation are needed.

#### Best Practices
1. Run periodically or when you are having issues with an adapter to verify that you are staying up to date.
2. Review the results
3. There is little to no use for this in SaaS as adapters are kept up to date each month during their release cycles so at most they are <30 days out of date.
