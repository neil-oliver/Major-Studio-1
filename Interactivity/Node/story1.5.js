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
                        var weight = 1;

                        if (true){ // optional //value.isHighlight == true
                            if (true){ // optional // value.primaryImageSmall != ''

                                // check for a title, no item will be added without a title
                                if (value.title){
                                    // check for artist display name, no item will be added without an artist name
                                    if (value.artistDisplayName){
                                        // check the title against exclusion list
                                        if (!(titleExclusions.some(function(v) { return value.title.indexOf(v) >= 0; }))) {
                                            // add the object (artwork) to the adjacency list
                                            if (value.objectID && !AJList.hasOwnProperty('ID-'+value.objectID)) {
                                                AJList['ID-'+value.objectID] = [];
                                            }

                                            if (value.artistDisplayName){
                                                // check the artist name against exclusion list
                                                if (!(nameExclusions.some(function(v) { return value.artistDisplayName.indexOf(v) >= 0; }))){
                                                    // add the artists name to the objectID entry in the adjacency list
                                                    AJList['ID-'+value.objectID].push(['artist-'+value.artistDisplayName,'artistDisplayName',value.artistDisplayName,weight]);
                                                    // check if the artist name is already in the adjacency list, if not then add it and link to the object (artwork) it came from
                                                    if (AJList.hasOwnProperty('artist-'+value.artistDisplayName)) {
                                                        AJList['artist-'+value.artistDisplayName].push(['ID-'+value.objectID,'objectID',value.objectID,weight]);
                                                    }else{
                                                        AJList['artist-'+value.artistDisplayName] = [['ID-'+value.objectID,'objectID',value.objectID,weight]];
                                                    }

                                                    // continue to add artist details
                                                    if (value.artistBeginDate){
                                                        AJList['artist-'+value.artistDisplayName].push(['date-'+value.artistBeginDate,'artistBeginDate',value.artistBeginDate,weight]);
                                                        if (AJList.hasOwnProperty('date-'+value.artistBeginDate)) {
                                                            AJList['date-'+value.artistBeginDate].push(['artist-'+value.artistDisplayName,'artistDisplayName',value.artistDisplayName,weight]);
                                                        }else{
                                                            AJList['date-'+value.artistBeginDate] = [['artist-'+value.artistDisplayName,'artistDisplayName',value.artistDisplayName,weight]];
                                                        }
                                                    }
                                            
                                                    if (value.artistEndDate){
                                                        // additional check that the date is not set to 9999 or 1000 years after begin date i.e. an unknown date
                                                        if (value.artistEndDate != '9999' || value.artistEndDate != value.artistBeginDate + 1000){
                                                            AJList['artist-'+value.artistDisplayName].push(['date-'+value.artistEndDate,'artistBeginDate',value.artistEndDate,weight]);
                                                            if (AJList.hasOwnProperty('date-'+value.artistEndDate)) {
                                                                AJList['date-'+value.artistEndDate].push(['artist-'+value.artistDisplayName,'artistDisplayName',value.artistDisplayName,weight]);
                                                            }else{
                                                                AJList['date-'+value.artistEndDate] = [['artist-'+value.artistDisplayName,'artistDisplayName',value.artistDisplayName,weight]];
                                                            }
                                                        }
                                                    }
                                    
                                                    if (value.artistNationality){
                                                        //check to see if the nationality can be converted to a country before adding. 
                                                        if (natCountry[value.artistNationality]){
                                                            AJList['ID-'+value.objectID].push(['location-'+natCountry[value.artistNationality],'artistNationality',natCountry[value.artistNationality],weight]);
                                                            if (AJList.hasOwnProperty('location'+natCountry[value.artistNationality])) {
                                                                AJList['location-'+natCountry[value.artistNationality]].push(['artist-'+value.artistDisplayName,'artistDisplayName',value.artistDisplayName,weight]);
                                                            }else{
                                                                AJList['location-'+natCountry[value.artistNationality]] = [['artist-'+value.artistDisplayName,'artistDisplayName',value.artistDisplayName,weight]];
                                                            }
                                                        }
                                                    }
                                                }
                                            }                                            
                                    
                                            if (value.objectBeginDate){
                                                AJList['ID-'+value.objectID].push(['date-'+value.objectBeginDate,'objectBeginDate',value.objectBeginDate,weight]);
                                                if (AJList.hasOwnProperty('date-'+value.objectBeginDate)) {
                                                    AJList['date-'+value.objectBeginDate].push(['ID-'+value.objectID,'objectID',value.objectID,weight]);
                                                }else{
                                                    AJList['date-'+value.objectBeginDate] = [['ID-'+value.objectID,'objectID',value.objectID,weight]];
                                                }
                                            }
                                            
                                            if (value.city){
                                                AJList['ID-'+value.objectID].push(['location-'+value.city,'city',value.city,weight]);
                                                if (AJList.hasOwnProperty('location-'+value.city)) {
                                                    AJList['location-'+value.city].push(['ID-'+value.objectID,'objectID',value.objectID,weight]);
                                                }else{
                                                    AJList['location-'+value.city] = [['ID-'+value.objectID,'objectID',value.objectID,weight]];
                                                }
                                            }
                                            
                                            if (value.excavation){
                                                AJList['ID-'+value.objectID].push(['location-'+value.excavation,'excavation',value.excavation,weight]);
                                                if (AJList.hasOwnProperty('location-'+value.excavation)) {
                                                    AJList['location-'+value.excavation].push(['ID-'+value.objectID,'objectID',value.objectID,weight]);
                                                }else{
                                                    AJList['location-'+value.excavation] = [['ID-'+value.objectID,'objectID',value.objectID,weight]];
                                                }
                                            }
                                            
                                            // use the count of the different mediums to exclude the most popular (i.e watercolor) mediums.
                                            if (value.medium){
                                                // double check for any unknown mediums before adding to the list
                                                if (mediumCount[value.medium] >49 && value.medium != 'Unknown') {
                                                } else {
                                                    if (!(value.title.includes(value.medium))) {
                                                        AJList['ID-'+value.objectID].push(['description-'+value.medium,'medium',value.medium,weight]);
                                                        if (AJList.hasOwnProperty('description-'+value.medium)) {
                                                            AJList['description-'+value.medium].push(['ID-'+value.objectID,'objectID',value.objectID,weight]);
                                                        } else{
                                                            AJList['description-'+value.medium] = [['ID-'+value.objectID,'objectID',value.objectID,weight]];
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
                                                            AJList['ID-'+value.objectID].push(['description-'+value.tags[i],'tags',value.tags[i],weight]);
                                                            if (AJList.hasOwnProperty('description-'+value.tags[i])) {
                                                                AJList['description-'+value.tags[i]].push(['ID-'+value.objectID,'objectID',value.objectID,weight]);
                                                            } else {
                                                                AJList['description-'+value.tags[i]] = [['ID-'+value.objectID,'objectID',value.objectID,weight]];
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
                        fs.writeFileSync('AJList-update.json', JSON.stringify(AJList));
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


