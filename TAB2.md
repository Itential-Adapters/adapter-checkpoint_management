# Check Point Management

## Table of Contents 

  - [Getting Started](#getting-started)
    - [Helpful Background Information](#helpful-background-information)
    - [Prerequisites](#prerequisites)
    - [How to Install](#how-to-install)
    - [Testing](#testing)
  - [Configuration](#configuration)
    - [Example Properties](#example-properties)
    - [Connection Properties](#connection-properties)
    - [Authentication Properties](#authentication-properties)
    - [Healthcheck Properties](#healthcheck-properties)
    - [Request Properties](#request-properties)
    - [SSL Properties](#ssl-properties)
    - [Throttle Properties](#throttle-properties)
    - [Proxy Properties](#proxy-properties)
    - [Mongo Properties](#mongo-properties)
    - [Device Broker Properties](#device-broker-properties)
  - [Using this Adapter](#using-this-adapter)
    - [Generic Adapter Calls](#generic-adapter-calls)
    - [Adapter Cache Calls](#adapter-cache-calls)
    - [Adapter Broker Calls](#adapter-broker-calls)
    - [Specific Adapter Calls](#specific-adapter-calls)
    - [Authentication](#authentication)
  - [Additional Information](#additional-information)
    - [Enhancements](#enhancements)
    - [Contributing](#contributing)
    - [Helpful Links](#helpful-links)
    - [Node Scripts](#node-scripts)
  - [Troubleshoot](#troubleshoot)
    - [Connectivity Issues](#connectivity-issues)
    - [Functional Issues](#functional-issues)

## Getting Started

These instructions will help you get a copy of the project on your local machine for development and testing. Reading this section is also helpful for deployments as it provides you with pertinent information on prerequisites and properties.

### Helpful Background Information

There is <a href="https://docs.itential.com/opensource/docs/adapters" target="_blank">Adapter documentation available on the Itential Documentation Site</a>. This documentation includes information and examples that are helpful for:

```text
Authentication
IAP Service Instance Configuration
Code Files
Endpoint Configuration (Action & Schema)
Mock Data
Adapter Generic Methods
Headers
Security
Linting and Testing
Build an Adapter
Troubleshooting an Adapter
```

Others will be added over time.
Want to build a new adapter? Use the <a href="https://adapters.itential.io" target="_blank">Itential Adapter Builder</a>

### Prerequisites

The following is a list of required packages for installation on the system the adapter will run on:

```text
Node.js
npm
Git
```

The following list of packages are required for Itential opensource adapters or custom adapters that have been built utilizing the Itential Adapter Builder. You can install these packages by running npm install inside the adapter directory.

<table border="1" class="bordered-table">
  <tr>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Package</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Description</span></th>
  </tr>
  <tr>
    <td style="padding:15px">@itentialopensource/adapter-utils</td>
    <td style="padding:15px">Runtime library classes for all adapters;  includes request handling, connection, authentication throttling, and translation.</td>
  </tr>
  <tr>
    <td style="padding:15px">ajv</td>
    <td style="padding:15px">Required for validation of adapter properties to integrate with Checkpoint_Management.</td>
  </tr>
  <tr>
    <td style="padding:15px">axios</td>
    <td style="padding:15px">Utilized by the node scripts that are included with the adapter; helps to build and extend the functionality.</td>
  </tr>
  <tr>
    <td style="padding:15px">commander</td>
    <td style="padding:15px">Utilized by the node scripts that are included with the adapter; helps to build and extend the functionality.</td>
  </tr>
  <tr>
    <td style="padding:15px">dns-lookup-promise</td>
    <td style="padding:15px">Utilized by the node scripts that are included with the adapter; helps to build and extend the functionality.</td>
  </tr>
  <tr>
    <td style="padding:15px">fs-extra</td>
    <td style="padding:15px">Utilized by the node scripts that are included with the adapter; helps to build and extend the functionality.</td>
  </tr>
  <tr>
    <td style="padding:15px">mocha</td>
    <td style="padding:15px">Testing library that is utilized by some of the node scripts that are included with the adapter.</td>
  </tr>
  <tr>
    <td style="padding:15px">mocha-param</td>
    <td style="padding:15px">Testing library that is utilized by some of the node scripts that are included with the adapter.</td>
  </tr>
  <tr>
    <td style="padding:15px">mongodb</td>
    <td style="padding:15px">Utilized by the node scripts that are included with the adapter; helps to build and extend the functionality.</td>
  </tr>
  <tr>
    <td style="padding:15px">nyc</td>
    <td style="padding:15px">Testing coverage library that is utilized by some of the node scripts that are included with the adapter.</td>
  </tr>
  <tr>
    <td style="padding:15px">ping</td>
    <td style="padding:15px">Utilized by the node scripts that are included with the adapter; helps to build and extend the functionality.</td>
  </tr>
  <tr>
    <td style="padding:15px">readline-sync</td>
    <td style="padding:15px">Utilized by the node script that comes with the adapter;  helps to test unit and integration functionality.</td>
  </tr>
  <tr>
    <td style="padding:15px">semver</td>
    <td style="padding:15px">Utilized by the node scripts that are included with the adapter; helps to build and extend the functionality.</td>
  </tr>
  <tr>
    <td style="padding:15px">winston</td>
    <td style="padding:15px">Utilized by the node scripts that are included with the adapter; helps to build and extend the functionality.</td>
  </tr>
</table>
<br>

If you are developing and testing a custom adapter, or have testing capabilities on an Itential opensource adapter, you will need to install these packages as well.

```text
chai
eslint
eslint-config-airbnb-base
eslint-plugin-import
eslint-plugin-json
testdouble
```

### How to Install

1. Set up the name space location in your IAP node_modules.

```bash
cd /opt/pronghorn/current/node_modules (* could be in a different place)
if the @itentialopensource directory does not exist, create it:
    mkdir @itentialopensource
```

2. Clone/unzip/tar the adapter into your IAP environment.

```bash
cd \@itentialopensource
git clone git@gitlab.com:\@itentialopensource/adapters/adapter-checkpoint_management
or
unzip adapter-checkpoint_management.zip
or
tar -xvf adapter-checkpoint_management.tar
```

3. Run the adapter install script.

```bash
cd adapter-checkpoint_management
npm install
npm run lint:errors
npm run test
```

4. Restart IAP

```bash
systemctl restart pronghorn
```

5. Create an adapter service instance configuration in IAP Admin Essentials GUI

6. Copy the properties from the sampleProperties.json and paste them into the service instance configuration in the inner/second properties field.

7. Change the adapter service instance configuration (host, port, credentials, etc) in IAP Admin Essentials GUI


For an easier install of the adapter use npm run adapter:install, it will install the adapter in IAP. Please note that it can be dependent on where the adapter is installed and on the version of IAP so it is subject to fail. If using this, you can replace step 3-5 above with these:

3. Install adapter dependencies and check the adapter.

```bash
cd adapter-checkpoint_management
npm run adapter:install
```

4. Restart IAP

```bash
systemctl restart pronghorn
```

5. Change the adapter service instance configuration (host, port, credentials, etc) in IAP Admin Essentials GUI


### Testing

Mocha is generally used to test all Itential Opensource Adapters. There are unit tests as well as integration tests performed. Integration tests can generally be run as standalone using mock data and running the adapter in stub mode, or as integrated. When running integrated, every effort is made to prevent environmental failures, however there is still a possibility.

#### Unit Testing

Unit Testing includes testing basic adapter functionality as well as error conditions that are triggered in the adapter prior to any integration. There are two ways to run unit tests. The prefered method is to use the testRunner script; however, both methods are provided here.

```bash
node utils/testRunner --unit

npm run test:unit
npm run test:baseunit
```

To add new unit tests, edit the `test/unit/adapterTestUnit.js` file. The tests that are already in this file should provide guidance for adding additional tests.

#### Integration Testing - Standalone

Standalone Integration Testing requires mock data to be provided with the entities. If this data is not provided, standalone integration testing will fail. When the adapter is set to run in stub mode (setting the stub property to true), the adapter will run through its code up to the point of making the request. It will then retrieve the mock data and return that as if it had received that data as the response from Checkpoint_Management. It will then translate the data so that the adapter can return the expected response to the rest of the Itential software. Standalone is the default integration test.

Similar to unit testing, there are two ways to run integration tests. Using the testRunner script is better because it prevents you from having to edit the test script; it will also resets information after testing is complete so that credentials are not saved in the file.

```bash
node utils/testRunner
  answer no at the first prompt

npm run test:integration
```

To add new integration tests, edit the `test/integration/adapterTestIntegration.js` file. The tests that are already in this file should provide guidance for adding additional tests.

#### Integration Testing

Integration Testing requires connectivity to Checkpoint_Management. By using the testRunner script it prevents you from having to edit the integration test. It also resets the integration test after the test is complete so that credentials are not saved in the file.

> **Note**: These tests have been written as a best effort to make them work in most environments. However, the Adapter Builder often does not have the necessary information that is required to set up valid integration tests. For example, the order of the requests can be very important and data is often required for `creates` and `updates`. Hence, integration tests may have to be enhanced before they will work (integrate) with Checkpoint_Management. Even after tests have been set up properly, it is possible there are environmental constraints that could result in test failures. Some examples of possible environmental issues are customizations that have been made within Checkpoint_Management which change order dependencies or required data.

```bash
node utils/testRunner
answer yes at the first prompt
answer all other questions on connectivity and credentials
```

Test should also be written to clean up after themselves. However, it is important to understand that in some cases this may not be possible. In addition, whenever exceptions occur, test execution may be stopped, which will prevent cleanup actions from running. It is recommended that tests be utilized in dev and test labs only.

> **Reminder**: Do not check in code with actual credentials to systems.

## Configuration

This section defines **all** the properties that are available for the adapter, including detailed information on what each property is for. If you are not using certain capabilities with this adapter, you do not need to define all of the properties. An example of how the properties for this adapter can be used with tests or IAP are provided in the sampleProperties.

### Example Properties

```json
  "properties": {
    "host": "INSERT CHECKPOINT HOST HERE",
    "port": 443,
    "choosepath": "",
    "base_path": "/web_api",
    "version": "",
    "cache_location": "none",
    "encode_pathvars": true,
    "encode_queryvars": true,
    "save_metric": false,
    "stub": true,
    "protocol": "https",
    "authentication": {
      "auth_method": "request_token",
      "username": "INSERT USER NAME HERE",
      "password": "INSERT PASSWORD HERE",
      "token": "",
      "token_user_field": "user",
      "token_password_field": "password",
      "token_result_field": "sid",
      "token_URI_path": "/login",
      "token_timeout": 3600000,
      "token_cache": "local",
      "invalid_token_error": 400,
      "auth_field": "header.headers.x-chkp-sid",
      "auth_field_format": "{token}",
      "auth_logging": false,
      "client_id": "",
      "client_secret": "",
      "grant_type": "",
      "sensitive": [],
      "sso": {
        "protocol": "",
        "host": "",
        "port": 0
      },
      "multiStepAuthCalls": [
        {
          "name": "",
          "requestFields": {},
          "responseFields": {},
          "successfullResponseCode": 200
        }
      ]
    },
    "healthcheck": {
      "type": "startup",
      "frequency": 60000,
      "query_object": {},
      "addlHeaders": {}
    },
    "throttle": {
      "throttle_enabled": false,
      "number_pronghorns": 1,
      "sync_async": "sync",
      "max_in_queue": 1000,
      "concurrent_max": 1,
      "expire_timeout": 0,
      "avg_runtime": 200,
      "priorities": [
        {
          "value": 0,
          "percent": 100
        }
      ]
    },
    "request": {
      "number_redirects": 0,
      "number_retries": 3,
      "limit_retry_error": 0,
      "failover_codes": [],
      "attempt_timeout": 5000,
      "global_request": {
        "payload": {},
        "uriOptions": {},
        "addlHeaders": {},
        "authData": {
          "session-timeout": 3600,
          "domain": "INSERT LOGIN DOMAIN"
        }
      },
      "healthcheck_on_timeout": true,
      "return_raw": false,
      "archiving": false,
      "return_request": false
    },
    "proxy": {
      "enabled": false,
      "host": "",
      "port": 1,
      "protocol": "http",
      "username": "",
      "password": ""
    },
    "ssl": {
      "ecdhCurve": "",
      "enabled": false,
      "accept_invalid_cert": true,
      "ca_file": "",
      "key_file": "",
      "cert_file": "",
      "secure_protocol": "",
      "ciphers": ""
    },
    "mongo": {
      "host": "",
      "port": 0,
      "database": "",
      "username": "",
      "password": "",
      "replSet": "",
      "db_ssl": {
        "enabled": false,
        "accept_invalid_cert": false,
        "ca_file": "",
        "key_file": "",
        "cert_file": ""
      }
    },
    "devicebroker": {
      "enabled": true,
      "getDevice": [
        {
          "path": "/show-simple-gateway",
          "method": "POST",
          "query": {},
          "body": {
            "uid": "{uid}"
          },
          "headers": {},
          "handleFailure": "ignore",
          "requestFields": {
            "uid": "{uid}"
          },
          "responseDatakey": "",
          "responseFields": {
            "name": "{name}",
            "ostype": "{type}",
            "ostypePrefix": "chkpt-",
            "ipaddress": "{ipv4-address}",
            "port": "n/a"
          }
        },
        {
          "path": "/show-lsm-gateway",
          "method": "POST",
          "query": {},
          "body": {
            "uid": "{uid}"
          },
          "headers": {},
          "handleFailure": "ignore",
          "requestFields": {
            "uid": "{uid}"
          },
          "responseDatakey": "",
          "responseFields": {
            "name": "{name}",
            "ostype": "{type}",
            "ostypePrefix": "chkpt-",
            "ipaddress": "{ipv4-address}",
            "port": "n/a"
          }
        }
      ],
      "getDevicesFiltered": [
        {
          "path": "/show-gateways-and-servers",
          "method": "POST",
          "pagination": {
            "offsetVar": "offset",
            "limitVar": "limit",
            "incrementBy": "limit",
            "requestLocation": "body"
          },
          "query": {},
          "body": {
            "offset": "0",
            "limit": "500"
          },
          "headers": {},
          "handleFailure": "ignore",
          "requestFields": {},
          "responseDatakey": "",
          "responseFields": {
            "name": "{name}",
            "ostype": "{type}",
            "ostypePrefix": "chkpt-",
            "ipaddress": "n/a",
            "port": "n/a",
            "uid": "{uid}"
          }
        }
      ],
      "isAlive": [
        {
          "path": "/show-simple-gateway",
          "method": "POST",
          "query": {},
          "body": {
            "uid": "{uid}"
          },
          "headers": {},
          "handleFailure": "ignore",
          "requestFields": {
            "uid": "{uid}"
          },
          "responseDatakey": "meta-info",
          "responseFields": {
            "status": "{validation-state}",
            "statusValue": "ok"
          }
        },
        {
          "path": "/show-lsm-gateway",
          "method": "POST",
          "query": {},
          "body": {
            "uid": "{uid}"
          },
          "headers": {},
          "handleFailure": "ignore",
          "requestFields": {
            "uid": "{uid}"
          },
          "responseDatakey": "meta-info",
          "responseFields": {
            "status": "{validation-state}",
            "statusValue": "ok"
          }
        }
      ],
      "getConfig": [
        {
          "path": "/show-simple-gateway",
          "method": "POST",
          "query": {},
          "body": {
            "uid": "{uid}"
          },
          "headers": {},
          "handleFailure": "ignore",
          "requestFields": {
            "uid": "{uid}"
          },
          "responseDatakey": "",
          "responseFields": {}
        },
        {
          "path": "/show-lsm-gateway",
          "method": "POST",
          "query": {},
          "body": {
            "uid": "{uid}"
          },
          "headers": {},
          "handleFailure": "ignore",
          "requestFields": {
            "uid": "{uid}"
          },
          "responseDatakey": "",
          "responseFields": {}
        }
      ],
      "getCount": [
        {
          "path": "/show-gateways-and-servers",
          "method": "POST",
          "query": {},
          "body": {
            "offset": "0",
            "limit": "500"
          },
          "headers": {},
          "handleFailure": "ignore",
          "requestFields": {},
          "responseDatakey": "",
          "responseFields": {}
        }
      ]
    },
    "cache": {
      "enabled": false,
      "entities": [
        {
          "entityType": "device",
          "frequency": 3600,
          "flushOnFail": false,
          "limit": 1000,
          "retryAttempts": 5,
          "sort": true,
          "populate": [
            {
              "path": "/show-gateways-and-servers",
              "method": "POST",
              "pagination": {
                "offsetVar": "offset",
                "limitVar": "limit",
                "incrementBy": "limit",
                "requestLocation": "body"
              },
              "query": {},
              "body": {
                "offset": "0",
                "limit": "500"
              },
              "headers": {},
              "handleFailure": "ignore",
              "requestFields": {},
              "responseDatakey": "",
              "responseFields": {
                "name": "{name}",
                "ostype": "{type}",
                "ostypePrefix": "chkpt-",
                "ipaddress": "n/a",
                "port": "n/a",
                "uid": "{uid}"
              }
            }
          ],
          "cachedTasks": [
            {
              "name": "",
              "filterField": "",
              "filterLoc": ""
            }
          ]
        }
      ]
    }
  }
```

### Connection Properties

These base properties are used to connect to Checkpoint_Management upon the adapter initially coming up. It is important to set these properties appropriately.

<table border="1" class="bordered-table">
  <tr>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Property</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Description</span></th>
  </tr>
  <tr>
    <td style="padding:15px">host</td>
    <td style="padding:15px">Required. A fully qualified domain name or IP address.</td>
  </tr>
  <tr>
    <td style="padding:15px">port</td>
    <td style="padding:15px">Required. Used to connect to the server.</td>
  </tr>
  <tr>
    <td style="padding:15px">base_path</td>
    <td style="padding:15px">Optional. Used to define part of a path that is consistent for all or most endpoints. It makes the URIs easier to use and maintain but can be overridden on individual calls. An example **base_path** might be `/rest/api`. Default is ``.</td>
  </tr>
  <tr>
    <td style="padding:15px">version</td>
    <td style="padding:15px">Optional. Used to set a global version for action endpoints. This makes it faster to update the adapter when endpoints change. As with the base-path, version can be overridden on individual endpoints. Default is ``.</td>
  </tr>
  <tr>
    <td style="padding:15px">cache_location</td>
    <td style="padding:15px">Optional. Used to define where the adapter cache is located. The cache is used to maintain an entity list to improve performance. Storage locally is lost when the adapter is restarted. Storage in Redis is preserved upon adapter restart. Default is none which means no caching of the entity list.</td>
  </tr>
  <tr>
    <td style="padding:15px">encode_pathvars</td>
    <td style="padding:15px">Optional. Used to tell the adapter to encode path variables or not. The default behavior is to encode them so this property can be used to stop that behavior.</td>
  </tr>
  <tr>
    <td style="padding:15px">encode_queryvars</td>
    <td style="padding:15px">Optional. Used to tell the adapter to encode query parameters or not. The default behavior is to encode them so this property can be used to stop that behavior.</td>
  </tr>
  <tr>
    <td style="padding:15px">save_metric</td>
    <td style="padding:15px">Optional. Used to tell the adapter to save metric information (this does not impact metrics returned on calls). This allows the adapter to gather metrics over time. Metric data can be stored in a database or on the file system.</td>
  </tr>
  <tr>
    <td style="padding:15px">stub</td>
    <td style="padding:15px">Optional. Indicates whether the stub should run instead of making calls to Checkpoint_Management (very useful during basic testing). Default is false (which means connect to Checkpoint_Management).</td>
  </tr>
  <tr>
    <td style="padding:15px">protocol</td>
    <td style="padding:15px">Optional. Notifies the adapter whether to use HTTP or HTTPS. Default is HTTP.</td>
  </tr>
</table>
<br>

A connectivity check tells IAP the adapter has loaded successfully.

### Authentication Properties

The following properties are used to define the authentication process to Checkpoint_Management.

>**Note**: Depending on the method that is used to authenticate with Checkpoint_Management, you may not need to set all of the authentication properties.

<table border="1" class="bordered-table">
  <tr>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Property</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Description</span></th>
  </tr>
  <tr>
    <td style="padding:15px">auth_method</td>
    <td style="padding:15px">Required. Used to define the type of authentication currently supported. Authentication methods currently supported are: `basic user_password`, `static_token`, `request_token`, and `no_authentication`.</td>
  </tr>
  <tr>
    <td style="padding:15px">username</td>
    <td style="padding:15px">Used to authenticate with Checkpoint_Management on every request or when pulling a token that will be used in subsequent requests.</td>
  </tr>
  <tr>
    <td style="padding:15px">password</td>
    <td style="padding:15px">Used to authenticate with Checkpoint_Management on every request or when pulling a token that will be used in subsequent requests.</td>
  </tr>
  <tr>
    <td style="padding:15px">token</td>
    <td style="padding:15px">Defines a static token that can be used on all requests. Only used with `static_token` as an authentication method (auth\_method).</td>
  </tr>
  <tr>
    <td style="padding:15px">invalid_token_error</td>
    <td style="padding:15px">Defines the HTTP error that is received when the token is invalid. Notifies the adapter to pull a new token and retry the request. Default is 401.</td>
  </tr>
  <tr>
    <td style="padding:15px">token_timeout</td>
    <td style="padding:15px">Defines how long a token is valid. Measured in milliseconds. Once a dynamic token is no longer valid, the adapter has to pull a new token. If the token_timeout is set to -1, the adapter will pull a token on every request to Checkpoint_Management. If the timeout_token is 0, the adapter will use the expiration from the token response to determine when the token is no longer valid.</td>
  </tr>
  <tr>
    <td style="padding:15px">token_cache</td>
    <td style="padding:15px">Used to determine where the token should be stored (local memory or in Redis).</td>
  </tr>
  <tr>
    <td style="padding:15px">auth_field</td>
    <td style="padding:15px">Defines the request field the authentication (e.g., token are basic auth credentials) needs to be placed in order for the calls to work.</td>
  </tr>
  <tr>
    <td style="padding:15px">auth_field_format</td>
    <td style="padding:15px">Defines the format of the auth\_field. See examples below. Items enclosed in {} inform the adapter to perofrm an action prior to sending the data. It may be to replace the item with a value or it may be to encode the item.</td>
  </tr>
  <tr>
    <td style="padding:15px">auth_logging</td>
    <td style="padding:15px">Setting this true will add some additional logs but this should only be done when trying to debug an issue as certain credential information may be logged out when this is true.</td>
  </tr>
  <tr>
    <td style="padding:15px">client_id</td>
    <td style="padding:15px">Provide a client id when needed, this is common on some types of OAuth.</td>
  </tr>
  <tr>
    <td style="padding:15px">client_secret</td>
    <td style="padding:15px">Provide a client secret when needed, this is common on some types of OAuth.</td>
  </tr>
  <tr>
    <td style="padding:15px">grant_type</td>
    <td style="padding:15px">Provide a grant type when needed, this is common on some types of OAuth.</td>
  </tr>
</table>
<br>

#### Examples of authentication field format

```json
"{token}"
"Token {token}"
"{username}:{password}"
"Basic {b64}{username}:{password}{/b64}"
```

### Healthcheck Properties

The healthcheck properties defines the API that runs the healthcheck to tell the adapter that it can reach Checkpoint_Management. There are currently three types of healthchecks.

- None - Not recommended. Adapter will not run a healthcheck. Consequently, unable to determine before making a request if the adapter can reach Checkpoint_Management.
- Startup - Adapter will check for connectivity when the adapter initially comes up, but it will not check afterwards.
- Intermittent - Adapter will check connectivity to Checkpoint_Management at a frequency defined in the `frequency` property.

<table border="1" class="bordered-table">
  <tr>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Property</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Description</span></th>
  </tr>
  <tr>
    <td style="padding:15px">type</td>
    <td style="padding:15px">Required. The type of health check to run.</td>
  </tr>
  <tr>
    <td style="padding:15px">frequency</td>
    <td style="padding:15px">Required if intermittent. Defines how often the health check should run. Measured in milliseconds. Default is 300000.</td>
  </tr>
  <tr>
    <td style="padding:15px">query_object</td>
    <td style="padding:15px">Query parameters to be added to the adapter healthcheck call.</td>
  </tr>
</table>
<br>

### Request Properties

The request section defines properties to help handle requests.

<table border="1" class="bordered-table">
  <tr>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Property</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Description</span></th>
  </tr>
  <tr>
    <td style="padding:15px">number_redirects</td>
    <td style="padding:15px">Optional. Tells the adapter that the request may be redirected and gives it a maximum number of redirects to allow before returning an error. Default is 0 - no redirects.</td>
  </tr>
  <tr>
    <td style="padding:15px">number_retries</td>
    <td style="padding:15px">Tells the adapter how many times to retry a request that has either aborted or reached a limit error before giving up and returning an error.</td>
  </tr>
  <tr>
    <td style="padding:15px">limit_retry_error</td>
    <td style="padding:15px">Optional. Can be either an integer or an array. Indicates the http error status number to define that no capacity was available and, after waiting a short interval, the adapter can retry the request. If an array is provvided, the array can contain integers or strings. Strings in the array are used to define ranges (e.g. "502-506"). Default is [0].</td>
  </tr>
  <tr>
    <td style="padding:15px">failover_codes</td>
    <td style="padding:15px">An array of error codes for which the adapter will send back a failover flag to IAP so that the Platform can attempt the action in another adapter.</td>
  </tr>
  <tr>
    <td style="padding:15px">attempt_timeout</td>
    <td style="padding:15px">Optional. Tells how long the adapter should wait before aborting the attempt. On abort, the adapter will do one of two things: 1) return the error; or 2) if **healthcheck\_on\_timeout** is set to true, it will abort the request and run a Healthcheck until it re-establishes connectivity to Checkpoint_Management, and then will re-attempt the request that aborted. Default is 5000 milliseconds.</td>
  </tr>
  <tr>
    <td style="padding:15px">global_request</td>
    <td style="padding:15px">Optional. This is information that the adapter can include in all requests to the other system. This is easier to define and maintain than adding this information in either the code (adapter.js) or the action files.</td>
  </tr>
  <tr>
    <td style="padding:15px">global_request -> payload</td>
    <td style="padding:15px">Optional. Defines any information that should be included on all requests sent to the other system that have a payload/body.</td>
  </tr>
  <tr>
    <td style="padding:15px">global_request -> uriOptions</td>
    <td style="padding:15px">Optional. Defines any information that should be sent as untranslated  query options (e.g. page, size) on all requests to the other system.</td>
  </tr>
  <tr>
    <td style="padding:15px">global_request -> addlHeaders</td>
    <td style="padding:15px">Optioonal. Defines any headers that should be sent on all requests to the other system.</td>
  </tr>
  <tr>
    <td style="padding:15px">global_request -> authData</td>
    <td style="padding:15px">Optional. Defines any additional authentication data used to authentice with the other system. This authData needs to be consistent on every request.</td>
  </tr>
  <tr>
    <td style="padding:15px">healthcheck_on_timeout</td>
    <td style="padding:15px">Required. Defines if the adapter should run a health check on timeout. If set to true, the adapter will abort the request and run a health check until it re-establishes connectivity and then it will re-attempt the request.</td>
  </tr>
  <tr>
    <td style="padding:15px">return_raw</td>
    <td style="padding:15px">Optional. Tells the adapter whether the raw response should be returned as well as the IAP response. This is helpful when running integration tests to save mock data. It does add overhead to the response object so it is not ideal from production.</td>
  </tr>
  <tr>
    <td style="padding:15px">archiving</td>
    <td style="padding:15px">Optional flag. Default is false. It archives the request, the results and the various times (wait time, Checkpoint_Management time and overall time) in the `adapterid_results` collection in MongoDB. Although archiving might be desirable, be sure to develop a strategy before enabling this capability. Consider how much to archive and what strategy to use for cleaning up the collection in the database so that it does not become too large, especially if the responses are large.</td>
  </tr>
  <tr>
    <td style="padding:15px">return_request</td>
    <td style="padding:15px">Optional flag. Default is false. Will return the actual request that is made including headers. This should only be used during debugging issues as there could be credentials in the actual request.</td>
  </tr>
</table>
<br>

### SSL Properties

The SSL section defines the properties utilized for ssl authentication with Checkpoint_Management. SSL can work two different ways: set the `accept\_invalid\_certs` flag to true (only recommended for lab environments), or provide a `ca\_file`.

<table border="1" class="bordered-table">
  <tr>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Property</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Description</span></th>
  </tr>
  <tr>
    <td style="padding:15px">enabled</td>
    <td style="padding:15px">If SSL is required, set to true.</td>
  </tr>
  <tr>
    <td style="padding:15px">accept_invalid_certs</td>
    <td style="padding:15px">Defines if the adapter should accept invalid certificates (only recommended for lab environments). Required if SSL is enabled. Default is false.</td>
  </tr>
  <tr>
    <td style="padding:15px">ca_file</td>
    <td style="padding:15px">Defines the path name to the CA file used for SSL. If SSL is enabled and the accept invalid certifications is false, then ca_file is required.</td>
  </tr>
  <tr>
    <td style="padding:15px">key_file</td>
    <td style="padding:15px">Defines the path name to the Key file used for SSL. The key_file may be needed for some systems but it is not required for SSL.</td>
  </tr>
  <tr>
    <td style="padding:15px">cert_file</td>
    <td style="padding:15px">Defines the path name to the Certificate file used for SSL. The cert_file may be needed for some systems but it is not required for SSL.</td>
  </tr>
  <tr>
    <td style="padding:15px">secure_protocol</td>
    <td style="padding:15px">Defines the protocol (e.g., SSLv3_method) to use on the SSL request.</td>
  </tr>
  <tr>
    <td style="padding:15px">ciphers</td>
    <td style="padding:15px">Required if SSL enabled. Specifies a list of SSL ciphers to use.</td>
  </tr>
  <tr>
    <td style="padding:15px">ecdhCurve</td>
    <td style="padding:15px">During testing on some Node 8 environments, you need to set `ecdhCurve` to auto. If you do not, you will receive PROTO errors when attempting the calls. This is the only usage of this property and to our knowledge it only impacts Node 8 and 9.</td>
  </tr>
</table>
<br>

### Throttle Properties

The throttle section is used when requests to Checkpoint_Management must be queued (throttled). All of the properties in this section are optional.

<table border="1" class="bordered-table">
  <tr>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Property</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Description</span></th>
  </tr>
  <tr>
    <td style="padding:15px">throttle_enabled</td>
    <td style="padding:15px">Default is false. Defines if the adapter should use throttling or not.</td>
  </tr>
  <tr>
    <td style="padding:15px">number_pronghorns</td>
    <td style="padding:15px">Default is 1. Defines if throttling is done in a single Itential instance or whether requests are being throttled across multiple Itential instances (minimum = 1, maximum = 20). Throttling in a single Itential instance uses an in-memory queue so there is less overhead. Throttling across multiple Itential instances requires placing the request and queue information into a shared resource (e.g. database) so that each instance can determine what is running and what is next to run. Throttling across multiple instances requires additional I/O overhead.</td>
  </tr>
  <tr>
    <td style="padding:15px">sync-async</td>
    <td style="padding:15px">This property is not used at the current time (it is for future expansion of the throttling engine).</td>
  </tr>
  <tr>
    <td style="padding:15px">max_in_queue</td>
    <td style="padding:15px">Represents the maximum number of requests the adapter should allow into the queue before rejecting requests (minimum = 1, maximum = 5000). This is not a limit on what the adapter can handle but more about timely responses to requests. The default is currently 1000.</td>
  </tr>
  <tr>
    <td style="padding:15px">concurrent_max</td>
    <td style="padding:15px">Defines the number of requests the adapter can send to Checkpoint_Management at one time (minimum = 1, maximum = 1000). The default is 1 meaning each request must be sent to Checkpoint_Management in a serial manner.</td>
  </tr>
  <tr>
    <td style="padding:15px">expire_timeout</td>
    <td style="padding:15px">Default is 0. Defines a graceful timeout of the request session. After a request has completed, the adapter will wait additional time prior to sending the next request. Measured in milliseconds (minimum = 0, maximum = 60000).</td>
  </tr>
  <tr>
    <td style="padding:15px">average_runtime</td>
    <td style="padding:15px">Represents the approximate average of how long it takes Checkpoint_Management to handle each request. Measured in milliseconds (minimum = 50, maximum = 60000). Default is 200. This metric has performance implications. If the runtime number is set too low, it puts extra burden on the CPU and memory as the requests will continually try to run. If the runtime number is set too high, requests may wait longer than they need to before running. The number does not need to be exact but your throttling strategy depends heavily on this number being within reason. If averages range from 50 to 250 milliseconds you might pick an average run-time somewhere in the middle so that when Checkpoint_Management performance is exceptional you might run a little slower than you might like, but when it is poor you still run efficiently.</td>
  </tr>
  <tr>
    <td style="padding:15px">priorities</td>
    <td style="padding:15px">An array of priorities and how to handle them in relation to the throttle queue. Array of objects that include priority value and percent of queue to put the item ex { value: 1, percent: 10 }</td>
  </tr>
</table>
<br>

### Proxy Properties

The proxy section defines the properties to utilize when Checkpoint_Management is behind a proxy server.

<table border="1" class="bordered-table">
  <tr>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Property</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Description</span></th>
  </tr>
  <tr>
    <td style="padding:15px">enabled</td>
    <td style="padding:15px">Required. Default is false. If Checkpoint_Management is behind a proxy server, set enabled flag to true.</td>
  </tr>
  <tr>
    <td style="padding:15px">host</td>
    <td style="padding:15px">Host information for the proxy server. Required if `enabled` is true.</td>
  </tr>
  <tr>
    <td style="padding:15px">port</td>
    <td style="padding:15px">Port information for the proxy server. Required if `enabled` is true.</td>
  </tr>
  <tr>
    <td style="padding:15px">protocol</td>
    <td style="padding:15px">The protocol (i.e., http, https, etc.) used to connect to the proxy. Default is http.</td>
  </tr>
  <tr>
    <td style="padding:15px">username</td>
    <td style="padding:15px">If there is authentication for the proxy, provide the username here.</td>
  </tr>
  <tr>
    <td style="padding:15px">password</td>
    <td style="padding:15px">If there is authentication for the proxy, provide the password here.</td>
  </tr>
</table>
<br>

### Mongo Properties

The mongo section defines the properties used to connect to a Mongo database. Mongo can be used for throttling as well as to persist metric data. If not provided, metrics will be stored in the file system.

<table border="1" class="bordered-table">
  <tr>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Property</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Description</span></th>
  </tr>
  <tr>
    <td style="padding:15px">host</td>
    <td style="padding:15px">Optional. Host information for the mongo server.</td>
  </tr>
  <tr>
    <td style="padding:15px">port</td>
    <td style="padding:15px">Optional. Port information for the mongo server.</td>
  </tr>
  <tr>
    <td style="padding:15px">database</td>
    <td style="padding:15px">Optional. The database for the adapter to use for its data.</td>
  </tr>
  <tr>
    <td style="padding:15px">username</td>
    <td style="padding:15px">Optional. If credentials are required to access mongo, this is the user to login as.</td>
  </tr>
  <tr>
    <td style="padding:15px">password</td>
    <td style="padding:15px">Optional. If credentials are required to access mongo, this is the password to login with.</td>
  </tr>
  <tr>
    <td style="padding:15px">replSet</td>
    <td style="padding:15px">Optional. If the database is set up to use replica sets, define it here so it can be added to the database connection.</td>
  </tr>
  <tr>
    <td style="padding:15px">db_ssl</td>
    <td style="padding:15px">Optional. Contains information for SSL connectivity to the database.</td>
  </tr>
  <tr>
    <td style="padding:15px">db_ssl -> enabled</td>
    <td style="padding:15px">If SSL is required, set to true.</td>
  </tr>
  <tr>
    <td style="padding:15px">db_ssl -> accept_invalid_cert</td>
    <td style="padding:15px">Defines if the adapter should accept invalid certificates (only recommended for lab environments). Required if SSL is enabled. Default is false.</td>
  </tr>
  <tr>
    <td style="padding:15px">db_ssl -> ca_file</td>
    <td style="padding:15px">Defines the path name to the CA file used for SSL. If SSL is enabled and the accept invalid certifications is false, then ca_file is required.</td>
  </tr>
  <tr>
    <td style="padding:15px">db_ssl -> key_file</td>
    <td style="padding:15px">Defines the path name to the Key file used for SSL. The key_file may be needed for some systems but it is not required for SSL.</td>
  </tr>
  <tr>
    <td style="padding:15px">db_ssl -> cert_file</td>
    <td style="padding:15px">Defines the path name to the Certificate file used for SSL. The cert_file may be needed for some systems but it is not required for SSL.</td>
  </tr>
</table>
<br>

### Device Broker Properties

The device broker section defines the properties used integrate Checkpoint_Management to the device broker. Each broker call is represented and has an array of calls that can be used to build the response. This describes the calls and then the fields which are available in the calls.

<table border="1" class="bordered-table">
  <tr>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Property</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Description</span></th>
  </tr>
  <tr>
    <td style="padding:15px">getDevice</td>
    <td style="padding:15px">The array of calls used to get device details for the broker</td>
  </tr>
  <tr>
    <td style="padding:15px">getDevicesFiltered</td>
    <td style="padding:15px">The array of calls used to get devices for the broker</td>
  </tr>
  <tr>
    <td style="padding:15px">isAlive</td>
    <td style="padding:15px">The array of calls used to get device status for the broker</td>
  </tr>
  <tr>
    <td style="padding:15px">getConfig</td>
    <td style="padding:15px">The array of calls used to get device configuration for the broker</td>
  </tr>
  <tr>
    <td style="padding:15px">getCount</td>
    <td style="padding:15px">The array of calls used to get device configuration for the broker</td>
  </tr>
  <tr>
    <td style="padding:15px">getDevice/getDevicesFiltered/isAlive/getConfig/getCount -> path</td>
    <td style="padding:15px">The path, not including the base_path and version, for making this call</td>
  </tr>
  <tr>
    <td style="padding:15px">getDevice/getDevicesFiltered/isAlive/getConfig/getCount -> method</td>
    <td style="padding:15px">The rest method for making this call</td>
  </tr>
  <tr>
    <td style="padding:15px">getDevice/getDevicesFiltered/isAlive/getConfig/getCount -> query</td>
    <td style="padding:15px">Query object containing and query parameters and their values for this call</td>
  </tr>
  <tr>
    <td style="padding:15px">getDevice/getDevicesFiltered/isAlive/getConfig/getCount -> body</td>
    <td style="padding:15px">Body object containing the payload for this call</td>
  </tr>
  <tr>
    <td style="padding:15px">getDevice/getDevicesFiltered/isAlive/getConfig/getCount -> headers</td>
    <td style="padding:15px">Header object containing the headers for this call.</td>
  </tr>
  <tr>
    <td style="padding:15px">getDevice/getDevicesFiltered/isAlive/getConfig/getCount -> handleFailure</td>
    <td style="padding:15px">Tells the adapter whether to "fail" or "ignore" failures if they occur.</td>
  </tr>
  <tr>
    <td style="padding:15px">isAlive -> statusValue</td>
    <td style="padding:15px">Tells the adapter what value to look for in the status field to determine if the device is alive.</td>
  </tr>
  <tr>
    <td style="padding:15px">getDevice/getDevicesFiltered/isAlive/getConfig -> requestFields</td>
    <td style="padding:15px">Object containing fields the adapter should send on the request and where it should get the data. The where can be from a response to a getDevicesFiltered or a static value.</td>
  </tr>
  <tr>
    <td style="padding:15px">getDevice/getDevicesFiltered/isAlive/getConfig -> responseFields</td>
    <td style="padding:15px">Object containing fields the adapter should set to send back to iap and where the value should come from in the response or request data.</td>
  </tr>
</table>
<br>


## Using this Adapter

The `adapter.js` file contains the calls the adapter makes available to the rest of the Itential Platform. The API detailed for these calls should be available through JSDOC. The following is a brief summary of the calls.

### Generic Adapter Calls

These are adapter methods that IAP or you might use. There are some other methods not shown here that might be used for internal adapter functionality.

<table border="1" class="bordered-table">
  <tr>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Method Signature</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Description</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Workflow?</span></th>
  </tr>
  <tr>
    <td style="padding:15px">connect()</td>
    <td style="padding:15px">This call is run when the Adapter is first loaded by he Itential Platform. It validates the properties have been provided correctly.</td>
    <td style="padding:15px">No</td>
  </tr>
  <tr>
    <td style="padding:15px">healthCheck(callback)</td>
    <td style="padding:15px">This call ensures that the adapter can communicate with Adapter for Checkpoint Management. The actual call that is used is defined in the adapter properties and .system entities action.json file.</td>
    <td style="padding:15px">No</td>
  </tr>
  <tr>
    <td style="padding:15px">refreshProperties(properties)</td>
    <td style="padding:15px">This call provides the adapter the ability to accept property changes without having to restart the adapter.</td>
    <td style="padding:15px">No</td>
  </tr>
  <tr>
    <td style="padding:15px">encryptProperty(property, technique, callback)</td>
    <td style="padding:15px">This call will take the provided property and technique, and return the property encrypted with the technique. This allows the property to be used in the adapterProps section for the credential password so that the password does not have to be in clear text. The adapter will decrypt the property as needed for communications with Adapter for Checkpoint Management.</td>
    <td style="padding:15px">No</td>
  </tr>
  <tr>
    <td style="padding:15px">iapUpdateAdapterConfiguration(configFile, changes, entity, type, action, callback)</td>
    <td style="padding:15px">This call provides the ability to update the adapter configuration from IAP - includes actions, schema, mockdata and other configurations.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">iapSuspendAdapter(mode, callback)</td>
    <td style="padding:15px">This call provides the ability to suspend the adapter and either have requests rejected or put into a queue to be processed after the adapter is resumed.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">iapUnsuspendAdapter(callback)</td>
    <td style="padding:15px">This call provides the ability to resume a suspended adapter. Any requests in queue will be processed before new requests.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">iapGetAdapterQueue(callback)</td>
    <td style="padding:15px">This call will return the requests that are waiting in the queue if throttling is enabled.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">iapFindAdapterPath(apiPath, callback)</td>
    <td style="padding:15px">This call provides the ability to see if a particular API path is supported by the adapter.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">iapTroubleshootAdapter(props, persistFlag, adapter, callback)</td>
    <td style="padding:15px">This call can be used to check on the performance of the adapter - it checks connectivity, healthcheck and basic get calls.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">iapRunAdapterHealthcheck(adapter, callback)</td>
    <td style="padding:15px">This call will return the results of a healthcheck.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">iapRunAdapterConnectivity(callback)</td>
    <td style="padding:15px">This call will return the results of a connectivity check.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">iapRunAdapterBasicGet(callback)</td>
    <td style="padding:15px">This call will return the results of running basic get API calls.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">iapMoveAdapterEntitiesToDB(callback)</td>
    <td style="padding:15px">This call will push the adapter configuration from the entities directory into the Adapter or IAP Database.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">iapDeactivateTasks(tasks, callback)</td>
    <td style="padding:15px">This call provides the ability to remove tasks from the adapter.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">iapActivateTasks(tasks, callback)</td>
    <td style="padding:15px">This call provides the ability to add deactivated tasks back into the adapter.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">iapExpandedGenericAdapterRequest(metadata, uriPath, restMethod, pathVars, queryData, requestBody, addlHeaders, callback)</td>
    <td style="padding:15px">This is an expanded Generic Call. The metadata object allows us to provide many new capabilities within the generic request.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">genericAdapterRequest(uriPath, restMethod, queryData, requestBody, addlHeaders, callback)</td>
    <td style="padding:15px">This call allows you to provide the path to have the adapter call. It is an easy way to incorporate paths that have not been built into the adapter yet.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">genericAdapterRequestNoBasePath(uriPath, restMethod, queryData, requestBody, addlHeaders, callback)</td>
    <td style="padding:15px">This call is the same as the genericAdapterRequest only it does not add a base_path or version to the call.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">iapRunAdapterLint(callback)</td>
    <td style="padding:15px">Runs lint on the addapter and provides the information back.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">iapRunAdapterTests(callback)</td>
    <td style="padding:15px">Runs baseunit and unit tests on the adapter and provides the information back.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">iapGetAdapterInventory(callback)</td>
    <td style="padding:15px">This call provides some inventory related information about the adapter.</td>
    <td style="padding:15px">Yes</td>
  </tr>
</table>
<br>
  
### Adapter Cache Calls

These are adapter methods that are used for adapter caching. If configured, the adapter will cache based on the interval provided. However, you can force a population of the cache manually as well.

<table border="1" class="bordered-table">
  <tr>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Method Signature</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Description</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Workflow?</span></th>
  </tr>
  <tr>
    <td style="padding:15px">iapPopulateEntityCache(entityTypes, callback)</td>
    <td style="padding:15px">This call populates the adapter cache.</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">iapRetrieveEntitiesCache(entityType, options, callback)</td>
    <td style="padding:15px">This call retrieves the specific items from the adapter cache.</td>
    <td style="padding:15px">Yes</td>
  </tr>
</table>
<br>
  
### Adapter Broker Calls

These are adapter methods that are used to integrate to IAP Brokers. This adapter currently supports the following broker calls.

<table border="1" class="bordered-table">
  <tr>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Method Signature</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Description</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Workflow?</span></th>
  </tr>
  <tr>
    <td style="padding:15px">hasEntities(entityType, entityList, callback)</td>
    <td style="padding:15px">This call is utilized by the IAP Device Broker to determine if the adapter has a specific entity and item of the entity.</td>
    <td style="padding:15px">No</td>
  </tr>
  <tr>
    <td style="padding:15px">getDevice(deviceName, callback)</td>
    <td style="padding:15px">This call returns the details of the requested device.</td>
    <td style="padding:15px">No</td>
  </tr>
  <tr>
    <td style="padding:15px">getDevicesFiltered(options, callback)</td>
    <td style="padding:15px">This call returns the list of devices that match the criteria provided in the options filter.</td>
    <td style="padding:15px">No</td>
  </tr>
  <tr>
    <td style="padding:15px">isAlive(deviceName, callback)</td>
    <td style="padding:15px">This call returns whether the device status is active</td>
    <td style="padding:15px">No</td>
  </tr>
  <tr>
    <td style="padding:15px">getConfig(deviceName, format, callback)</td>
    <td style="padding:15px">This call returns the configuration for the selected device.</td>
    <td style="padding:15px">No</td>
  </tr>
  <tr>
    <td style="padding:15px">iapGetDeviceCount(callback)</td>
    <td style="padding:15px">This call returns the count of devices.</td>
    <td style="padding:15px">No</td>
  </tr>
</table>
<br>

### Specific Adapter Calls

Specific adapter calls are built based on the API of the Check Point Management. The Adapter Builder creates the proper method comments for generating JS-DOC for the adapter. This is the best way to get information on the calls.

<table border="1" class="bordered-table">
  <tr>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Method Signature</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Description</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Path</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Workflow?</span></th>
  </tr>
  <tr>
    <td style="padding:15px">login(body, callback)</td>
    <td style="padding:15px">login</td>
    <td style="padding:15px">{base_path}/{version}/login?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">loginToDomainWithSid(sid, body, callback)</td>
    <td style="padding:15px">loginToDomainWithSid</td>
    <td style="padding:15px">{base_path}/{version}/login-to-domain?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">publishWithSid(sid, body, callback)</td>
    <td style="padding:15px">publish</td>
    <td style="padding:15px">{base_path}/{version}/publish?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">discardWithSid(sid, body, callback)</td>
    <td style="padding:15px">discard</td>
    <td style="padding:15px">{base_path}/{version}/discard?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">logoutWithSid(sid, body, callback)</td>
    <td style="padding:15px">logout</td>
    <td style="padding:15px">{base_path}/{version}/logout?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">disconnectWithSid(sid, body, callback)</td>
    <td style="padding:15px">disconnect</td>
    <td style="padding:15px">{base_path}/{version}/disconnect?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">keepaliveWithSid(sid, body, callback)</td>
    <td style="padding:15px">keepalive</td>
    <td style="padding:15px">{base_path}/{version}/keepalive?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showSessionWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-session</td>
    <td style="padding:15px">{base_path}/{version}/show-session?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setSessionWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-session</td>
    <td style="padding:15px">{base_path}/{version}/set-session?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">continueSessionInSmartconsoleWithSid(sid, body, callback)</td>
    <td style="padding:15px">continue-session-in-smartconsole</td>
    <td style="padding:15px">{base_path}/{version}/continue-session-in-smartconsole?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showLastPublishedSessionWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-last-published-session</td>
    <td style="padding:15px">{base_path}/{version}/show-last-published-session?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">purgePublishedSessionsByCountWithSid(sid, body, callback)</td>
    <td style="padding:15px">purge-published-sessions by count</td>
    <td style="padding:15px">{base_path}/{version}/purge-published-sessions?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">switchSessionWithSid(sid, body, callback)</td>
    <td style="padding:15px">switch-session</td>
    <td style="padding:15px">{base_path}/{version}/switch-session?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">assignSessionWithSid(sid, body, callback)</td>
    <td style="padding:15px">assign-session</td>
    <td style="padding:15px">{base_path}/{version}/assign-session?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">takeOverSessionWithSid(sid, body, callback)</td>
    <td style="padding:15px">take-over-session</td>
    <td style="padding:15px">{base_path}/{version}/take-over-session?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showSessionsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-sessions</td>
    <td style="padding:15px">{base_path}/{version}/show-sessions?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showLoginMessageWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-login-message</td>
    <td style="padding:15px">{base_path}/{version}/show-login-message?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setLoginMessageWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-login-message</td>
    <td style="padding:15px">{base_path}/{version}/set-login-message?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addHostWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-host</td>
    <td style="padding:15px">{base_path}/{version}/add-host?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showHostWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-host</td>
    <td style="padding:15px">{base_path}/{version}/show-host?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setHostWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-host</td>
    <td style="padding:15px">{base_path}/{version}/set-host?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteHostWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-host</td>
    <td style="padding:15px">{base_path}/{version}/delete-host?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showHostsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-hosts</td>
    <td style="padding:15px">{base_path}/{version}/show-hosts?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addNetworkWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-network</td>
    <td style="padding:15px">{base_path}/{version}/add-network?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showNetworkWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-network</td>
    <td style="padding:15px">{base_path}/{version}/show-network?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setNetworkWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-network</td>
    <td style="padding:15px">{base_path}/{version}/set-network?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteNetworkWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-network</td>
    <td style="padding:15px">{base_path}/{version}/delete-network?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showNetworksWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-networks</td>
    <td style="padding:15px">{base_path}/{version}/show-networks?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addWildcardWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-wildcard</td>
    <td style="padding:15px">{base_path}/{version}/add-wildcard?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showWildcardWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-wildcard</td>
    <td style="padding:15px">{base_path}/{version}/show-wildcard?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setWildcardWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-wildcard</td>
    <td style="padding:15px">{base_path}/{version}/set-wildcard?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteWildcardWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-wildcard</td>
    <td style="padding:15px">{base_path}/{version}/delete-wildcard?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showWildcardsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-wildcards</td>
    <td style="padding:15px">{base_path}/{version}/show-wildcards?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addGroupWithGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-group with group</td>
    <td style="padding:15px">{base_path}/{version}/add-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-group</td>
    <td style="padding:15px">{base_path}/{version}/show-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-group</td>
    <td style="padding:15px">{base_path}/{version}/set-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-group</td>
    <td style="padding:15px">{base_path}/{version}/delete-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showGroupsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-groups</td>
    <td style="padding:15px">{base_path}/{version}/show-groups?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addAddressRangeWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-address-range</td>
    <td style="padding:15px">{base_path}/{version}/add-address-range?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showAddressRangeWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-address-range</td>
    <td style="padding:15px">{base_path}/{version}/show-address-range?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setAddressRangeWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-address-range</td>
    <td style="padding:15px">{base_path}/{version}/set-address-range?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteAddressRangeWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-address-range</td>
    <td style="padding:15px">{base_path}/{version}/delete-address-range?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showAddressRangesWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-address-ranges</td>
    <td style="padding:15px">{base_path}/{version}/show-address-ranges?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addMulticastAddressRangeIpRangeWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-multicast-address-range-ip-range</td>
    <td style="padding:15px">{base_path}/{version}/add-multicast-address-range?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showMulticastAddressRangeWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-multicast-address-range</td>
    <td style="padding:15px">{base_path}/{version}/show-multicast-address-range?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setMulticastAddressRangeWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-multicast-address-range</td>
    <td style="padding:15px">{base_path}/{version}/set-multicast-address-range?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteMulticastAddressRangeWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-multicast-address-range</td>
    <td style="padding:15px">{base_path}/{version}/delete-multicast-address-range?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showMulticastAddressRangesWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-multicast-address-ranges</td>
    <td style="padding:15px">{base_path}/{version}/show-multicast-address-ranges?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addGroupWithExclusionWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-group-with-exclusion</td>
    <td style="padding:15px">{base_path}/{version}/add-group-with-exclusion?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showGroupWithExclusionWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-group-with-exclusion</td>
    <td style="padding:15px">{base_path}/{version}/show-group-with-exclusion?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setGroupWithExclusionWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-group-with-exclusion</td>
    <td style="padding:15px">{base_path}/{version}/set-group-with-exclusion?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteGroupWithExclusionWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-group-with-exclusion</td>
    <td style="padding:15px">{base_path}/{version}/delete-group-with-exclusion?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showGroupsWithExclusionWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-groups-with-exclusion</td>
    <td style="padding:15px">{base_path}/{version}/show-groups-with-exclusion?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addSimpleGatewayWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-simple-gateway</td>
    <td style="padding:15px">{base_path}/{version}/add-simple-gateway?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showSimpleGatewayWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-simple-gateway</td>
    <td style="padding:15px">{base_path}/{version}/show-simple-gateway?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setSimpleGatewayWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-simple-gateway</td>
    <td style="padding:15px">{base_path}/{version}/set-simple-gateway?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteSimpleGatewayWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-simple-gateway</td>
    <td style="padding:15px">{base_path}/{version}/delete-simple-gateway?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showSimpleGatewaysWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-simple-gateways</td>
    <td style="padding:15px">{base_path}/{version}/show-simple-gateways?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addSecurityZoneWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-security-zone</td>
    <td style="padding:15px">{base_path}/{version}/add-security-zone?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showSecurityZoneWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-security-zone</td>
    <td style="padding:15px">{base_path}/{version}/show-security-zone?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setSecurityZoneWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-security-zone</td>
    <td style="padding:15px">{base_path}/{version}/set-security-zone?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteSecurityZoneWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-security-zone</td>
    <td style="padding:15px">{base_path}/{version}/delete-security-zone?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showSecurityZonesWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-security-zones</td>
    <td style="padding:15px">{base_path}/{version}/show-security-zones?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addTimeWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-time</td>
    <td style="padding:15px">{base_path}/{version}/add-time?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showTimeWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-time</td>
    <td style="padding:15px">{base_path}/{version}/show-time?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setTimeWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-time</td>
    <td style="padding:15px">{base_path}/{version}/set-time?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteTimeWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-time</td>
    <td style="padding:15px">{base_path}/{version}/delete-time?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showTimesWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-times</td>
    <td style="padding:15px">{base_path}/{version}/show-times?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addTimeGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-time-group</td>
    <td style="padding:15px">{base_path}/{version}/add-time-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showTimeGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-time-group</td>
    <td style="padding:15px">{base_path}/{version}/show-time-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setTimeGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-time-group</td>
    <td style="padding:15px">{base_path}/{version}/set-time-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteTimeGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-time-group</td>
    <td style="padding:15px">{base_path}/{version}/delete-time-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showTimeGroupsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-time-groups</td>
    <td style="padding:15px">{base_path}/{version}/show-time-groups?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addAccessRoleWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-access-role</td>
    <td style="padding:15px">{base_path}/{version}/add-access-role?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showAccessRoleWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-access-role</td>
    <td style="padding:15px">{base_path}/{version}/show-access-role?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setAccessRoleWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-access-role</td>
    <td style="padding:15px">{base_path}/{version}/set-access-role?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteAccessRoleWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-access-role</td>
    <td style="padding:15px">{base_path}/{version}/delete-access-role?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showAccessRolesWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-access-roles</td>
    <td style="padding:15px">{base_path}/{version}/show-access-roles?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addDynamicObjectWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-dynamic-object</td>
    <td style="padding:15px">{base_path}/{version}/add-dynamic-object?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showDynamicObjectWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-dynamic-object</td>
    <td style="padding:15px">{base_path}/{version}/show-dynamic-object?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setDynamicObjectWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-dynamic-object</td>
    <td style="padding:15px">{base_path}/{version}/set-dynamic-object?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteDynamicObjectWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-dynamic-object</td>
    <td style="padding:15px">{base_path}/{version}/delete-dynamic-object?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showDynamicObjectsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-dynamic-objects</td>
    <td style="padding:15px">{base_path}/{version}/show-dynamic-objects?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addTrustedClientWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-trusted-client</td>
    <td style="padding:15px">{base_path}/{version}/add-trusted-client?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showTrustedClientWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-trusted-client</td>
    <td style="padding:15px">{base_path}/{version}/show-trusted-client?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setTrustedClientWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-trusted-client</td>
    <td style="padding:15px">{base_path}/{version}/set-trusted-client?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteTrustedClientWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-trusted-client</td>
    <td style="padding:15px">{base_path}/{version}/delete-trusted-client?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showTrustedClientsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-trusted-clients</td>
    <td style="padding:15px">{base_path}/{version}/show-trusted-clients?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addTagWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-tag</td>
    <td style="padding:15px">{base_path}/{version}/add-tag?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showTagWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-tag</td>
    <td style="padding:15px">{base_path}/{version}/show-tag?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setTagWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-tag</td>
    <td style="padding:15px">{base_path}/{version}/set-tag?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteTagWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-tag</td>
    <td style="padding:15px">{base_path}/{version}/delete-tag?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showTagsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-tags</td>
    <td style="padding:15px">{base_path}/{version}/show-tags?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addDnsDomainWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-dns-domain</td>
    <td style="padding:15px">{base_path}/{version}/add-dns-domain?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showDnsDomainWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-dns-domain</td>
    <td style="padding:15px">{base_path}/{version}/show-dns-domain?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setDnsDomainWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-dns-domain</td>
    <td style="padding:15px">{base_path}/{version}/set-dns-domain?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteDnsDomainWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-dns-domain</td>
    <td style="padding:15px">{base_path}/{version}/delete-dns-domain?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showDnsDomainsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-dns-domains</td>
    <td style="padding:15px">{base_path}/{version}/show-dns-domains?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addOpsecApplicationWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-opsec-application</td>
    <td style="padding:15px">{base_path}/{version}/add-opsec-application?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showOpsecApplicationWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-opsec-application</td>
    <td style="padding:15px">{base_path}/{version}/show-opsec-application?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setOpsecApplicationWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-opsec-application</td>
    <td style="padding:15px">{base_path}/{version}/set-opsec-application?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteOpsecApplicationWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-opsec-application</td>
    <td style="padding:15px">{base_path}/{version}/delete-opsec-application?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showOpsecApplicationsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-opsec-applications</td>
    <td style="padding:15px">{base_path}/{version}/show-opsec-applications?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showDataCenterContentWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-data-center-content</td>
    <td style="padding:15px">{base_path}/{version}/show-data-center-content?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showDataCenterWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-data-center</td>
    <td style="padding:15px">{base_path}/{version}/show-data-center?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showDataCentersWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-data-centers</td>
    <td style="padding:15px">{base_path}/{version}/show-data-centers?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addDataCenterObjectWithGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-data-center-object with group</td>
    <td style="padding:15px">{base_path}/{version}/add-data-center-object?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showDataCenterObjectWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-data-center-object</td>
    <td style="padding:15px">{base_path}/{version}/show-data-center-object?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteDataCenterObjectWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-data-center-object</td>
    <td style="padding:15px">{base_path}/{version}/delete-data-center-object?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showDataCenterObjectsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-data-center-objects</td>
    <td style="padding:15px">{base_path}/{version}/show-data-center-objects?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showUpdatableObjectsRepositoryContentWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-updatable-objects-repository-content</td>
    <td style="padding:15px">{base_path}/{version}/show-updatable-objects-repository-content?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">updateUpdatableObjectsRepositoryContentWithSid(sid, body, callback)</td>
    <td style="padding:15px">update-updatable-objects-repository-content</td>
    <td style="padding:15px">{base_path}/{version}/update-updatable-objects-repository-content?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addUpdatableObjectWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-updatable-object</td>
    <td style="padding:15px">{base_path}/{version}/add-updatable-object?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showUpdatableObjectWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-updatable-object</td>
    <td style="padding:15px">{base_path}/{version}/show-updatable-object?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteUpdatableObjectWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-updatable-object</td>
    <td style="padding:15px">{base_path}/{version}/delete-updatable-object?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showUpdatableObjectsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-updatable-objects</td>
    <td style="padding:15px">{base_path}/{version}/show-updatable-objects?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addServiceTcpWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-service-tcp</td>
    <td style="padding:15px">{base_path}/{version}/add-service-tcp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServiceTcpWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-service-tcp</td>
    <td style="padding:15px">{base_path}/{version}/show-service-tcp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setServiceTcpWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-service-tcp</td>
    <td style="padding:15px">{base_path}/{version}/set-service-tcp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteServiceTcpWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-service-tcp</td>
    <td style="padding:15px">{base_path}/{version}/delete-service-tcp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServicesTcpWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-services-tcp</td>
    <td style="padding:15px">{base_path}/{version}/show-services-tcp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addServiceUdpWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-service-udp</td>
    <td style="padding:15px">{base_path}/{version}/add-service-udp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServiceUdpWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-service-udp</td>
    <td style="padding:15px">{base_path}/{version}/show-service-udp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setServiceUdpWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-service-udp</td>
    <td style="padding:15px">{base_path}/{version}/set-service-udp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteServiceUdpWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-service-udp</td>
    <td style="padding:15px">{base_path}/{version}/delete-service-udp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServicesUdpWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-services-udp</td>
    <td style="padding:15px">{base_path}/{version}/show-services-udp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addServiceIcmpWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-service-icmp</td>
    <td style="padding:15px">{base_path}/{version}/add-service-icmp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServiceIcmpWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-service-icmp</td>
    <td style="padding:15px">{base_path}/{version}/show-service-icmp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setServiceIcmpWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-service-icmp</td>
    <td style="padding:15px">{base_path}/{version}/set-service-icmp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteServiceIcmpWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-service-icmp</td>
    <td style="padding:15px">{base_path}/{version}/delete-service-icmp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServicesIcmpWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-services-icmp</td>
    <td style="padding:15px">{base_path}/{version}/show-services-icmp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addServiceIcmp6WithSid(sid, body, callback)</td>
    <td style="padding:15px">add-service-icmp6</td>
    <td style="padding:15px">{base_path}/{version}/add-service-icmp6?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServiceIcmp6WithSid(sid, body, callback)</td>
    <td style="padding:15px">show-service-icmp6</td>
    <td style="padding:15px">{base_path}/{version}/show-service-icmp6?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setServiceIcmp6WithSid(sid, body, callback)</td>
    <td style="padding:15px">set-service-icmp6</td>
    <td style="padding:15px">{base_path}/{version}/set-service-icmp6?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteServiceIcmp6WithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-service-icmp6</td>
    <td style="padding:15px">{base_path}/{version}/delete-service-icmp6?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServicesIcmp6WithSid(sid, body, callback)</td>
    <td style="padding:15px">show-services-icmp6</td>
    <td style="padding:15px">{base_path}/{version}/show-services-icmp6?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addServiceSctpWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-service-sctp</td>
    <td style="padding:15px">{base_path}/{version}/add-service-sctp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServiceSctpWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-service-sctp</td>
    <td style="padding:15px">{base_path}/{version}/show-service-sctp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setServiceSctpWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-service-sctp</td>
    <td style="padding:15px">{base_path}/{version}/set-service-sctp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteServiceSctpWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-service-sctp</td>
    <td style="padding:15px">{base_path}/{version}/delete-service-sctp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServicesSctpWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-services-sctp</td>
    <td style="padding:15px">{base_path}/{version}/show-services-sctp?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addServiceOtherWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-service-other</td>
    <td style="padding:15px">{base_path}/{version}/add-service-other?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServiceOtherWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-service-other</td>
    <td style="padding:15px">{base_path}/{version}/show-service-other?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setServiceOtherWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-service-other</td>
    <td style="padding:15px">{base_path}/{version}/set-service-other?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteServiceOtherWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-service-other</td>
    <td style="padding:15px">{base_path}/{version}/delete-service-other?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServicesOtherWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-services-other</td>
    <td style="padding:15px">{base_path}/{version}/show-services-other?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addServiceGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-service-group</td>
    <td style="padding:15px">{base_path}/{version}/add-service-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServiceGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-service-group</td>
    <td style="padding:15px">{base_path}/{version}/show-service-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setServiceGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-service-group</td>
    <td style="padding:15px">{base_path}/{version}/set-service-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteServiceGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-service-group</td>
    <td style="padding:15px">{base_path}/{version}/delete-service-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServiceGroupsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-service-groups</td>
    <td style="padding:15px">{base_path}/{version}/show-service-groups?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addApplicationSiteWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-application-site</td>
    <td style="padding:15px">{base_path}/{version}/add-application-site?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showApplicationSiteWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-application-site</td>
    <td style="padding:15px">{base_path}/{version}/show-application-site?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setApplicationSiteWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-application-site</td>
    <td style="padding:15px">{base_path}/{version}/set-application-site?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteApplicationSiteWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-application-site</td>
    <td style="padding:15px">{base_path}/{version}/delete-application-site?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showApplicationSitesWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-application-sites</td>
    <td style="padding:15px">{base_path}/{version}/show-application-sites?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addApplicationSiteCategoryWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-application-site-category</td>
    <td style="padding:15px">{base_path}/{version}/add-application-site-category?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showApplicationSiteCategoryWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-application-site-category</td>
    <td style="padding:15px">{base_path}/{version}/show-application-site-category?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setApplicationSiteCategoryWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-application-site-category</td>
    <td style="padding:15px">{base_path}/{version}/set-application-site-category?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteApplicationSiteCategoryWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-application-site-category</td>
    <td style="padding:15px">{base_path}/{version}/delete-application-site-category?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showApplicationSiteCategoriesWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-application-site-categories</td>
    <td style="padding:15px">{base_path}/{version}/show-application-site-categories?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addApplicationSiteGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-application-site-group</td>
    <td style="padding:15px">{base_path}/{version}/add-application-site-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showApplicationSiteGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-application-site-group</td>
    <td style="padding:15px">{base_path}/{version}/show-application-site-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setApplicationSiteGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-application-site-group</td>
    <td style="padding:15px">{base_path}/{version}/set-application-site-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteApplicationSiteGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-application-site-group</td>
    <td style="padding:15px">{base_path}/{version}/delete-application-site-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showApplicationSiteGroupsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-application-site-groups</td>
    <td style="padding:15px">{base_path}/{version}/show-application-site-groups?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addServiceDceRpcWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-service-dce-rpc</td>
    <td style="padding:15px">{base_path}/{version}/add-service-dce-rpc?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServiceDceRpcWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-service-dce-rpc</td>
    <td style="padding:15px">{base_path}/{version}/show-service-dce-rpc?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setServiceDceRpcWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-service-dce-rpc</td>
    <td style="padding:15px">{base_path}/{version}/set-service-dce-rpc?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteServiceDceRpcWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-service-dce-rpc</td>
    <td style="padding:15px">{base_path}/{version}/delete-service-dce-rpc?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServicesDceRpcWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-services-dce-rpc</td>
    <td style="padding:15px">{base_path}/{version}/show-services-dce-rpc?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addServiceRpcWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-service-rpc</td>
    <td style="padding:15px">{base_path}/{version}/add-service-rpc?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServiceRpcWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-service-rpc</td>
    <td style="padding:15px">{base_path}/{version}/show-service-rpc?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setServiceRpcWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-service-rpc</td>
    <td style="padding:15px">{base_path}/{version}/set-service-rpc?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteServiceRpcWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-service-rpc</td>
    <td style="padding:15px">{base_path}/{version}/delete-service-rpc?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showServicesRpcWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-services-rpc</td>
    <td style="padding:15px">{base_path}/{version}/show-services-rpc?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addAccessRuleWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-access-rule</td>
    <td style="padding:15px">{base_path}/{version}/add-access-rule?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showAccessRulebaseWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-access-rulebase</td>
    <td style="padding:15px">{base_path}/{version}/show-access-rulebase?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showAccessRuleWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-access-rule</td>
    <td style="padding:15px">{base_path}/{version}/show-access-rule?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setAccessRuleWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-access-rule</td>
    <td style="padding:15px">{base_path}/{version}/set-access-rule?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteAccessRuleWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-access-rule</td>
    <td style="padding:15px">{base_path}/{version}/delete-access-rule?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addAccessSectionWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-access-section</td>
    <td style="padding:15px">{base_path}/{version}/add-access-section?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showAccessSectionWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-access-section</td>
    <td style="padding:15px">{base_path}/{version}/show-access-section?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setAccessSectionWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-access-section</td>
    <td style="padding:15px">{base_path}/{version}/set-access-section?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteAccessSectionWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-access-section</td>
    <td style="padding:15px">{base_path}/{version}/delete-access-section?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addAccessLayerWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-access-layer</td>
    <td style="padding:15px">{base_path}/{version}/add-access-layer?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showAccessLayerWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-access-layer</td>
    <td style="padding:15px">{base_path}/{version}/show-access-layer?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setAccessLayerWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-access-layer</td>
    <td style="padding:15px">{base_path}/{version}/set-access-layer?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteAccessLayerWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-access-layer</td>
    <td style="padding:15px">{base_path}/{version}/delete-access-layer?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showAccessLayersWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-access-layers</td>
    <td style="padding:15px">{base_path}/{version}/show-access-layers?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addNatRuleWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-nat-rule</td>
    <td style="padding:15px">{base_path}/{version}/add-nat-rule?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showNatRulebaseWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-nat-rulebase</td>
    <td style="padding:15px">{base_path}/{version}/show-nat-rulebase?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showNatRuleWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-nat-rule</td>
    <td style="padding:15px">{base_path}/{version}/show-nat-rule?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setNatRuleWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-nat-rule</td>
    <td style="padding:15px">{base_path}/{version}/set-nat-rule?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteNatRuleWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-nat-rule</td>
    <td style="padding:15px">{base_path}/{version}/delete-nat-rule?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addNatSectionWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-nat-section</td>
    <td style="padding:15px">{base_path}/{version}/add-nat-section?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showNatSectionWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-nat-section</td>
    <td style="padding:15px">{base_path}/{version}/show-nat-section?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setNatSectionWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-nat-section</td>
    <td style="padding:15px">{base_path}/{version}/set-nat-section?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteNatSectionWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-nat-section</td>
    <td style="padding:15px">{base_path}/{version}/delete-nat-section?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addVpnCommunityMeshedWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-vpn-community-meshed</td>
    <td style="padding:15px">{base_path}/{version}/add-vpn-community-meshed?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showVpnCommunityMeshedWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-vpn-community-meshed</td>
    <td style="padding:15px">{base_path}/{version}/show-vpn-community-meshed?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setVpnCommunityMeshedWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-vpn-community-meshed</td>
    <td style="padding:15px">{base_path}/{version}/set-vpn-community-meshed?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteVpnCommunityMeshedWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-vpn-community-meshed</td>
    <td style="padding:15px">{base_path}/{version}/delete-vpn-community-meshed?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showVpnCommunitiesMeshedWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-vpn-communities-meshed</td>
    <td style="padding:15px">{base_path}/{version}/show-vpn-communities-meshed?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addVpnCommunityStarWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-vpn-community-star</td>
    <td style="padding:15px">{base_path}/{version}/add-vpn-community-star?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showVpnCommunityStarWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-vpn-community-star</td>
    <td style="padding:15px">{base_path}/{version}/show-vpn-community-star?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setVpnCommunityStarWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-vpn-community-star</td>
    <td style="padding:15px">{base_path}/{version}/set-vpn-community-star?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteVpnCommunityStarWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-vpn-community-star</td>
    <td style="padding:15px">{base_path}/{version}/delete-vpn-community-star?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showVpnCommunitiesStarWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-vpn-communities-star</td>
    <td style="padding:15px">{base_path}/{version}/show-vpn-communities-star?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addThreatRuleWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-threat-rule</td>
    <td style="padding:15px">{base_path}/{version}/add-threat-rule?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showThreatRulebaseWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-threat-rulebase</td>
    <td style="padding:15px">{base_path}/{version}/show-threat-rulebase?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showThreatRuleWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-threat-rule</td>
    <td style="padding:15px">{base_path}/{version}/show-threat-rule?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setThreatRuleWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-threat-rule</td>
    <td style="padding:15px">{base_path}/{version}/set-threat-rule?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteThreatRuleWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-threat-rule</td>
    <td style="padding:15px">{base_path}/{version}/delete-threat-rule?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addThreatExceptionWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-threat-exception</td>
    <td style="padding:15px">{base_path}/{version}/add-threat-exception?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showThreatRuleExceptionRulebaseWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-threat-rule-exception-rulebase</td>
    <td style="padding:15px">{base_path}/{version}/show-threat-rule-exception-rulebase?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showThreatExceptionWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-threat-exception</td>
    <td style="padding:15px">{base_path}/{version}/show-threat-exception?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setThreatExceptionWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-threat-exception</td>
    <td style="padding:15px">{base_path}/{version}/set-threat-exception?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteThreatExceptionWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-threat-exception</td>
    <td style="padding:15px">{base_path}/{version}/delete-threat-exception?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addExceptionGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-exception-group</td>
    <td style="padding:15px">{base_path}/{version}/add-exception-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showExceptionGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-exception-group</td>
    <td style="padding:15px">{base_path}/{version}/show-exception-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setExceptionGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-exception-group</td>
    <td style="padding:15px">{base_path}/{version}/set-exception-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteExceptionGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-exception-group</td>
    <td style="padding:15px">{base_path}/{version}/delete-exception-group?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showExceptionGroupsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-exception-groups</td>
    <td style="padding:15px">{base_path}/{version}/show-exception-groups?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showThreatProtectionWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-threat-protection</td>
    <td style="padding:15px">{base_path}/{version}/show-threat-protection?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setThreatProtectionWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-threat-protection</td>
    <td style="padding:15px">{base_path}/{version}/set-threat-protection?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showThreatProtectionsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-threat-protections</td>
    <td style="padding:15px">{base_path}/{version}/show-threat-protections?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addThreatProtectionsWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-threat-protections</td>
    <td style="padding:15px">{base_path}/{version}/add-threat-protections?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteThreatProtectionsWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-threat-protections</td>
    <td style="padding:15px">{base_path}/{version}/delete-threat-protections?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addThreatProfileWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-threat-profile</td>
    <td style="padding:15px">{base_path}/{version}/add-threat-profile?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showThreatProfileWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-threat-profile</td>
    <td style="padding:15px">{base_path}/{version}/show-threat-profile?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setThreatProfileWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-threat-profile</td>
    <td style="padding:15px">{base_path}/{version}/set-threat-profile?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteThreatProfileWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-threat-profile</td>
    <td style="padding:15px">{base_path}/{version}/delete-threat-profile?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showThreatProfilesWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-threat-profiles</td>
    <td style="padding:15px">{base_path}/{version}/show-threat-profiles?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addThreatIndicatorWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-threat-indicator</td>
    <td style="padding:15px">{base_path}/{version}/add-threat-indicator?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showThreatIndicatorWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-threat-indicator</td>
    <td style="padding:15px">{base_path}/{version}/show-threat-indicator?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setThreatIndicatorWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-threat-indicator</td>
    <td style="padding:15px">{base_path}/{version}/set-threat-indicator?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteThreatIndicatorWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-threat-indicator</td>
    <td style="padding:15px">{base_path}/{version}/delete-threat-indicator?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showThreatIndicatorsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-threat-indicators</td>
    <td style="padding:15px">{base_path}/{version}/show-threat-indicators?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addThreatLayerWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-threat-layer</td>
    <td style="padding:15px">{base_path}/{version}/add-threat-layer?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showThreatLayerWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-threat-layer</td>
    <td style="padding:15px">{base_path}/{version}/show-threat-layer?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setThreatLayerWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-threat-layer</td>
    <td style="padding:15px">{base_path}/{version}/set-threat-layer?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteThreatLayerWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-threat-layer</td>
    <td style="padding:15px">{base_path}/{version}/delete-threat-layer?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showThreatLayersWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-threat-layers</td>
    <td style="padding:15px">{base_path}/{version}/show-threat-layers?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showIpsUpdateScheduleWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-ips-update-schedule</td>
    <td style="padding:15px">{base_path}/{version}/show-ips-update-schedule?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setIpsUpdateScheduleIntervalWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-ips-update-schedule-interval</td>
    <td style="padding:15px">{base_path}/{version}/set-ips-update-schedule?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">runIpsUpdateWithSid(sid, body, callback)</td>
    <td style="padding:15px">run-ips-update</td>
    <td style="padding:15px">{base_path}/{version}/run-ips-update?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showIpsStatusWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-ips-status</td>
    <td style="padding:15px">{base_path}/{version}/show-ips-status?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showIpsProtectionExtendedAttributeWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-ips-protection-extended-attribute</td>
    <td style="padding:15px">{base_path}/{version}/show-ips-protection-extended-attribute?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showIpsProtectionExtendedAttributesWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-ips-protection-extended-attributes</td>
    <td style="padding:15px">{base_path}/{version}/show-ips-protection-extended-attributes?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">runThreatEmulationFileTypesOfflineUpdateWithSid(sid, body, callback)</td>
    <td style="padding:15px">run-threat-emulation-file-types-offline-update</td>
    <td style="padding:15px">{base_path}/{version}/run-threat-emulation-file-types-offline-update?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">verifyPolicyWithSid(sid, body, callback)</td>
    <td style="padding:15px">verify-policy</td>
    <td style="padding:15px">{base_path}/{version}/verify-policy?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">installPolicyWithSid(sid, body, callback)</td>
    <td style="padding:15px">install-policy</td>
    <td style="padding:15px">{base_path}/{version}/install-policy?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addPackageWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-package</td>
    <td style="padding:15px">{base_path}/{version}/add-package?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showPackageWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-package</td>
    <td style="padding:15px">{base_path}/{version}/show-package?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setPackageWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-package</td>
    <td style="padding:15px">{base_path}/{version}/set-package?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deletePackageWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-package</td>
    <td style="padding:15px">{base_path}/{version}/delete-package?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showPackagesWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-packages</td>
    <td style="padding:15px">{base_path}/{version}/show-packages?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addDomainWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-domain</td>
    <td style="padding:15px">{base_path}/{version}/add-domain?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showDomainWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-domain</td>
    <td style="padding:15px">{base_path}/{version}/show-domain?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setDomainWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-domain</td>
    <td style="padding:15px">{base_path}/{version}/set-domain?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteDomainWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-domain</td>
    <td style="padding:15px">{base_path}/{version}/delete-domain?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showDomainsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-domains</td>
    <td style="padding:15px">{base_path}/{version}/show-domains?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showGlobalDomainWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-global-domain</td>
    <td style="padding:15px">{base_path}/{version}/show-global-domain?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setGlobalDomainWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-global-domain</td>
    <td style="padding:15px">{base_path}/{version}/set-global-domain?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showMdsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-mds</td>
    <td style="padding:15px">{base_path}/{version}/show-mds?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showMdssWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-mdss</td>
    <td style="padding:15px">{base_path}/{version}/show-mdss?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showPlaceHolderWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-place-holder</td>
    <td style="padding:15px">{base_path}/{version}/show-place-holder?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addGlobalAssignmentWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-global-assignment</td>
    <td style="padding:15px">{base_path}/{version}/add-global-assignment?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showGlobalAssignmentWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-global-assignment</td>
    <td style="padding:15px">{base_path}/{version}/show-global-assignment?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setGlobalAssignmentWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-global-assignment</td>
    <td style="padding:15px">{base_path}/{version}/set-global-assignment?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteGlobalAssignmentWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-global-assignment</td>
    <td style="padding:15px">{base_path}/{version}/delete-global-assignment?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showGlobalAssignmentsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-global-assignments</td>
    <td style="padding:15px">{base_path}/{version}/show-global-assignments?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">assignGlobalAssignmentWithSid(sid, body, callback)</td>
    <td style="padding:15px">assign-global-assignment</td>
    <td style="padding:15px">{base_path}/{version}/assign-global-assignment?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">whereUsedWithSid(sid, body, callback)</td>
    <td style="padding:15px">where-used</td>
    <td style="padding:15px">{base_path}/{version}/where-used?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showTaskWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-task</td>
    <td style="padding:15px">{base_path}/{version}/show-task?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">runScriptWithSid(sid, body, callback)</td>
    <td style="padding:15px">run-script</td>
    <td style="padding:15px">{base_path}/{version}/run-script?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showUnusedObjectsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show  unused objects</td>
    <td style="padding:15px">{base_path}/{version}/show-unused-objects?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">exportWithSid(sid, body, callback)</td>
    <td style="padding:15px">export</td>
    <td style="padding:15px">{base_path}/{version}/export?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showChangesBetweenTheDatesWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-changes between the dates</td>
    <td style="padding:15px">{base_path}/{version}/show-changes?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showGatewaysAndServersWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-gateways-and-servers</td>
    <td style="padding:15px">{base_path}/{version}/show-gateways-and-servers?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showObjectsOfTypeGroupWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-objects of type group</td>
    <td style="padding:15px">{base_path}/{version}/show-objects?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showValidationsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-validations</td>
    <td style="padding:15px">{base_path}/{version}/show-validations?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showTasksWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-tasks</td>
    <td style="padding:15px">{base_path}/{version}/show-tasks?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showApiVersionsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-api-versions</td>
    <td style="padding:15px">{base_path}/{version}/show-api-versions?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showObjectWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-object</td>
    <td style="padding:15px">{base_path}/{version}/show-object?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showCommandsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-commands</td>
    <td style="padding:15px">{base_path}/{version}/show-commands?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">putFileWithSid(sid, body, callback)</td>
    <td style="padding:15px">put-file</td>
    <td style="padding:15px">{base_path}/{version}/put-file?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">addAdministratorWithSid(sid, body, callback)</td>
    <td style="padding:15px">add-administrator</td>
    <td style="padding:15px">{base_path}/{version}/add-administrator?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showAdministratorWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-administrator</td>
    <td style="padding:15px">{base_path}/{version}/show-administrator?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setAdministratorWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-administrator</td>
    <td style="padding:15px">{base_path}/{version}/set-administrator?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">deleteAdministratorWithSid(sid, body, callback)</td>
    <td style="padding:15px">delete-administrator</td>
    <td style="padding:15px">{base_path}/{version}/delete-administrator?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showAdministratorsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-administrators</td>
    <td style="padding:15px">{base_path}/{version}/show-administrators?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">unlockAdministratorWithSid(sid, body, callback)</td>
    <td style="padding:15px">unlock-administrator</td>
    <td style="padding:15px">{base_path}/{version}/unlock-administrator?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">showApiSettingsWithSid(sid, body, callback)</td>
    <td style="padding:15px">show-api-settings</td>
    <td style="padding:15px">{base_path}/{version}/show-api-settings?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
  <tr>
    <td style="padding:15px">setApiSettingsWithSid(sid, body, callback)</td>
    <td style="padding:15px">set-api-settings</td>
    <td style="padding:15px">{base_path}/{version}/set-api-settings?{query}</td>
    <td style="padding:15px">Yes</td>
  </tr>
</table>
<br>

### Authentication

This document will go through the steps for authenticating the Check Point Management adapter with Dynamic Token Authentication. Properly configuring the properties for an adapter in IAP is critical for getting the adapter online. You can read more about adapter authentication <a href="https://docs.itential.com/opensource/docs/authentication" target="_blank">HERE</a>.

Companies periodically change authentication methods to provide better security. As this happens this section should be updated and contributed/merge back into the adapter repository.

#### Dynamic Token Authentication
The Check Point Management adapter authenticates with a dynamic token. 

STEPS
1. Ensure you have access to a Check Point Management server and that it is running
2. Follow the steps in the README.md to import the adapter into IAP if you have not already done so
3. Use the properties below for the ```properties.authentication``` field
```json
"authentication": {
  "auth_method": "request_token",
  "username": "<username>",
  "password": "<password>",
  "token_user_field": "user",
  "token_password_field": "password",
  "token_result_field": "sid",
  "token_URI_path": "/login",
  "token_timeout": 3600000,
  "token_cache": "local",
  "invalid_token_error": 400,
  "auth_field": "header.headers.x-chkp-sid",
  "auth_field_format": "{token}",
}
```
you can leave all of the other properties in the authentication section, they will not be used for Check Point Management dynamic token authentication.
4. Restart the adapter. If your properties were set correctly, the adapter should go online.

#### Troubleshooting
- Make sure you copied over the correct username and password as these are used to retrieve the token.
- Turn on debug level logs for the adapter in IAP Admin Essentials.
- Turn on auth_logging for the adapter in IAP Admin Essentials (adapter properties).
- Investigate the logs - in particular:
  - The FULL REQUEST log to make sure the proper headers are being sent with the request.
  - The FULL BODY log to make sure the payload is accurate.
  - The CALL RETURN log to see what the other system is telling us.
- Credentials should be ** masked ** by the adapter so make sure you verify the username and password - including that there are erroneous spaces at the front or end.
- Remember when you are done to turn auth_logging off as you do not want to log credentials.

## Additional Information

### Enhancements

#### Adding a Second Instance of an Adapter

You can add a second instance of this adapter without adding new code on the file system. To do this go into the IAP Admin Essentials and add a new service config for this adapter. The two instances of the adapter should have unique ids. In addition, they should point to different instances (unique host and port) of the other system.

#### Adding Adapter Calls

There are multiple ways to add calls to an existing adapter.

The easiest way would be to use the Adapter Builder update process. This process takes in a Swagger or OpenAPI document, allows you to select the calls you want to add and then generates a zip file that can be used to update the adapter. Once you have the zip file simply put it in the adapter directory and execute `npm run adapter:update`.

```bash
mv updatePackage.zip adapter-checkpoint_management
cd adapter-checkpoint_management
npm run adapter:update
```

If you do not have a Swagger or OpenAPI document, you can use a Postman Collection and convert that to an OpenAPI document using APIMatic and then follow the first process.

If you want to manually update the adapter that can also be done the key thing is to make sure you update all of the right files. Within the entities directory you will find 1 or more entities. You can create a new entity or add to an existing entity. Each entity has an action.json file, any new call will need to be put in the action.json file. It will also need to be added to the enum for the ph_request_type in the appropriate schema files. Once this configuration is complete you will need to add the call to the adapter.js file and, in order to make it available as a workflow task in IAP, it should also be added to the pronghorn.json file. You can optionally add it to the unit and integration test files. There is more information on how to work on each of these files in the <a href="https://docs.itential.com/opensource/docs/adapters" target="_blank">Adapter Technical Resources</a> on our Documentation Site.

```text
Files to update
* entities/<entity>/action.json: add an action
* entities/<entity>/schema.json (or the schema defined on the action): add action to the enum for ph_request_type
* adapter.js: add the new method and make sure it calls the proper entity and action
* pronghorn.json: add the new method
* test/unit/adapterTestUnit.js (optional but best practice): add unit test(s) - function is there, any required parameters error when not passed in
* test/integration/adapterTestIntegration.js (optional but best practice): add integration test
```

#### Adding Adapter Properties

While changing adapter properties is done in the service instance configuration section of IAP, adding properties has to be done in the adapter. To add a property you should edit the propertiesSchema.json with the proper information for the property. In addition, you should modify the sampleProperties to have the new property in it.

```text
Files to update
* propertiesSchema.json: add the new property and how it is defined
* sampleProperties: add the new property with a default value
* test/unit/adapterTestUnit.js (optional but best practice): add the property to the global properties
* test/integration/adapterTestIntegration.js (optional but best practice): add the property to the global properties
```

#### Changing Adapter Authentication

Often an adapter is built before knowing the authentication and authentication processes can also change over time. The adapter supports many different kinds of authentication but it does require configuration. Some forms of authentication can be defined entirely with the adapter properties but others require configuration.

```text
Files to update
* entities/.system/action.json: change the getToken action as needed
* entities/.system/schemaTokenReq.json: add input parameters (external name is name in other system)
* entities/.system/schemaTokenResp.json: add response parameters (external name is name in other system)
* propertiesSchema.json: add any new property and how it is defined
* sampleProperties: add any new property with a default value
* test/unit/adapterTestUnit.js (optional but best practice): add the property to the global properties
* test/integration/adapterTestIntegration.js (optional but best practice): add the property to the global properties
```

#### Enhancing Adapter Integration Tests

The adapter integration tests are written to be able to test in either stub (standalone) mode or integrated to the other system. However, if integrating to the other system, you may need to provide better data than what the adapter provides by default as that data is likely to fail for create and update. To provide better data, edit the adapter integration test file. Make sure you do not remove the marker and keep custom code below the marker so you do not impact future migrations. Once the edits are complete, run the integration test as it instructs you to above. When you run integrated to the other system, you can also save mockdata for future use by changing the isSaveMockData flag to true.

```text
Files to update
* test/integration/adapterTestIntegration.js: add better data for the create and update calls so that they will not fail.
```

As mentioned previously, for most of these changes as well as other possible changes, there is more information on how to work on an adapter in the <a href="https://docs.itential.com/opensource/docs/adapters" target="_blank">Adapter Technical Resources</a> on our Documentation Site.

### Contributing

First off, thanks for taking the time to contribute!

The following is a set of rules for contributing.

#### Code of Conduct

This project and everyone participating in it is governed by the Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to support@itential.com.

#### How to Contribute

Follow the contributing guide (here)[https://gitlab.com/itentialopensource/adapters/contributing-guide]

### Helpful Links

<a href="https://docs.itential.com/opensource/docs/adapters" target="_blank">Adapter Technical Resources</a>

### Node Scripts

There are several node scripts that now accompany the adapter. These scripts are provided to make several activities easier. Many of these scripts can have issues with different versions of IAP as they have dependencies on IAP and Mongo. If you have issues with the scripts please report them to the Itential Adapter Team. Each of these scripts are described below.

<table border="1" class="bordered-table">
  <tr>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Run</span></th>
    <th bgcolor="lightgrey" style="padding:15px"><span style="font-size:12.0pt">Description</span></th>
  </tr>
  <tr>
    <td style="padding:15px">npm run adapter:install</td>
    <td style="padding:15px">Provides an easier way to install the adapter.</td>
  </tr>
  <tr>
    <td style="padding:15px">npm run adapter:checkMigrate</td>
    <td style="padding:15px">Checks whether your adapter can and should be migrated to the latest foundation.</td>
  </tr>
  <tr>
    <td style="padding:15px">npm run adapter:findPath</td>
    <td style="padding:15px">Can be used to see if the adapter supports a particular API call.</td>
  </tr>
  <tr>
    <td style="padding:15px">npm run adapter:migrate</td>
    <td style="padding:15px">Provides an easier way to update your adapter after you download the migration zip from Itential DevSite.</td>
  </tr>
  <tr>
    <td style="padding:15px">npm run adapter:update</td>
    <td style="padding:15px">Provides an easier way to update your adapter after you download the update zip from Itential DevSite.</td>
  </tr>
  <tr>
    <td style="padding:15px">npm run adapter:revert</td>
    <td style="padding:15px">Allows you to revert after a migration or update if it resulted in issues.</td>
  </tr>
  <tr>
    <td style="padding:15px">npm run troubleshoot</td>
    <td style="padding:15px">Provides a way to troubleshoot the adapter - runs connectivity, healthcheck and basic get.</td>
  </tr>
  <tr>
    <td style="padding:15px">npm run connectivity</td>
    <td style="padding:15px">Provides a connectivity check to the Servicenow system.</td>
  </tr>
  <tr>
    <td style="padding:15px">npm run healthcheck</td>
    <td style="padding:15px">Checks whether the configured healthcheck call works to Servicenow.</td>
  </tr>
  <tr>
    <td style="padding:15px">npm run basicget</td>
    <td style="padding:15px">Checks whether the basic get calls works to Servicenow.</td>
  </tr>
</table>
<br>

## Troubleshoot

Run `npm run troubleshoot` to start the interactive troubleshooting process. The command allows you to verify and update connection, authentication as well as healthcheck configuration. After that it will test these properties by sending HTTP request to the endpoint. If the tests pass, it will persist these changes into IAP.

You also have the option to run individual commands to perform specific test:

- `npm run healthcheck` will perform a healthcheck request of with current setting.
- `npm run basicget` will perform some non-parameter GET request with current setting.
- `npm run connectivity` will perform networking diagnostics of the adatper endpoint.

### Connectivity Issues

1. You can run the adapter troubleshooting script which will check connectivity, run the healthcheck and run basic get calls.

```bash
npm run troubleshoot
```

2. Verify the adapter properties are set up correctly.

```text
Go into the Itential Platform GUI and verify/update the properties
```

3. Verify there is connectivity between the Itential Platform Server and Checkpoint_Management Server.

```text
ping the ip address of Checkpoint_Management server
try telnet to the ip address port of Checkpoint_Management
execute a curl command to the other system
```

4. Verify the credentials provided for Checkpoint_Management.

```text
login to Checkpoint_Management using the provided credentials
```

5. Verify the API of the call utilized for Checkpoint_Management Healthcheck.

```text
Go into the Itential Platform GUI and verify/update the properties
```

### Functional Issues

Adapter logs are located in `/var/log/pronghorn`. In older releases of the Itential Platform, there is a `pronghorn.log` file which contains logs for all of the Itential Platform. In newer versions, adapters can be configured to log into their own files.


