'use strict';

const includeBearerToken = (request, z, bundle) => {

        if(bundle.authData.access_token){

                request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;

        }

        return request;

};


module.exports = {

	includeBearerToken

};
