Checkpoint Adapter
===

This adapter is used to integrate the Itential Platform with the Checkpoint System. The API for Checkpoint is available at [undefined API URL]. The adapter utilizes the Checkpoint API to provide the integrations that are deemed pertinent to the Itential Platform. So it is possible that some integrations are supported through the adapter while other integrations are not.

This Readme file is intended to provide information on this adapter. Itential provides information on all of its product adapters in the Customer Knowledge Base. The information in the Customer Knowledge Base is better maintained and goes through documentation reviews, as a result, it should be the first place to go for information.


## Versioning
Itential Product adapters utilize SemVer for versioning. For the versions available go to the Itential repository.

Your current version can be found in the package.json file or viewed in the Itential Platform GUI on the System page.


## Release History
Any release prior to 1.0.0 is a pre-release.

Release notes can be viewed in CHANGELOG.md or in the Customer Knowledge Base.


## Adapter Prerequisites
The following is a list of packages that are required for Itential product adapters or custom adapters that have been built utilizing the Itential adapter template.

1. @itential/itential-utils: Required for discovery of other Itential modules
2. @itential/adapter-utils: Library classes for all adapters - includes request handling, connection, throttling, and translation
3. ajv: Required for validation of Schema data including properties and data to and from Checkpoint
4. async-lock: Utilized for locking essential variables in connection and throttling
5. mongodb: Utilized for archiving responses and storage of throttle queue if throttling across multiple Instances
6. querystring: Utilized to convert query filter objects to a url query string
7. uuid: Provides a unique identifier for data being stored in the database
8. fs-extra: This is utilized by the node scripts that come with the adapter and help build and extend the functionality
9. shelljs: This is utilized by the node scripts that come with the adapter and help build and extend the functionality

### Additional Prerequisites for Testing
If you are testing a custom adapter or have testing capabilities on an Itential product adapter, you will need to install these packages as well.
```
mocha
nyc
testdouble
winston
```

## Adapter Properties for Checkpoint
Inside your build's _properties.json_, add the following to the `adapterProps` section:
```
{
    "id": "Adapter-checkpoint",
    "properties": {
        "host": "192.168.9.50",
        "port": 443,
        "version": "",
        "base_path": "/web_api",
        "stub": false,
        "protocol": "https",
        "authentication": {
            "auth_method": "basic user_password",
            "method_type": "POST"
        },
        "healthcheck": {
            "type": "none",
            "hc_method_type": "GET"
        },
        "request": {
            "number_retries": 3,
            "attempt_timeout": 5000,
            "healthcheck_on_timeout": true
        },
        "ssl": {},
        "throttle": {
            "number_pronghorns": 1,
            "sync_async": "sync",
            "max_in_queue": 1000,
            "concurrent_max": 1,
            "avg_runtime": 200
        },
        "proxy": {
            "port": 443,
            "protocol": "http"
        }
    },
    "type": "Checkpoint",
    "groups": [],
    "brokers": []
}
```

## Sample Adapter Properties
This is a sample of what to add to your build's _properties.json_'s `adapterProps` section:
```
  {
    "id": "Test-checkpoint",
    "properties": {
      "host": "system.access.resolved",
      "port": 443,
      "version": "v1",
      "cache_location": "local",
      "stub": false,
      "protocol": "https",
      "authentication": {
        "auth_method": "basic user_password",
        "username": "username",
        "password": "password",
        "auth_field": "header.headers.X-AUTH-TOKEN",
        "auth_field_format": "{token}",
        "token": "token",
        "invalid_token_error": 401,
        "token_timeout": 0,
        "token_cache": "local"
      },
      "healthcheck": {
        "type": "startup",
        "frequency": 300000
      },
      "request": {
        "number_retries": 3,
        "limit_retry_error": 401,
        "failover_codes": [404, 405],
        "attempt_timeout": 5000,
        "healthcheck_on_timeout": false,
        "archiving": false
      },
      "ssl": {
        "enabled": false,
        "accept_invalid_cert": false,
        "ca_file": "",
        "secure_protocol": "",
        "ciphers": ""
      },
      "throttle": {
        "throttle_enabled": false,
        "number_pronghorns": 1,
        "sync_async": "sync",
        "max_in_queue": 1000,
        "concurrent_max": 1,
        "expire_timeout": 0,
        "avg_runtime": 200
      },
      "proxy": {
        "enabled": false,
        "host": "localhost",
        "port": 9999,
        "protocol": "http"
      }
    },
    "type": "Checkpoint"
  }
```
The properties are described below but it is very important to set the host, port, authentication and protocol appropriately.

This information is used for several different purposes --
The host, port, and part of the authentication are required. They are used to connect to Checkpoint upon the adapter initially coming up. Depending on the method of authenticating with Checkpoint you will not need all of the properties within the authentication (see more below). A connectivity check tells the Itential Platform the adapter has loaded successfully. The healthcheck defines the API and properties of the healthcheck which will run to tell the adapter that it can reach Checkpoint.

