var fs = require('fs');
var async = require('async');

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
        "Company"
    ];
    
function makeAJList(){
    var AJList = {};
    console.log('starting to create Adjacency List');
    fs.readFile('allMET.json', (error, data) => {
        if (error) console.log(error);
        data = JSON.parse(data);
        fs.readFile('MetTagListandCounts.json', (error, tagCount) => {
            if (error) console.log(error);
            tagCount = JSON.parse(tagCount);
            
            fs.readFile('mediumsCount.json', (error, mediumCount) => {
                if (error) console.log(error);
                mediumCount = JSON.parse(mediumCount);
                
                fs.readFile('nationalities.json', (error, natCountry) => {
                    if (error) console.log(error);
                    natCountry = JSON.parse(natCountry);
                    
                    async.eachSeries(data, function(value, callback) {

                        if (true){ // optional //value.isHighlight == true
                            if (true){ // optional // value.primaryImageSmall != ''

                                if (value.title){
                                    if (value.artistDisplayName){
                                        if (!(titleExclusions.some(function(v) { return value.title.indexOf(v) >= 0; }))) {
    
                                            if (value.objectID && !AJList.hasOwnProperty('objectID-'+value.objectID)) {
                                                AJList['objectID-'+value.objectID] = [];
                                            }
                                            
                                            if (value.artistDisplayName){
                                                if (!(nameExclusions.some(function(v) { return value.artistDisplayName.indexOf(v) >= 0; }))){
                                                    AJList['objectID-'+value.objectID].push('artistDisplayName-'+value.artistDisplayName);
                                                    if (AJList.hasOwnProperty('artistDisplayName-'+value.artistDisplayName)) {
                                                        AJList['artistDisplayName-'+value.artistDisplayName].push('objectID-'+value.objectID);
                                                    } else{
                                                        AJList['artistDisplayName-'+value.artistDisplayName] = ['objectID-'+value.objectID];
                                                    }
                                                }
                                            }
                                            
                                            if (value.artistBeginDate){
                                                AJList['objectID-'+value.objectID].push('artistBeginDate-'+value.artistBeginDate);
                                                if (AJList.hasOwnProperty('artistBeginDate-'+value.artistBeginDate)) {
                                                    AJList['artistBeginDate-'+value.artistBeginDate].push('objectID-'+value.objectID);
                                                } else{
                                                    AJList['artistBeginDate-'+value.artistBeginDate] = ['objectID-'+value.objectID];
                                                }
                                            }
                                    
                                             if (value.artistEndDate){
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
                                
                                            // use the tags list to exclude popular tags (i.e men)
                                            for (let i=0; i< value.tags.length; i++ ) {
                                                if (value.tags[i]){
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
                        fs.writeFileSync('AJList.json', JSON.stringify(AJList));
                        console.log('Graphed it!');
                        getKeys();
                    });
                });
            });
        });
    });
}

function getKeys(){
    var keys = [];
    console.log('getting keys');
    fs.readFile('AJList.json', (error, data) => {
        if (error) console.log(error);
        data = JSON.parse(data);
        
        async.forEachOf(data, function(value,key, callback) {
            keys.push(key);
            setTimeout(callback, 0);
        }, function() {
            fs.writeFileSync('keys.json', JSON.stringify(keys));
            console.log('got the keys!');
        });
    });
}



//////////////////////////////////////////////////////////
makeAJList();


