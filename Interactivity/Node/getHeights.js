var fs = require('fs');
var async = require('async');
var probe = require('probe-image-size');


function makeMetObjects(){
    // variable for the adjacency list. It will contain a list of key:value pairs for example where each value would be an actual name, place or date (ie it would not say city it would say 'New York')
    // ObjectID : [artistBeginDate, city]
    // city : [objectID]
    // artistbeginDate : [objectID]
    var objects = {};
    // read all of the files before any processing begins.
    console.log('gettingHeights');
    // downloaded and saved MET information from the API
    fs.readFile('reducedMETobjects.json', (error, data) => {
        if (error) console.log(error);
        data = JSON.parse(data);
            async.eachSeries(data, function(value, callback) {
                objects[value.objectID] = value
                if(value.primaryImageSmall != ''){
                    var url = value.primaryImageSmall.replace("https", "http");
                    probe(url, function (err, result) {
                    console.log(url)
                    console.log(err)
                    console.log(result);
                    // => {
                    //      width: xx,
                    //      height: yy,
                    //      type: 'jpg',
                    //      mime: 'image/jpeg',
                    //      wUnits: 'px',
                    //      hUnits: 'px'
                    //    }
                    objects[value.objectID].primaryImgHeight = result.height;
                    objects[value.objectID].primaryImgWidth = result.width;
                    });
                }

            setTimeout(callback, 0);
        }, function() {
            // write the adjacency list ot a file
            fs.writeFileSync('reducedMETobjects2.json', JSON.stringify(objects));
            console.log('saved objects!');
        });
    });
}

//////////////////////////////////////////////////////////
makeMetObjects();