The **host** and **port** are for the Checkpoint. The host can be a fully qualified domain name or an ip address. The **version** is used to set a global version for action endpoints. This makes it faster to update the adapter when endpoints change. The **cache_location** can be used to define where the adapter cache is located. The cache is used to maintain an entity list to improve performance. Storage locally is gone when the adapter is restarted while storage in redis survives an adapter restart. The **stub** property is optional, it indicates whether the stub should be run instead of making calls to Checkpoint (very useful during basic testing). The default is false which means connect to Checkpoint. The **protocol** property is also optional, it tells the adapter whether to use http or https (http is the default).

The authentication section defines properties of the authentication process to Checkpoint. There are many systems and they all seem to authenticate differently. So to support this the authentication system properties have been established. The **auth\_method** is used to define the type of authentication currently supported. Currently supported authentication methods are: "basic user\_password", "static\_token", "request\_token", "no\_authentication". **Username** and **password** are the user and password that will be used to authenticate with Checkpoint either on every request or when pulling a token that will be used in subsequent requests. The **auth\_field** defines what field in the requests the authentication (e.g. token are basic auth credentials) needs to be placed into for those calls to work. The **auth\_field\_format** defines the format of the auth\_field. Some examples of authentication field format include:
```
   1) "{token}",
   2) "Token {token}",
   3) "{username}:{password}",
   4) "Basic {b64}{username}:{password}{/b64}"
```
Items in {} are special and inform the adapter to do something prior to sending the data. It may be to replace the item with a value or it may be to encode the item. **Token** defines a static token that can be used on all requests, it is only used with static\_token as an auth\_method. The **invalid\_token\_error** defines the error we will receive when the token is invalid. This tells the adapter to pull a new token and retry the request. The **token\_timeout** is a way to tell the adapter when the dynamic token is no longer valid for the user and then the adapter will have to pull a new token. If the token\_timeout is set to -1, the adapter will pull a token on every request to Checkpoint. If the timeout\_token is 0, the adapter will pull the expiration from the token request and use that to determine when the token is no longer valid. The **token\_cache** is used to determine where the token should be stored (local memory or in redis). The remaining fields are not necessary when you define the getToken action and schemas in the .system entity.

The healthcheck section defines properties related to performing healthchecks on Checkpoint. There are currently three **type(s)** of healthchecks:
```
    1) none
    2) startup - only runs a healthcheck on startup
    3) intermittent - will run the healthcheck at the provided frequency.
```
Setting the healthcheck to none is not recommended as it will mean that the adapter never runs a check on Checkpoint so there is no may to tell before making a request whether the adapter can talk to Checkpoint. Setting the type to startup will tell the adapter that it should check for connectivity when it first comes up but it will not check after that. Setting the type to intermittent means that the adapter will check connectivity to Checkpoint at the frequency defined in the **frequency** property.

The request section defines properties to help handle requests. The **number\_retries** tells the adapter how many times to retry a request that has either aborted or taken the limit error before giving up and returning an error. The **limit\_retry\_error** is http error status number which defines that no capacity was available and thus after waiting a short interval the adapter can retry the request. It is optional and defaults to 0. The **failover\_codes** are an array of error codes for which the adapter will send back a failover flag to the Itential Platform so that the Platform can attempt the action in another adapter. The **attempt\_timeout** is how long the adapter should wait before aborting the attempt. On abort, the adapter will do one of two things, it will return the error or if **healthcheck\_on\_timeout** is set to true, it will back off the requests and run a Healthcheck until it re-establishes connectivity to Checkpoint and then will re-attempt the request that aborted. The attempt\_timeout is optional and defaults to 5000 milliseconds. The **archiving** flag is optional and defaults to false. It archives the request, the results and the various times (wait time, Checkpoint time and overall time) in the adapterid\_results collection in Mongo. While archiving might be desireable, before enabling this capability you need to think about how much to archive and develop a strategy for cleaning up the collection in the database so that it does not get too large, especially if the responses are large.

The ssl section defines properties to utilize ssl authentication with Checkpoint. If you require SSL then change the **enabled** flag to true. SSL can work two different ways, you can **accept\_invalid\_certs** (only recommended for lab environments) by setting that flag to true or you can provide a **CA\_file**. If SSL is enabled and the accept invalid certifications is false, then the CA\_file is required! You can also specify the **secure\_protocol** for SSL (e.g. SSLv3_method). It also allows you to specify SSL **ciphers** to use.

