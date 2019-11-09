const Graph = require('dijkstra-short-path');
 
const route = new Graph();
 
// route.addNode('A', new Map([['B', 2], ['C', 5]])); // Distance list should be Map
// route.addNode('B', new Map([['A', 1], ['C', 2]])); // Distance from  B->A can be different from A->B.
// route.addNode('C', new Map([['D', 1]]));
 
// console.log(route.path('A', 'D'));

var fs = require('fs');
var async = require('async');
    
function makeMetObjects(){
    var objects = {};
    // read all of the files before any processing begins.
    console.log('starting to create dijkstra AJList');
    // downloaded and saved MET information from the API
    fs.readFile('AJList.json', (error, data) => {
        if (error) console.log(error);
        data = JSON.parse(data);
        async.forEachOf(data, function(value,index, callback) {
            var links = []
            for (let i = 0; i<value.length; i++) {
                links.push([value[i][0],1])
            }
            route.addNode(index, new Map(links));

            setTimeout(callback, 0);
        }, function() {
            console.log('now lets dijkstra')
            console.log(route.path("objectID-32838", "objectID-126847")); 
            // write the adjacency list ot a file
        });
    });
}

//////////////////////////////////////////////////////////
makeMetObjects();