'use strict';

// Before any outbound request is made, this function sets the authorization header to the access_token granted by Coveo.
// See below comment for the exceptions.
const includeBearerToken = (request, z, bundle) => {
  // Zapier outbound requests (z.request) will always use this authorization. With Coveo, we always use Bearer, but using
  // AWS creates an error with an authorization header. So, whenever a request is made that includes 'x-amz-server-side-encryption',
  // which always does in the AWS request called, the authorization header won't be made in the AWS request. Also, doesn't default to this
  // if Basic header is being sent for authorization.
  if (!request.headers.Authorization && bundle.authData && bundle.authData.access_token && !z.JSON.stringify(request.headers).includes('x-amz-server-side-encryption')) {
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
  }

  return request;
};

module.exports = {
  includeBearerToken,
};
