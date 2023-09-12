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
