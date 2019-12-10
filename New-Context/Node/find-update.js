var fs = require('fs');
var async = require('async');

let createGraph = require('ngraph.graph');
let path = require('ngraph.path');

var searchTerm = "Foxes";
let pathArray = {'nodes': [], 'links' : []}

async function go(searchTerm,data,list){

    var arr = Object.entries(data)
    arr.sort((a, b) => a[1].objectBeginDate - b[1].objectBeginDate) 
    let results = arr.filter(function (element) {
        return element[1].tags.includes(searchTerm);
    });
    var res = []
    for (let i = 0; i< arr.length; i++){
        if (arr[i][1].tags.includes(searchTerm)) res.push(i)
    }
    //console.log(res)
    
    while (res.length >1){
        await filterAJList(data,arr,res,list)
        res.shift()
    }
}

async function filterAJList(data,arr,results,list){
    var newList = {}

    for (key in list){
        for (item in list[key]){
            if (key.split('-')[0] == 'ID'){
                if (data[key.split('-')[1]].objectBeginDate >= arr[results[0]][1].objectBeginDate && data[key.split('-')[1]].objectBeginDate <= arr[results[1]][1].objectBeginDate){
                    if (list[key][item][0].split('-')[1] != searchTerm) {
                        if (newList.hasOwnProperty(key)){
                            newList[key].push(list[key][item][0])
                        } else {
                            newList[key] = [list[key][item][0]]
                        }
                    }
                }
            } else if (key.split('-')[1] != searchTerm) {

                if (list[key][item][0].split('-')[0] == 'ID'){
                    var id = list[key][item][0].split('-')[1]
                    if (data[id].objectBeginDate >= arr[results[0]][1].objectBeginDate && data[id].objectBeginDate <= arr[results[1]][1].objectBeginDate){
                        if (list[key][item][0].split('-')[1] != searchTerm) {
                            if (newList.hasOwnProperty(key)){
                                newList[key].push(list[key][item][0])
                            } else {
                                newList[key] = [list[key][item][0]]
                            }
                        }
                    }
                } else {
                    if (list[key][item][0].split('-')[1] != searchTerm) {
                        if (newList.hasOwnProperty(key)){
                            newList[key].push(list[key][item][0])
                        } else {
                            newList[key] = [list[key][item][0]]
                        }
                    }
                }
            }
        }
    }
    //fs.writeFileSync('filteredAJList.json', JSON.stringify(newList));
    await findPath(newList,data,arr[results[1]][0],arr[results[0]][0])
}

async function findPath(list,data,start,end){
    if (pathArray.length > 0){
        pathArray.pop()
    }
    
    let graph = createGraph();

    async.forEachOf(list, function(value,index, callback) {
        for (let i = 0; i<value.length; i++) {
            if (index.split('-')[0] == 'ID' ){
                graph.addNode(index, {date : data[index.split('-')[1]].objectBeginDate});
            } else {
                graph.addNode(index);
            }
            graph.addLink(index, value[i], {weight: 1});
        }
        setTimeout(callback, 0);
    }, function() {
        let pathFinder = path.aStar(graph, { //aGreedy
            distance(fromNode, toNode, link) {
                return link.data.weight;
            },
            heuristic(fromNode, toNode) {

                let dist
                if (fromNode.data && toNode.data){
                    dist = toNode.data.date - fromNode.data.date
                } else {
                    dist = 0
                }
                return dist;
            }
        });
        let foundPath = pathFinder.find("ID-"+start, "ID-"+end);
        let size = 3
        for (i=0; i< foundPath.length; i++){
            if (foundPath[i].id == "ID-"+start || foundPath[i].id == "ID-"+end){
                size = 3
            } else {
                size = 2
            }
            if (foundPath[i].id.split('-')[0] == 'ID'){
                console.log(data[foundPath[i].id.split('-')[1]].title," created in ",data[foundPath[i].id.split('-')[1]].objectBeginDate)
                pathArray['nodes'].push({'id' : foundPath[i].id, 'value' : foundPath[i].data, 'size' : size})
            } else {
                console.log(foundPath[i].id)
            }
        }
        pathArray['links'].push({'source' : "ID-"+start, 'target' : "ID-"+end})
        
        console.log('-------')
        fs.writeFileSync('path.json', JSON.stringify(pathArray));
        //console.log(foundPath)
    });
}

/////////////
fs.readFile('reducedMETobjects.json', (error, data) => {
    if (error) console.log(error);
    data = JSON.parse(data);
    fs.readFile('AJList-update.json', async (error, list) => {
        if (error) console.log(error);
        list = JSON.parse(list);
        fs.readFile('MetTagListandCounts.json', async (error, tags) => {
            if (error) console.log(error);
            tags = JSON.parse(tags);
            var selectedVal = Infinity
            while(selectedVal > 500){
                var keys = Object.keys(tags)
                var rndm = Math.floor(Math.random() * keys.length)
                searchTerm = keys[rndm]
                selectedVal = tags[searchTerm]
            }
            console.log("Let me tell you a story about", searchTerm)
            go(searchTerm,data,list)
        });
    });
});