The throttle section is all about throttling the requests to Checkpoint. All of the properties in this section are optional. Throttle **enabled** defaults to false and simply states whether the adapter should use throttling or not. **Number\_pronghorns** defaults to 1 and states whether the throttling is being done in a single Itential instance or whether requests are being throttled across multiple Itential instances. This is an important property for performance enhancements. Throttling in a single Itential instance uses an in-memory queue so there is less overhead. Throttling across multiple Itential Platforms requires putting the request and queue information into a shared resource (e.g. database) so that each Instance can determine what is running and what is next to run. This requires additional IO overhead. **Sync-async** is not used at the current time (it is for future expansion of the throttling engine). **Max\_in\_queue** represents the maximum number of requests that the adapter should allow into the queue before rejecting requests. This is not necessary a limit on what the adapter can handle but more about timely responses to the requests. The default is currently 1000. **Concurrent\_max** defines the number of request that the adapter can send to Checkpoint at one time. The default is 1 meaning each request must be sent to Checkpoint in a serial manner. **Expire_timeout** defaults to 0. This is a graceful timeout of the request session. Meaning that after the request has completed, the adapter will wait the additional expire timeout time (in milliseconds) prior to sending in the next request. Finally, **average\_runtime** is an approximate average of how long it takes Checkpoint to handle each request. This is an important number as it has performance implications. If the number is defined too low, it puts extra burden on CPU and memory as the requests will be continually trying to see if they can run. If the number is defined too high, requests may wait longer than they need to before running. The number does not need to be exact but the throttling strategy depends heavily on this number being within reason. If averages range from 50 to 250 milliseconds you might pick an average runtime somewhere in the middle so that when Checkpoint performance is exceptional you might be a little slower than you might like but when it is poor you still run efficiently. the default is 200 milliseconds.

The proxy section defines properties to utilize when the Checkpointis behind a proxy server. When this is the case, set the **enabled** flag to true. You will then need to provide the **host** and **port** for the proxy server. In addition, you will need to provide the **protocol** for the proxy server.


## Installing an Itential Product Adapter

### Incorporate it into Build Process

1. Add the adapter to the pacakges section of your Hearth blueprint.
```
"@itential/adapter-checkpoint": "0.1.0"
```

2. Run the Hearth build process

3. Run the install script to add the adapter properties to Itential Platform and install all adapter dependencies:
```
cd /opt/pronghorn/current/node_modules/\@itential/adapter-checkpoint
node utils/install.js
```

4. Restart the Itential Platform
```
systemctl restart pronghorn
```
If the adapter was built using the adapter-template this was done in step 3 by the install
script.

### Install into an Existing Itential Platform Environment

1. Set up our npm to access the Itential repository
```
npm config set registry https://registry.aws.itential.com/repository/itential/
npm login --registry=https://registry.aws.itential.com/repository/itential/
npm login --registry=https://registry.aws.itential.com/repository/itential-internal/
npm login --registry=https://registry.aws.itential.com/repository/npmjs_official/
```

2. Run npm install of the adapter
```
cd /opt/pronghorn/current
npm install adapter-checkpoint
```

3. Run the install script to add the adapter properties to the Itential Platform and install all adapter dependencies:
```
cd /opt/pronghorn/current/node_modules/\@itential/adapter-checkpoint
node utils/install.js
```

4. Restart the Itential System
```
systemctl restart pronghorn
```


## Installing a Custom Adapter

1. Move the adapter into the Pronghorn node_modules directory.
```
Depending on where your code is located, this process is different.
    Could be a tar, move, untar
    Could be a git clone of a repository
    Could also be a cp -R from a coding directory
Adapter should be placed into: /opt/pronghorn/current/node_modules/\@itential
```

2. Update the adapter properties in Pronghorn:
```
If the adapter was built using the adapter-template -
    cd /opt/pronghorn/current/node_modules/\@itential/adapter-checkpoint
    node utils/install.js

Otherwise,
    Add the properties required for this adapter to the Pronghorn properties file -
    /opt/pronghorn/current/properties.json
```

3. Install the dependencies for the adapter:
```
If the adapter was built using the adapter-template this was done in step 2 by the install
script.

Otherwise,
    cd /opt/pronghorn/current/node_modules/\@itential/adapter-checkpoint
    npm install
```

4. Restart Pronghorn
```
systemctl restart pronghorn
```


## Testing an Itential Product Adapter
Mocha is generally used to test all Itential Product Adapters. There are unit tests as well as integration tests performed. Integration tests can generally be run both standalone by using Mock data and running the adapter in stub mode or integrated. When running integrated, every effort is made to prevent environmental failures but that is still a possibility.

If the test directory has been provided, these tests can be run in the local environment as long as the prerequisite packages have been installed.

For custom adapters, if the same structure is used to build the tests, this process will be the same.

### Unit Testing
Unit Testing includes testing basic adapter functionality as well as error conditions that get triggered in the adapter prior to any integration.
```
npm run test:unit
```

To add new unit tests, edit the test/unit/adapterTestUnit.js file. The tests that are already in this file should provide guidance for adding additional tests.

