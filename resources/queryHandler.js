'use strict';

const platform = require('../config').PLATFORM;

//This functions handles the query call to Coveo, then
//sends off the result to the output handler.
const handleQuery = (z, bundle) => {

  //Construct query call to Coveo
  const responsePromise = z.request({
    url: `https://${platform}/rest/search/v2/`,
    method: 'GET',
    params: bundle.inputData,
    headers:{
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  //Handle response info
  return responsePromise.then((response) => {

    //Handle errors that can occur
    if(response.status !== 200){
      throw new Error('Error sending query request to Coveo: ' + z.JSON.parse(response.content).message + ' Error Code: ' + response.status);
    }

    //Get the important parts of the response that we want
    let results = z.JSON.parse(response.content).results;

    //Delete some of the extra info to make sorting through it
    //easier in the output function.
    results.forEach(document => {
      delete document.raw;
    });

    //Send to output handler
    return queryOutput(bundle, results);
  });

};


//This function handles the output te user will see on Zapier.
//Only extract the important components of each document the was fetched
//for the user, like title and url.
const queryOutput = (bundle, results) => {
  const documents = {};
  const docs = [];

  //If no results were found, nothing matched the query.
    if(!results.length){

        //Tell the user no documents found, give them the
        //input the gave, then return.
        documents['No Documents Found'] = 'No documents matching your query were found';
        Object.assign(documents, bundle.inputData);
        docs.push(documents);
        return docs;
    }

  //For each item that was returned
  results.forEach((item, i) => {

    let docInfo = {};

    //Sort through the keys of each item object in the returned array response
    Object.keys(item).forEach(key => {

      //These are the really only good keys returned that the user may find useful for their output on Zapier.
      //Filter out the others and save these. Number them to differentiate them on Zapier.
      if(key === 'title' || key === 'clickUri' || key === 'excerpt'){
        docInfo[key + ' #' + (i + 1)] = item[key];
      }

    });

    //Assign the desired key values 
    Object.assign(documents, docInfo);
  });

  //Assign what the user input, save the desired values from the response then return
  Object.assign(documents, bundle.inputData);
  docs.push(documents);
  return docs;
};

module.exports = {
  handleQuery,
};