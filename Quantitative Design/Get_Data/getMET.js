const fs = require("fs");
var request = require("request");
var async = require('async')
var objectBaseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';

var departmentBaseURL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=' + '1';

let metData = [];
let requestData = [];

// fetch a query
// request(objectBaseUrl, function(error, response, body){
//     if (!error && response.statusCode == 200) {
//         body = JSON.parse(body);
//         fs.writeFileSync('data/metIDs.json', JSON.stringify(body.objectIDs));
//     }
// });

// from the response, fetch objects
fs.readFile('METerrors_get.json', (error, data) => {
    if (error) console.log(error);
    
    var ids = JSON.parse(data);
    console.log("ID File Read");
    
    async.eachSeries(ids, function(value, callback) {
        
        let apiRequest = objectBaseUrl + value;
        console.log("getting MET Object");

        request(apiRequest, function(err, resp, body) {
            if (err) {fs.appendFileSync('METerrors.json', JSON.stringify(value + ','));}
            else {
                var object = JSON.parse(body);
                console.log(object);
                fs.appendFileSync('METData.json', JSON.stringify(object));
                fs.appendFileSync('data/fetchedMETids.json', JSON.stringify(value + ','));
            }
        });
        setTimeout(callback, 100);
    }, function() {
         //fs.writeFileSync('METData.json', JSON.stringify(metData));
        // fs.writeFileSync('data/first.json', JSON.stringify(meetingsData));
        // console.log('*** *** *** *** ***');
        // console.log('Number of meetings in this zone: ');
        // console.log(meetingsData.length);
    });
});
