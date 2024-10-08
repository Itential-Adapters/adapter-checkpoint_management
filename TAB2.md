# Check Point Management

## Table of Contents 

  - [Specific Adapter Information](#specific-adapter-information) 
    - [Authentication](#authentication) 
    - [Sample Properties](#sample-properties) 
    - [Swagger](#swagger) 
  - [Generic Adapter Information](#generic-adapter-information) 

## Specific Adapter Information
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

### Sample Properties

Sample Properties can be used to help you configure the adapter in the Itential Automation Platform. You will need to update connectivity information such as the host, port, protocol and credentials.

```json
  "properties": {
    "host": "localhost",
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
      "username": "username",
      "password": "password",
      "token": "token",
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
### [Swagger](https://gitlab.com/itentialopensource/adapters/adapter-checkpoint_management/-/blob/master/report/adapter-openapi.json) 

## [Generic Adapter Information](https://gitlab.com/itentialopensource/adapters/adapter-checkpoint_management/-/blob/master/README.md) 

