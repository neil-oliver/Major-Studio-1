var fs = require('fs');
var async = require('async');
var nodes = []
var links = []

function makeMetObjects(){
    var objects = {};
    // read all of the files before any processing begins.
    console.log('starting to order objects');
    // downloaded and saved MET information from the API
    fs.readFile('reducedMETobjects.json', (error, objects) => {
        if (error) console.log(error);
        objects = JSON.parse(objects)
        fs.readFile('newtimeline.json', (error, data) => {
            if (error) console.log(error);
            data = JSON.parse(data)
            async.forEachOf(data, function(value,index, callback) {
                nodes.push({
                    'id' : index,
                    "description" : objects[index].title
                })

                if (value[0]){
                    links.push({
                        'source' : index,
                        'target' : value[0][0],
                        'description' : [value[0][1],value[0][2],value[0][3]]
                    })
                }
                setTimeout(callback, 0);
            }, function() {
                objects = {
                    'nodes' : nodes,
                    'links' : links
                }
                fs.writeFileSync('graphList.json', JSON.stringify(objects));
                console.log('saved objects!');
            });
        });
    });
}

//////////////////////////////////////////////////////////
makeMetObjects();