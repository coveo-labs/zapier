'use strict';

const handleError = require('../utils').handleError;
const platform = require('../config').PLATFORM;
const message = require('../messages');

//This is a hidden trigger, meaning it acts like a trigger would (making calls to Coveo to get information)
//without the trigger actual showing up in the app. This allows me to create dynamic drop downs for the input users
//have to input for fields to push content to. This reduces errors and is a much better user experience. This specific function
//gets the possible organizations the user has access to, puts the org Id as the input value, and displays the org name in a readable format.
const perform = z => {
  //Request to Coveo to get organizations user has access to.
  const orgChoicesPromise = z.request({
    url: `https://${platform}/rest/organizations/`,
    method: 'GET',
  });

  //Handle response
  return orgChoicesPromise
    .then(response => {
      if (response.status >= 400) {
        throw new Error(
          'Error getting organization choices for the drop down. Please ensure you have access to at least one organization: ' +
            z.JSON.parse(response.content).message +
            ' Error Code: ' +
            response.status
        );
      }

      let results = z.JSON.parse(response.content);
      if (!results.map) {
        // make sure it's an array
        results = [];
      }

      //Only wants org ids and names from this call
      results = results.map(r => ({ id: r.id, displayName: r.displayName }));

      //Make sure that the user has access to some organization in the platform
      //with the connected account, if not throw an error
      if (!results.length) {
        throw new Error(message.NO_ORGS);
      }

      return results;
    })
    .catch(handleError);
};

module.exports = {
  key: 'orgChoices',
  noun: 'Orgs',

  display: {
    label: 'List of Organizations',
    description: 'Hidden trigger in the app responsible for dynamic drop down',
    hidden: true, //Makes the trigger hidden. Don't remove.
  },

  operation: {
    perform,
    canPaginate: true, //In case the number of results is very high, allows for the results to be displayed in pages
  },
};
