'use strict';

const base64 = require('base-64');

const baseOauthUrl = 'https://platformdev.cloud.coveo.com/oauth';
// To get your OAuth2 redirect URI, run `zapier describe` and update this variable.
// Will looke like 'https://zapier.com/dashboard/auth/oauth/return/App123CLIAPI/'
const redirectUri = 'https://zapier.com/dashboard/auth/oauth/return/App4771CLIAPI/';

const getAuthorizeURL = (z, bundle) => {
  let url = `${baseOauthUrl}/authorize`;

  const urlParts = [
    `client_id=${process.env.CLIENT_ID}`,
    `redirect_uri=${encodeURIComponent(bundle.inputData.redirect_uri)}`,
    'response_type=code',
    'scope=full',
    `state=${bundle.inputData.state}`,
  ];

  const finalUrl = `${url}?${urlParts.join('&')}`;

  z.console.log('Authorization Url: ' + finalUrl);

  return finalUrl;

};

const getAccessToken = (z, bundle) => {
  let url = `${baseOauthUrl}/token`;

  const body = {
    code: bundle.inputData.code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  };

  const promise = z.request(url, {
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${base64.encode(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET)}`
    }
  });

  return promise.then((response) => {
    if (response.status !== 200) {
      throw new Error('Unable to fetch access token: ' + response.content);
    }

    const result = z.JSON.parse(response.content);
    z.console.log(result);
    return {
      access_token: result.access_token,
      refresh_token: result.refresh_token
    };

  });
};

const refreshAccessToken = (z, bundle) => {
  let url = `${baseOauthUrl}/token`;

  const body = {
    code: bundle.inputData.code,
    refresh_token: bundle.authData.refresh_token,
    redirect_uri: redirectUri,
    grant_type: 'refresh_token',
  };

  const promise = z.request(url, {
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${base64.encode(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET)}`
    }
  });

  return promise.then((response) => {
    if (response.status !== 200) {
      throw new Error('Unable to fetch access token: ' + response.content);
    }

    const result = z.JSON.parse(response.content);
    return {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
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
  connectionLabel: '(your email here)',
  oauth2Config: {
    authorizeUrl: getAuthorizeURL,
    getAccessToken,
    refreshAccessToken,
    // Set so Zapier automatically checks for 401s and calls refreshAccessToken
    autoRefresh: true,
    // offline_access is necessary for the refresh_token
  },
  test: testAuth,
};
