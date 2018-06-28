'use strict';

const base64 = require('base-64');
const utils = require('./utils');
const messages = require('./constants');
const fileTooBig = messages.BIG_FILE;
const fileDetails = utils.fileDetails;
const handleError = utils.handleError;
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

  return finalUrl;

};

const getAccessToken = (z, bundle) => {
  let url = `${baseOauthUrl}/token`;

  const body = {
    code: bundle.inputData.code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  };

  const promise = z.request(url, {
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${base64.encode(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET)}`,
    },
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
      'Authorization': `Basic ${base64.encode(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET)}`,
    },
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

//Ignore the fact this function is here, strictly for making testing easier
//Will also split this into two eventually, messy to look at
const createContainerAndUpload = (z, bundle) => {

  let url = `https://${bundle.inputData.platform}/v1/organizations/${bundle.inputData.orgId}/files`;

  const promise = z.request(url, {
    method: 'POST',
    body: {},
    headers: {              
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  return promise.then((response) => {
                
    if(response.status !== 201){              
      throw new Error('Error creating file container: ' + response.content);      
    }
                
    const result = z.JSON.parse(response.content);        
    return result;
        
  })
    .then((result) => {

      let url = result.uploadUri;
      let details = bundle.inputData.content;
      
      const fetchPromise = fileDetails(details);

      fetchPromise.then((body)=>{

        if(body.size > (1000000 * 1024)){
          throw new Error(fileTooBig);
        }
  
        const promise = z.request(url, {
          method: 'PUT',
          body: body.content,
          headers: result.requiredHeaders,
        });

        return promise.then((response) => {
  
          //console.log('Response of uploading to container: ' , response);

          if(response.status != 200) {
            throw new Error('Error uploading file contents to container: ' + response.content);
          }
  
          return result;
  
        })
          .catch(handleError);

      })
        .catch(handleError);
      
    })
    .catch(handleError);
};

module.exports = {
  type: 'oauth2',
  connectionLabel: 'Coveo Cloud V2',
  oauth2Config: {
    authorizeUrl: getAuthorizeURL,
    getAccessToken,
    refreshAccessToken,
    createContainerAndUpload,
    // Set so Zapier automatically checks for 401s and calls refreshAccessToken
    autoRefresh: true,
    // offline_access is necessary for the refresh_token
  },
  test: testAuth,
};
