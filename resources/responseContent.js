'use strict';

const utils = require('../utils');
const handleError = utils.handleError;

const getOrgInfo = (z, bundle) => {

    const orgInfo ={
        orgName: '',
        orgSources: [],
    }

    const promise = z.request({

        url: `https://platformdev.cloud.coveo.com/rest/organizations/${bundle.inputData.orgId}/sources`,
        method: 'GET',
        body: {
            organizationId: bundle.inputData.orgId,
        },
        params: {
            organizationId: bundle.inputData.orgId,
        },

    });

    return promise.then((response) => {

        if(response.status >= 400){
            throw new Error('Error getting source details: ' + response.content);
        }

        const result = z.JSON.parse(response.content);

        for(var i = 0; i < result.length; i++){
            orgInfo.orgSources.push({'name': result[i].name, 'id': result[i].id, 'owner': result[i].owner});
        }

    })
    .then(() => {

    const newPromise = z.request({

        url : `https://platformdev.cloud.coveo.com/rest/organizations/${bundle.inputData.orgId}`,
        method: 'GET',
        body: {
            organizationId: bundle.inputData.orgId,
        },
        params: {
            organizationId: bundle.inputData.orgId,
        },

    });

    return newPromise.then((response) => {

        if(response.status >= 400){
            throw new Error('Error getting organization details: ' + response.content);
        }

        const result = z.JSON.parse(response.content);
        orgInfo.orgName = result.displayName;

        return orgInfo;

    })
    .then((result) =>{
        return result;
    })
    .catch(handleError);
    })
    .catch(handleError);
};

module.exports ={
    getOrgInfo,
};