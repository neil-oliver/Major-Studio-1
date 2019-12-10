var fs = require('fs');
var async = require('async');
    
function makeTimeline(){
    var timeline = []
    var bc = []
    // read all of the files before any processing begins.
    console.log('starting to create Timeline');
    // downloaded and saved MET information from the API
    fs.readFile('allMET.json', (error, data) => {
        if (error) console.log(error);
        data = JSON.parse(data);
        // start looping through each object in the allMET.json file
        async.eachSeries(data, function(value, callback) {

            if (value.objectBeginDate >= 0) {
                if (timeline.length-1 < value.objectBeginDate) {
                    for (let i= timeline.length; i <= value.objectBeginDate; i++) {
                        timeline.push([])
                    }
                }
                timeline[value.objectBeginDate].push(value.objectID);
            } else {
                if (bc.length-1 < Math.abs(value.objectBeginDate)) {
                    for (let i= bc.length; i <= Math.abs(value.objectBeginDate); i++) {
                        bc.push([])
                    }
                }
                bc[Math.abs(value.objectBeginDate)].push(value.objectID);
            }
            setTimeout(callback, 0);
        }, function() {
            // write the adjacency list ot a file
            fs.writeFileSync('timeline.json', JSON.stringify(timeline));
            fs.writeFileSync('bc.json', JSON.stringify(bc));

            console.log('Timeline Complete!');
        });
    });
};

//////////////////////////////////////////////////////////
makeTimeline();


