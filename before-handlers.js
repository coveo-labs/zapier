'use strict';

const includeBearerToken = (request, z, bundle) => {

        if(bundle.authData.access_token && z.JSON.stringify(request.url).includes('amazon') === false ){

                request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;

        }

        return request;

};


module.exports = {

	includeBearerToken

};
