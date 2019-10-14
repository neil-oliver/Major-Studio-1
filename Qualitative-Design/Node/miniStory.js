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

                        if (value.objectID == 438008){ // optional //value.isHighlight == true
                            if (true){ // optional // value.primaryImageSmall != ''

                                if (value.title){
                                    if (value.artistDisplayName){
                                        if (!(titleExclusions.some(function(v) { return value.title.indexOf(v) >= 0; }))) {
    
                                            if (value.objectID && !AJList.hasOwnProperty('title-'+value.title)) {
                                                AJList['title-'+value.title] = [];
                                            }
                                            
                                            if (value.artistDisplayName){
                                                if (!(nameExclusions.some(function(v) { return value.artistDisplayName.indexOf(v) >= 0; }))){
                                                    AJList['title-'+value.title].push('artistDisplayName-'+value.artistDisplayName);
                                                    if (AJList.hasOwnProperty('artistDisplayName-'+value.artistDisplayName)) {
                                                        AJList['artistDisplayName-'+value.artistDisplayName].push('title-'+value.title);
                                                    } else{
                                                        AJList['artistDisplayName-'+value.artistDisplayName] = ['title-'+value.title];
                                                    }
                                                }
                                            }
                                            
                                            if (value.artistBeginDate){
                                                AJList['title-'+value.title].push('artistBeginDate-'+value.artistBeginDate);
                                                if (AJList.hasOwnProperty('artistBeginDate-'+value.artistBeginDate)) {
                                                    AJList['artistBeginDate-'+value.artistBeginDate].push('title-'+value.title);
                                                } else{
                                                    AJList['artistBeginDate-'+value.artistBeginDate] = ['title-'+value.title];
                                                }
                                            }
                                    
                                             if (value.artistEndDate){
                                                if (value.artistEndDate != '9999'){
                                                    AJList['title-'+value.title].push('artistEndDate-'+value.artistEndDate);
                                                    if (AJList.hasOwnProperty('artistEndDate-'+value.artistEndDate)) {
                                                        AJList['artistEndDate-'+value.artistEndDate].push('title-'+value.title);
                                                    } else{
                                                        AJList['artistEndDate-'+value.artistEndDate] = ['title-'+value.title];
                                                    }
                                                }
                                            }
                                    
                                            if (value.objectBeginDate){
                                                AJList['title-'+value.title].push('objectBeginDate-'+value.objectBeginDate);
                                                if (AJList.hasOwnProperty('objectBeginDate-'+value.objectBeginDate)) {
                                                    AJList['objectBeginDate-'+value.objectBeginDate].push('title-'+value.title);
                                                } else{
                                                    AJList['objectBeginDate-'+value.objectBeginDate] = ['title-'+value.title];
                                                }
                                            }
                                            
                                            if (value.city){
                                                AJList['title-'+value.title].push('city-'+value.city);
                                                if (AJList.hasOwnProperty('city-'+value.city)) {
                                                    AJList['city-'+value.city].push('title-'+value.title);
                                                } else{
                                                    AJList['city-'+value.city] = ['title-'+value.title];
                                                }
                                            }
                                            
                                            if (value.excavation){
                                                AJList['title-'+value.title].push('excavation-'+value.excavation);
                                                if (AJList.hasOwnProperty('excavation-'+value.excavation)) {
                                                    AJList['excavation-'+value.excavation].push('title-'+value.title);
                                                } else{
                                                    AJList['excavation-'+value.excavation] = ['title-'+value.title];
                                                }
                                            }
                                            
                                            if (value.artistNationality){
                                                if (natCountry[value.artistNationality]){
                                                    AJList['title-'+value.title].push('artistNationality-'+natCountry[value.artistNationality]);
                                                    if (AJList.hasOwnProperty('artistNationality-'+natCountry[value.artistNationality])) {
                                                        AJList['artistNationality-'+natCountry[value.artistNationality]].push('title-'+value.title);
                                                    } else{
                                                        AJList['artistNationality-'+natCountry[value.artistNationality]] = ['title-'+value.title];
                                                    }
                                                }
                                            }
                                            
                                            // use the count of the different mediums to exclude the most popular (i.e watercolor) mediums.
                                            if (value.medium){
                                                if (mediumCount[value.medium] >49) {
                                                } else {
                                                    if (!(value.title.includes(value.medium))) {
                                                        AJList['title-'+value.title].push('medium-'+value.medium);
                                                        if (AJList.hasOwnProperty('medium-'+value.medium)) {
                                                            AJList['medium-'+value.medium].push('title-'+value.title);
                                                        } else{
                                                            AJList['medium-'+value.medium] = ['title-'+value.title];
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
                                                            AJList['title-'+value.title].push('tags-'+value.tags[i]);
                                                            if (AJList.hasOwnProperty('tags-'+value.tags[i])) {
                                                                AJList['tags-'+value.tags[i]].push('title-'+value.title);
                                                            } else {
                                                                AJList['tags-'+value.tags[i]] = ['title-'+value.title];
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
}

makeAJList();