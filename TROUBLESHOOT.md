## Troubleshoot

Run `npm run troubleshoot` to start the interactive troubleshooting process. The command allows you to verify and update connection, authentication as well as healthcheck configuration. After that it will test these properties by sending HTTP request to the endpoint. If the tests pass, it will persist these changes into Itential Platform.

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

### Adapter Results

The majority of the http response codes from the adapter come directly from the downstream system. There are some exceptions to this:

1. Timeout (-2): There is an attempt timeout property that defines how long the adapter should wait to receive a response before giving up. If that time expires before a resonse is received the adapter will respond with a code of -2. The message will say "The Adapter has run out of time for the request" and it will recommend that you "Increase your adapter request.attempt_timeout property".
2. Econnreset (-1): When the downstream system or something within the network drops the connection, the adapter will receive and forward an ECONNRESET error with a -1 code. The message will say "The connection was terminated by the network or external system" and the recommendation will be for you to "Check connectivity to the external system and that the system is up".

The adapter will also have various errors if it is unable to build the request. All of these errors come with messages and recommendations to help you understand what you need to do to resolve the issue.
