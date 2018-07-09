'use strict';

const OAUTH_URL = 'https://platformdev.cloud.coveo.com/oauth';
// To get your OAuth2 redirect URI, run `zapier describe` and update this variable.
// Will looke like 'https://zapier.com/dashboard/auth/oauth/return/App123CLIAPI/'
const REDIRECT_URI = 'https://zapier.com/dashboard/auth/oauth/return/App4771CLIAPI/';

const getAuthorizeURL = () => {
  let url = `${OAUTH_URL}/authorize`;

  const urlParts = [
    `client_id=${process.env.CLIENT_ID}`,
    'redirect_uri = REDIRECT_URI',
    'response_type=code id_token',
    'scope=full',
  ];

  const finalUrl = `${url}?${urlParts.join('&')}`;

  return finalUrl;

};

const getAccessToken = (z, bundle) => {
  let url = `${OAUTH_URL}/token`;

  const body = {
    code: bundle.inputData.code,
    refresh_token: bundle.authData.refresh_token,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code refresh_token',
    response_type: 'token id_token',
  };

  const promise = z.request(url, {
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'), 
    },
  });

  return promise.then((response) => {
    if (response.status !== 200) {
      throw new Error('Unable to fetch access token: ' + response.content);
    }

    const result = z.JSON.parse(response.content);
    z.console.log('Result of auth: ' , result);
    
    return {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      id_token: result.id_token,
    };
  });
};

const refreshAccessToken = (z, bundle) => {
  let url = `${OAUTH_URL}/token`;

  const body = {
    code: bundle.inputData.code,
    refresh_token: bundle.authData.refresh_token,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code refresh_token',
    response_type: 'token id_token',
  };

  const promise = z.request(url, {
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'), 
    },
  });

  return promise.then((response) => {
    if (response.status !== 200) {
      throw new Error('Unable to fetch access token: ' + response.content);
    }

    const result = z.JSON.parse(response.content);
    z.console.log('Result of auth: ' , result);
    
    return {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      id_token: result.id_token,
    };
  });
};

// The test call Zapier makes to ensure an access token is valid
// UX TIP: Hit an endpoint that always returns data with valid credentials,
// like a /profile or /me endpoint. That way the success/failure is related to
// the token and not because the user didn't happen to have a recently created record.
const testAuth = (z) => {
  const promise = z.request({
    url: `https://platformdev.cloud.coveo.com/rest/templates/apikeys`,
  });

  return promise.then((response) => {
    if (response.status === 401) {
      throw new Error('The access token you supplied is not valid');
    }
    return z.JSON.parse(response.content);
  });
};

module.exports = {
  type: 'oauth2',
  connectionLabel: 'Coveo Cloud V2',
  //oauth2Config data structure is how Zapier determines what to call when managing the ouath. The authorization url construction is
  //called when needed in authorizeUrl, whenever a access/refresh token is needed it calls getAccessToken, and whenever a 401 error occurs
  //it knows to call autoRefresh (which calls refreshAccessToken).
  oauth2Config: {
    authorizeUrl: getAuthorizeURL,
    getAccessToken,
    refreshAccessToken,
    // Set so Zapier automatically checks for 401s and calls refreshAccessToken
    autoRefresh: true,
  },
  test: testAuth,
};
