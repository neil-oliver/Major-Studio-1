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

    var saved = false;
    var link = [];

function makeAJList(){
    var AJList = {};
    // read all of the files before any processing begins.
    console.log('starting to create Adjacency List');
    // downloaded and saved MET information from the API
    fs.readFile('reducedMETobjects.json', (error, data) => {
        if (error) console.log(error);
        data = JSON.parse(data);
        //order the data
        arr = Object.entries(data)
        arr.sort((a, b) => a[1].objectBeginDate - b[1].objectBeginDate)

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
                    var count1 = 0
                    // start looping through each object in the allMET.json file
                    async.eachSeries(arr, function(value, callback) {
                        value = value[1]
                        saved = false;
                        link = [];
                        var weight = 1;
                        count1 += 1
                        if (true){ // optional //value.isHighlight == true
                            if (true){ // optional // value.primaryImageSmall != ''
                                // check for a title, no item will be added without a title
                                if (value.title){
                                    // check for artist display name, no item will be added without an artist name
                                    if (value.artistDisplayName){
                                        // check the title against exclusion list
                                        if (!(titleExclusions.some(function(v) { return value.title.indexOf(v) >= 0; }))) {
                                            // add the object (artwork) to the adjacency list
                                            if (value.objectID && !AJList.hasOwnProperty(value.objectID)) {
                                                AJList[value.objectID] = [];
                                            }

                                            if (value.artistDisplayName){
                                                // check the artist name against exclusion list
                                                if (!(nameExclusions.some(function(v) { return value.artistDisplayName.indexOf(v) >= 0; }))){
                                                    // add the artists name to the objectID entry in the adjacency list
                                                    for (var i=0; i< arr.length; i++) {
                                                        var id = arr[i][0]
                                                        for (var key in data[id]) {
                                                            if (id != value.objectID) {
                                                                if (value.artistDisplayName == data[id][key]) {
                                                                    link = [id, 'artistDisplayName', data[id][key], key]
                                                                    saved = true;
                                                                }
                                                                if (value.artistBeginDate){
                                                                    if (value.artistBeginDate == data[id][key]) {
                                                                        link = [id, 'artistBeginDate', data[id][key], key]
                                                                        saved = true;
                                                                        
                                                                    }
                                                                }

                                                                if (value.artistEndDate){
                                                                    if (value.artistEndDate != '9999' || value.artistEndDate != value.artistBeginDate + 1000){
                                                                        if (value.artistEndDate == data[id][key]) {
                                                                            link = [id, 'artistEndDate', data[id][key], key]
                                                                            saved = true;
                                                                        }
                                                                    }
                                                                }
                                                                if (value.artistNationality){
                                                                    if (value.artistNationality == data[id][key]) {
                                                                        link = [id, 'artistNationality', data[id][key], key]
                                                                        saved = true;
                                                                    }
                                                                }

                                                                if (value.objectBeginDate){
                                                                    if (value.objectBeginDate == data[id][key]) {
                                                                        link = [id, 'objectBeginDate', data[id][key], key]
                                                                        saved = true;
                                                                    }
                                                                }

                                                                if (value.city){
                                                                    if (value.city == data[id][key]) {
                                                                        link = [id, 'city', data[id][key], key]
                                                                        saved = true;
                                                                    }
                                                                }

                                                                if (value.excavation){
                                                                    if (value.excavation == data[id][key]) {
                                                                        link = [id, 'excavation', data[id][key], key]
                                                                        saved = true;
                                                                    }
                                                                }

                                                                if (value.medium){
                                                                    if (mediumCount[value.medium] >49 && value.medium != 'Unknown') {
                                                                    } else {
                                                                        if (value.medium == data[id][key]) {
                                                                            link = [id, 'medium', data[id][key], key]
                                                                            saved = true;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        for (let i=0; i< value.tags.length; i++ ) {
                                                            if (value.tags[i]){
                                                                if (tagCount[value.tags[i]] >999) {
                                                                } else {
                                                                    if (data[id]['tags'].includes(value.tags[i])) {
                                                                        link = [id, 'tags', value.tags[i], 'tags']
                                                                        saved = true;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        if (saved) {
                                                            if (AJList.hasOwnProperty(id) && AJList[id].length < 1){ // check that no link has been provided yet
                                                                AJList[value.objectID].push(link)
                                                                break
                                                            }
                                                        }
                                                        //console.log(count1, count2)
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        fs.writeFileSync('newtimeline.json', JSON.stringify(AJList));
                        setTimeout(callback, 0);
                    }, function() {
                        // write the adjacency list ot a file
                        var emptyLinks = [];

                        for (x in AJList){
                            if (AJList[x].length == 0){
                                console.log('no link found for: ' + x)
                                emptyLinks.push(x)
                            }
                        }
                        fs.writeFileSync('noLinks.json', JSON.stringify(emptyLinks));

                        fs.writeFileSync('newtimeline.json', JSON.stringify(AJList));
                        console.log('Graphed it!');
                        // call the getKeys function 
                    });
                });
            });
        });
    });
}

//////////////////////////////////////////////////////////
makeAJList();


