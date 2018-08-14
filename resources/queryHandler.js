'use strict';

const platform = require('../config').PLATFORM;
const handleError = require('../utils').handleError;

//This functions handles the query call to Coveo, then
//sends off the result to the output handler.
const handleOrgQuery = (z, bundle) => {

//   if(!bundle.inputData.organizationId){
//       return handleSupportQuery(z, bundle);
//   }

  //Construct query call to Coveo
  const orgQueryPromise = z.request({
    url: `https://${platform}/rest/search/v2/`,
    method: 'GET',
    params: bundle.inputData,
    headers:{
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  //Handle response info
  return orgQueryPromise.then((response) => {

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
  })
  .catch(handleError);

};

// const handleSupportQuery = (z, bundle) => {

//     const supportPromise = z.request({
//         url: `https://support.coveo.com/s/`,
//         method: 'GET',
//         params: {
//             q: encodeURI(bundle.inputData.lq),
//         },
//         headers:{
//             'Content-Type': 'application/json',
//             Accept: 'application/json',
//           },
//     });

//     return supportPromise.then((response) => {

//         if(response.status !== 200){
//             throw new Error('Error fetching support documents. Error Code: ' + response.status);
//         }

//         const result = [];
//         result.push(response);
//         return result;

//     })

// };

//This function handles the output te user will see on Zapier.
//Only extract the important components of each document the was fetched
//for the user, like title and url.
const queryOutput = (bundle, results) => {
  const documents = {};
  //give the user plain text an html of all the document information, so they don't have 
  //to use so many inputs to get it all.
  let html = `<html><head><title>Results For The "${bundle.inputData.lq}" Query</title></head><body>`;
  let text = `Results For The "${bundle.inputData.lq}" Query\n\n`;
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
    let docInfoHTML = '';
    let docInfoTXT = '';

    //Sort through the keys of each item object in the returned array response
    Object.keys(item).forEach(key => {

      //These are the really only good keys returned that the user may find useful for their output on Zapier.
      //Filter out the others and save these. Number them to differentiate them on Zapier.
      if(key === 'Title' || key === 'ClickUri' || key === 'Excerpt'){
          if(key === 'ClickUri'){
            let tempKey = 'Url';
            documents['Document #' + (i + 1) + ' Url'] = item[key];
            docInfoHTML += `<div>${tempKey}: ${item[key].link(item[key])}</div>`;
            docInfoTXT += `${tempKey}: ${item[key]}\n`;
          } else {
            documents['Document #' + (i + 1) + ' ' + key] = item[key];
            docInfoHTML += `<div>${key}: ${item[key]}</div>`;
            docInfoTXT += `${key}: ${item[key]}\n`;
          }
      }
    });

    text += '\nDocument #' + (i + 1) + ':\n' + docInfoTXT;
    text += '\n';
    html += '\nDocument #' + (i + 1) + ':\n' + docInfoHTML;
    html += '<br></br>\n';
  });

  //Assign what the user input, save the desired values from the response then return
  html += '</body></html>';
  documents['Documents HTML'] = html;
  documents['Documents Text'] = text;
  Object.assign(documents, bundle.inputData);

//   if(documents.organizationId === 'coveosearch'){
//       delete documents.organizationId;
//   }

  docs.push(documents);
  return docs;
};

module.exports = {
  handleOrgQuery,
};