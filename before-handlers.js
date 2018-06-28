'use strict';

const includeBearerToken = (request, z, bundle) => {

  if(bundle.authData.access_token && z.JSON.stringify(request.headers).includes('x-amz-server-side-encryption') === false){

    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;

  }

  return request;

};


module.exports = {

  includeBearerToken,

};
