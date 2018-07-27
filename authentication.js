'use strict';

const config = require('./config');
const OAUTH_URL = `https://${config.PLATFORM}/oauth`;

let basicToken = Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64');

module.exports = {
  type: 'oauth2',
  connectionLabel: '(your-email-here)',
  // oauth2Config data structure is how Zapier determines what to call when managing the oauth. The authorization url construction is
  // called when needed in authorizeUrl, whenever a access/refresh token is needed it calls getAccessToken, and whenever a 401 error occurs
  // it knows to call autoRefresh (which calls refreshAccessToken).

  // See the following:
  // https://zapier.com/developer/documentation/v2/oauth-v2/
  // https://zapier.github.io/zapier-platform-cli/?utm_source=zapier.com&utm_medium=referral&utm_campaign=zapier#oauth2

  oauth2Config: {
    authorizeUrl: {
      method: 'GET',
      url: `${OAUTH_URL}/authorize`,
      params: {
        client_id: process.env.CLIENT_ID,
        redirect_uri: config.REDIRECT_URI,
        response_type: 'code id_token',
        scope: 'full',
      },
    },

    getAccessToken: {
      method: 'POST',
      url: `${OAUTH_URL}/token`,
      body: {
        code: '{{bundle.inputData.code}}',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: config.REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicToken}`,
      },
    },

    refreshAccessToken: {
      method: 'POST',
      url: `${OAUTH_URL}/token`,
      body: {
        code: '{{bundle.inputData.code}}',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: config.REDIRECT_URI,
        grant_type: 'refresh_token',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicToken}`,
      },
    },

    // Set so Zapier automatically checks for 401s and calls refreshAccessToken
    autoRefresh: true,
  },

  // The test call Zapier makes to ensure an access token is valid
  // UX TIP: Hit an endpoint that always returns data with valid credentials,
  // like a /profile or /me endpoint. That way the success/failure is related to
  // the token and not because the user didn't happen to have a recently created record.
  test: {
    url: `https://${config.PLATFORM}/rest/organizations`,
  },
};
