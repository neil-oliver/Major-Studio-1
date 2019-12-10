var fs = require('fs');
var async = require('async');
    
function makeMetObjects(){
    // variable for the adjacency list. It will contain a list of key:value pairs for example where each value would be an actual name, place or date (ie it would not say city it would say 'New York')
    // ObjectID : [artistBeginDate, city]
    // city : [objectID]
    // artistbeginDate : [objectID]
    var objects = {};
    // read all of the files before any processing begins.
    console.log('starting to create objects');
    // downloaded and saved MET information from the API
    fs.readFile('allMET.json', (error, data) => {
        if (error) console.log(error);
            data = JSON.parse(data);
            async.eachSeries(data, function(value, callback) {
            objects[value.objectID] = value
            setTimeout(callback, 0);
        }, function() {
            // write the adjacency list ot a file
            fs.writeFileSync('metObjects.json', JSON.stringify(objects));
            console.log('saved objects!');
        });
    });
}

//////////////////////////////////////////////////////////
makeMetObjects();


