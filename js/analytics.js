// Replace with your client ID from the developer console.
var CLIENT_ID = '335004036342-tnvr99cb8qchm3cd9lb53o1j7mqsnesi.apps.googleusercontent.com';

// Set authorized scope.
var SCOPES = ['https://www.googleapis.com/auth/analytics.readonly'];


function authorize(event) {
  // Handles the authorization flow.
  // `immediate` should be false when invoked from the button click.
  var useImmdiate = event ? false : true;
  var authData = {
    client_id: CLIENT_ID,
    scope: SCOPES,
    immediate: useImmdiate
  };

  gapi.auth.authorize(authData, function(response) {
      queryAccounts();
  });
}


function queryAccounts() {
// Load the Google Analytics client library.
gapi.client.load('analytics', 'v3').then(function() {

  // Get a list of all Google Analytics accounts for this user
  gapi.client.analytics.management.accounts.list().then(handleAccounts);
});
}


function handleAccounts(response) {
// Handles the response from the accounts list method.
if (response.result.items && response.result.items.length) {
  // Get the first Google Analytics account.
  var firstAccountId = response.result.items[0].id;

  // Query for properties.
  queryProperties(firstAccountId);
} else {
  console.log('No accounts found for this user.');
}
}


function queryProperties(accountId) {
// Get a list of all the properties for the account.
gapi.client.analytics.management.webproperties.list(
    {'accountId': accountId})
  .then(handleProperties)
  .then(null, function(err) {
    // Log any errors.
    console.log(err);
});
}


function handleProperties(response) {
// Handles the response from the webproperties list method.
if (response.result.items && response.result.items.length) {

  // Get the first Google Analytics account
  var firstAccountId = response.result.items[0].accountId;

  // Get the first property ID
  var firstPropertyId = response.result.items[0].id;

  // Query for Views (Profiles).
  queryProfiles(firstAccountId, firstPropertyId);
} else {
  console.log('No properties found for this user.');
}
}


function queryProfiles(accountId, propertyId) {
// Get a list of all Views (Profiles) for the first property
// of the first Account.
gapi.client.analytics.management.profiles.list({
    'accountId': accountId,
    'webPropertyId': propertyId
})
.then(handleProfiles)
.then(null, function(err) {
    // Log any errors.
    console.log(err);
});
}


function handleProfiles(response) {
// Handles the response from the profiles list method.
if (response.result.items && response.result.items.length) {
  // Get the first View (Profile) ID.
  var firstProfileId = response.result.items[0].id;

  // Query the Core Reporting API.
  queryCoreReportingApi(firstProfileId);
} else {
  console.log('No views (profiles) found for this user.');
}
}


function queryCoreReportingApi(profileId) {
// Query the Core Reporting API for the number sessions for
// the past seven days.
gapi.client.analytics.data.ga.get({
  'ids': 'ga:' + profileId,
  'start-date': '2016-01-01',
  'end-date': 'today',
  'metrics': 'ga:users'
})
.then(function(response) {
  var totalsForAllResults = response.result["totalsForAllResults"];
  var formattedJson = JSON.stringify(totalsForAllResults["ga:users"], null, 2).replace(/['"]+/g, '');
  $("#visitor-count").text($("#visitor-count").text() + formattedJson);
})
.then(null, function(err) {
    // Log any errors.
    console.log(err);
});
}
