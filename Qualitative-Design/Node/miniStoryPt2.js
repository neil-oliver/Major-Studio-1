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
        "Group"
    ];
    
function makeAJList(){
    var AJList = {};
    console.log('starting to create Adjacency List');
    fs.readFile('allMET.json', (error, data) => {
        if (error) console.log(error);
        data = JSON.parse(data);
        fs.readFile('miniAJList.json', (error, ajlist) => {
            if (error) console.log(error);
            AJList = JSON.parse(ajlist);
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
        
                                                if (value.artistDisplayName){
                                                    if (!(nameExclusions.some(function(v) { return value.artistDisplayName.indexOf(v) >= 0; }))){
                                                        if (AJList.hasOwnProperty('artistDisplayName-'+value.artistDisplayName)) {
                                                            AJList['artistDisplayName-'+value.artistDisplayName].push('title-'+value.title);
                                                        } else{
                                                        }
                                                    }
                                                }
                                                
                                                if (value.artistBeginDate){
                                                    if (AJList.hasOwnProperty('artistBeginDate-'+value.artistBeginDate)) {
                                                        AJList['artistBeginDate-'+value.artistBeginDate].push('title-'+value.title);
                                                    } else{
                                                    }
                                                }
                                        
                                                 if (value.artistEndDate){
                                                    if (value.artistEndDate != '9999'){
                                                        if (AJList.hasOwnProperty('artistEndDate-'+value.artistEndDate)) {
                                                            AJList['artistEndDate-'+value.artistEndDate].push('title-'+value.title);
                                                        } else{
                                                        }
                                                    }
                                                }
                                        
                                                if (value.objectBeginDate){
                                                    if (AJList.hasOwnProperty('objectBeginDate-'+value.objectBeginDate)) {
                                                        AJList['objectBeginDate-'+value.objectBeginDate].push('title-'+value.title);
                                                    } else{
                                                    }
                                                }
                                                
                                                if (value.city){
                                                    if (AJList.hasOwnProperty('city-'+value.city)) {
                                                        AJList['city-'+value.city].push('title-'+value.title);
                                                    } else{
                                                    }
                                                }
                                                
                                                if (value.excavation){
                                                    if (AJList.hasOwnProperty('excavation-'+value.excavation)) {
                                                        AJList['excavation-'+value.excavation].push('title-'+value.title);
                                                    } else{
                                                    }
                                                }
                                                
                                                if (value.artistNationality){
                                                    if (natCountry[value.artistNationality]){
                                                        if (AJList.hasOwnProperty('artistNationality-'+natCountry[value.artistNationality])) {
                                                            AJList['artistNationality-'+natCountry[value.artistNationality]].push('title-'+value.title);
                                                        } else{
                                                        }
                                                    }
                                                }
                                                
                                                // use the count of the different mediums to exclude the most popular (i.e watercolor) mediums.
                                                if (value.medium){
                                                    if (mediumCount[value.medium] >49) {
                                                    } else {
                                                        if (!(value.title.includes(value.medium))) {
                                                            if (AJList.hasOwnProperty('medium-'+value.medium)) {
                                                                AJList['medium-'+value.medium].push('title-'+value.title);
                                                            } else{
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
                                                                if (AJList.hasOwnProperty('tags-'+value.tags[i])) {
                                                                    AJList['tags-'+value.tags[i]].push('title-'+value.title);
                                                                } else {
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
                            fs.writeFileSync('miniAJList.json', JSON.stringify(AJList));
                            console.log('mini Graphed it!');
                        });
                    });
                });
            });
        });
    });
}

makeAJList();