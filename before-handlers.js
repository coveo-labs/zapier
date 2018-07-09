'use strict';

const includeBearerToken = (request, z, bundle) => {

  //Zapier outbound requests (z.request) will always use this authorization. With Coveo, we always use Bearer, but using
  //AWS creates an error with an authorization header. So, whenever a request is made that includes 'x-amz-server-side-encryption', 
  //which never occurs in Coveo requests, the authorization header won't be made in the AWS request. Leaves no errors and leaves 
  //authorization handling to AWS.
  if(bundle.authData.access_token && z.JSON.stringify(request.headers).includes('x-amz-server-side-encryption') === false){

    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;

  }

  return request;

};


module.exports = {

  includeBearerToken,

};
