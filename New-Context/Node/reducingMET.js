var fs = require('fs');
var async = require('async');
var titleExclusions = [
    "fragment",
    "Fragment",
    "untitled",
    "Untitled"
];

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
            // a file with conversions from nationalities to countries.
            fs.readFile('nationalities.json', (error, natCountry) => {
                if (error) console.log(error);
                natCountry = JSON.parse(natCountry);
                var counter = 0;
                async.eachSeries(data, function(value, callback) {
                    if (!(titleExclusions.some(function(v) { return value.title.indexOf(v) >= 0; }))) {
                        if (value.artistDisplayName){
                            if (value.objectBeginDate){
                                if (value.primaryImageSmall){

                                    objects[value.objectID] = {
                                        'objectID' : value.objectID,
                                        'primaryImageSmall' : value.primaryImageSmall,
                                        'artistDisplayName' : value.artistDisplayName,
                                        'title' : value.title,
                                        'artistBeginDate' : value.artistBeginDate,
                                        'artistEndDate' : value.artistEndDate,
                                        'artistNationality' : value.artistNationality,
                                        'objectBeginDate' : value.objectBeginDate,
                                        'city' : value.city,
                                        'excavation' : value.excavation,
                                        'medium' : value.medium,
                                        'tags' : value.tags
                                    }
                                    if (natCountry[value.artistNationality]){
                                        objects[value.objectID]['artistNationality'] = natCountry[value.artistNationality]
                                    }
                                    counter ++
                                    console.log(counter)
                                }
                            }
                        }
                    }
                setTimeout(callback, 0);
            }, function() {
                // write the adjacency list ot a file
                fs.writeFileSync('reducedMETobjects.json', JSON.stringify(objects));
                console.log('saved objects!');
            });
        });
    });
}

//////////////////////////////////////////////////////////
makeMetObjects();


