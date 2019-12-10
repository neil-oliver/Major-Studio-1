var fs = require('fs');
var async = require('async');

// exclusion lists for artwork titles & artist names
var titleExclusions = [
        "fragment",
        "Fragment",
        "untitled",
        "Untitled"
    ];

var nameExclusions = [
        "unknown",
        "Unknown",
        "group",
        "Group",
        "Co.",
        "Company",
        "Manufactory",
        "Manufactoring"
    ];
    
function makeAJList(){
    // variable for the adjacency list. It will contain a list of key:value pairs for example where each value would be an actual name, place or date (ie it would not say city it would say 'New York')
    // ObjectID : [artistBeginDate, city]
    // city : [objectID]
    // artistbeginDate : [objectID]
    var AJList = {};
    // read all of the files before any processing begins.
    console.log('starting to create Adjacency List');
    // downloaded and saved MET information from the API
    fs.readFile('reducedMETobjects.json', (error, data) => {
        if (error) console.log(error);
        data = JSON.parse(data);

        // a list of all of the tags and a count of how many times they are used.
        fs.readFile('MetTagListandCounts.json', (error, tagCount) => {
            if (error) console.log(error);
            tagCount = JSON.parse(tagCount);
            
            // A file created by myself which counted all of the indivdual mediums and how many times they are used.
            fs.readFile('mediumsCount.json', (error, mediumCount) => {
                if (error) console.log(error);
                mediumCount = JSON.parse(mediumCount);
                
                // a file with conversions from nationalities to countries.
                fs.readFile('nationalities.json', (error, natCountry) => {
                    if (error) console.log(error);
                    natCountry = JSON.parse(natCountry);
                    
                    // start looping through each object in the allMET.json file
                    async.eachSeries(data, function(value, callback) {

                        if (true){ // optional //value.isHighlight == true
                            if (true){ // optional // value.primaryImageSmall != ''

                                // check for a title, no item will be added without a title
                                if (value.title){
                                    // check for artist display name, no item will be added without an artist name
                                    if (value.artistDisplayName){
                                        // check the title against exclusion list
                                        if (!(titleExclusions.some(function(v) { return value.title.indexOf(v) >= 0; }))) {
                                            // add the object (artwork) to the adjacency list
                                            if (value.objectID && !AJList.hasOwnProperty('objectID-'+value.objectID)) {
                                                AJList['objectID-'+value.objectID] = [];
                                            }

                                            if (value.artistDisplayName){
                                                // check the artist name against exclusion list
                                                if (!(nameExclusions.some(function(v) { return value.artistDisplayName.indexOf(v) >= 0; }))){
                                                    // add the artists name to the objectID entry in the adjacency list
                                                    AJList['objectID-'+value.objectID].push('artistDisplayName-'+value.artistDisplayName);
                                                    // check if the artist name is already in the adjacency list, if not then add it and link to the object (artwork) it came from
                                                    if (AJList.hasOwnProperty('artistDisplayName-'+value.artistDisplayName)) {
                                                        AJList['artistDisplayName-'+value.artistDisplayName].push('objectID-'+value.objectID);
                                                    } else{
                                                        AJList['artistDisplayName-'+value.artistDisplayName] = ['objectID-'+value.objectID];
                                                    }
                                                }
                                            }
                                            
                                            // repeat process as above but without the exclusion list
                                            if (value.artistBeginDate){
                                                AJList['objectID-'+value.objectID].push('artistBeginDate-'+value.artistBeginDate);
                                                if (AJList.hasOwnProperty('artistBeginDate-'+value.artistBeginDate)) {
                                                    AJList['artistBeginDate-'+value.artistBeginDate].push('objectID-'+value.objectID);
                                                } else{
                                                    AJList['artistBeginDate-'+value.artistBeginDate] = ['objectID-'+value.objectID];
                                                }
                                            }
                                    
                                             if (value.artistEndDate){
                                                // additional check that the date is not set to 9999 i.e. an unknown date
                                                if (value.artistEndDate != '9999'){
                                                    AJList['objectID-'+value.objectID].push('artistEndDate-'+value.artistEndDate);
                                                    if (AJList.hasOwnProperty('artistEndDate-'+value.artistEndDate)) {
                                                        AJList['artistEndDate-'+value.artistEndDate].push('objectID-'+value.objectID);
                                                    } else{
                                                        AJList['artistEndDate-'+value.artistEndDate] = ['objectID-'+value.objectID];
                                                    }
                                                }
                                            }
                                    
                                            if (value.objectBeginDate){
                                                AJList['objectID-'+value.objectID].push('objectBeginDate-'+value.objectBeginDate);
                                                if (AJList.hasOwnProperty('objectBeginDate-'+value.objectBeginDate)) {
                                                    AJList['objectBeginDate-'+value.objectBeginDate].push('objectID-'+value.objectID);
                                                } else{
                                                    AJList['objectBeginDate-'+value.objectBeginDate] = ['objectID-'+value.objectID];
                                                }
                                            }
                                            
                                            if (value.city){
                                                AJList['objectID-'+value.objectID].push('city-'+value.city);
                                                if (AJList.hasOwnProperty('city-'+value.city)) {
                                                    AJList['city-'+value.city].push('objectID-'+value.objectID);
                                                } else{
                                                    AJList['city-'+value.city] = ['objectID-'+value.objectID];
                                                }
                                            }
                                            
                                            if (value.excavation){
                                                AJList['objectID-'+value.objectID].push('excavation-'+value.excavation);
                                                if (AJList.hasOwnProperty('excavation-'+value.excavation)) {
                                                    AJList['excavation-'+value.excavation].push('objectID-'+value.objectID);
                                                } else{
                                                    AJList['excavation-'+value.excavation] = ['objectID-'+value.objectID];
                                                }
                                            }
                                            
                                            if (value.artistNationality){
                                                //check to see if the nationality can be converted to a country before adding. 
                                                if (natCountry[value.artistNationality]){
                                                    AJList['objectID-'+value.objectID].push('artistNationality-'+natCountry[value.artistNationality]);
                                                    if (AJList.hasOwnProperty('artistNationality-'+natCountry[value.artistNationality])) {
                                                        AJList['artistNationality-'+natCountry[value.artistNationality]].push('objectID-'+value.objectID);
                                                    } else{
                                                        AJList['artistNationality-'+natCountry[value.artistNationality]] = ['objectID-'+value.objectID];
                                                    }
                                                }
                                            }
                                            
                                            // use the count of the different mediums to exclude the most popular (i.e watercolor) mediums.
                                            if (value.medium){
                                                // double check for any unknown mediums before adding to the list
                                                if (mediumCount[value.medium] >49 && value.medium != 'Unknown') {
                                                } else {
                                                    if (!(value.title.includes(value.medium))) {
                                                        AJList['objectID-'+value.objectID].push('medium-'+value.medium);
                                                        if (AJList.hasOwnProperty('medium-'+value.medium)) {
                                                            AJList['medium-'+value.medium].push('objectID-'+value.objectID);
                                                        } else{
                                                            AJList['medium-'+value.medium] = ['objectID-'+value.objectID];
                                                        }
                                                    }
                                                }
                                            }
                                            
                                            // tags come in an array for each object, so loop through each of the tags and evaluate them separately
                                            for (let i=0; i< value.tags.length; i++ ) {
                                                if (value.tags[i]){
                                                    // use the tags list to exclude popular tags (i.e men)
                                                    if (tagCount[value.tags[i]] >999) {
                                                    } else {
                                                        if (!(value.title.includes(value.tags[i]))) {
                                                            AJList['objectID-'+value.objectID].push('tags-'+value.tags[i]);
                                                            if (AJList.hasOwnProperty('tags-'+value.tags[i])) {
                                                                AJList['tags-'+value.tags[i]].push('objectID-'+value.objectID);
                                                            } else {
                                                                AJList['tags-'+value.tags[i]] = ['objectID-'+value.objectID];
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        setTimeout(callback, 0);
                    }, function() {
                        // write the adjacency list ot a file
                        fs.writeFileSync('AJList.json', JSON.stringify(AJList));
                        console.log('Graphed it!');
                        // call the getKeys function 
                        getKeys();
                    });
                });
            });
        });
    });
}

// a simple function to key all of the keys for the key value pairs stored in the adjacency list.
function getKeys(){
    var keys = [];
    console.log('getting keys');
    // read the recently saved adjacency list
    fs.readFile('AJList.json', (error, data) => {
        if (error) console.log(error);
        data = JSON.parse(data);
        
        async.forEachOf(data, function(value,key, callback) {
            // loop through and add each key to an array
            keys.push(key);
            setTimeout(callback, 0);
        }, function() {
            // save the keys file.
            fs.writeFileSync('keys.json', JSON.stringify(keys));
            console.log('got the keys!');
        });
    });
}



//////////////////////////////////////////////////////////
makeAJList();