### Integration Testing - standalone
Standalone Integration Testing requires mock data to be provided with the entities. If this data is not provided, standalone integration testing will fail. When the adapter is set to run in stub mode (setting the stub property to true), the adapter will run through its code up to the point of making the request. It will then retrieve the mock data and return that as if it had received that data as the response from Checkpoint. It will then translate the data so that the adapter can return the expected response to the rest of the Itential Platform. Standalone test is the default integration test.
```
npm run test:integration
```

To add new unit tests, edit the test/integration/adapterTestIntegration.js file. The tests that are already in this file should provide guidance for adding additional tests.

### Integration Testing
Integration Testing requires connectivity to Checkpoint. To run this test you will have to go into the test/integration directory and edit the test script to update the Checkpoint host, port and credentials. In addition, you will have to set stub to false. You may also need to change the timeout depending on the response time from Checkpoint.

It is important to note that the tests have been written as a best effort to make them work in most environments. However, it is possible that there are environmental constraints that could result in some to many test failures. Some examples of possible environmental issues are customizations that have been made within Checkpoint which change order dependencies or required data.
```
after changing the test script to turn stub to false and provide the credentials
npm run test:integration
```

It is important to remember do not check in code with actual credentials to systems.


## Using this Adapter
The adapter.js file contains the calls that the adapter makes available to the rest of the Itential Platform. The API detailed for these calls should be available through JSDOC. This is just a brief summary of the calls.

### Generic Adapter Calls
```
connect()
The connect call is run when the Adapter is first loaded by he Itential Platform. It validates the
properties have been provided correctly.
```
```
healthCheck(callback)
Insures that the adapter can communicate with Checkpoint. The actual call that is used is
defined in the adapter properties.
```
```
encryptProperty(property, technique, callback)
Will take the provided property and technique and return the property encrypted with the technique such that the property can be used in the adapter properties for the credential password so that the password does not have to be in clear text. The adapter will decrypt the property as needed for communications with Checkpoint.
```
```
addEntityCache(entityType, entities, key, callback)
Will take the entities and add the list to the entity cache to expedite performance.
```
```
capabilityResults(results, callback)
Will take the results from a verifyCompatibility and put them in the format to be passed back to the Itential Platform.
```
```
hasEntity(entityType, entityId, callback)
Verifies that this adapter has the specific entity.
```
```
verifyCapability(entityType, actionType, entityId, callback)
Verifies that this adapter can perform the provided action on the specific entity.
```
```
updateEntityCache()
Call to update the entity cache.
```

### Specific Adapter Calls
There are other calls in the adapter.js that are just further examples of how the adapter template works for different systems. You can remove all of these calls and the extra entities and test scripts by running node clean.js in the utils directory.
```
getEntities(entityId, queryParams, addlHeaders, callback)
This call is run to get Entities from Checkpoint. It can get a specific entity if an
entity is provided. It will retrieve all entities that match the queryParams. If no
information is provided, it will return all entities. Additional headers can be provided and
added to the calls based on the needs of individual customers.
```
```
createEntity(entityData, addlHeaders, callback)
This call is run to create an Entity in Checkpoint. The information provided in the
entityData will be used to create the entity. Additional headers can be provided and added
to the calls based on the needs of individual customers.
```
```
updateEntity(entityId, entityData, addlHeaders, callback)
This call is run to update an Entity in Checkpoint. The entityId is required to identify
the entity being updated. The information provided in the entityData will be used to update
the entity. Additional headers can be provided and added to the calls based on the needs of
individual customers.
```
```
deleteEntity(entityId, addlHeaders, callback)
This call is run to delete an Entity in Checkpoint. The entityId is required to identify
the entity being removed. Additional headers can be provided and added to the calls based on
the needs of individual customers.
```


## Troubleshooting this adapter

### Connectivity Issues

1. Ensure the adapter properties are set up correctly
```
Go into the Itential Platform GUI and verify/update the properties
```

2. Ensure that there is connectivity between the Itential Platform Server and Checkpoint Server
```
ping the ip address of Checkpoint server
try telnet to the ip address port of Checkpoint
```

3. Verify the credentials provided for Checkpoint
```
login to Checkpoint using the provided credentials
```

4. Verify the API of the call utilized for Checkpoint Healthcheck
```
Go into the Itential Platform GUI and verify/update the properties
```

### Functional Issues
The logs for this adapter should be located in /var/log/pronghorn. In older releases of the Itential Platform, there is a pronghorn.log file which contains logs for all of the Itential Platform. In newer versions, adapters are logging into their own files.


License & Maintainers
---

### Maintained by:
```
Itential Product Adapters are maintained by the Itential Integrations Development Team.
Custom Adapters are maintained by other sources that should be listed here.
```

### Product License

Itential, LLC proprietary
