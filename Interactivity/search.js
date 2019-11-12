importScripts('https://unpkg.com/ngraph.graph@0.0.17/dist/ngraph.graph.min.js', 'https://unpkg.com/ngraph.path@1.1.0/dist/ngraph.path.min.js');

var searchTerm;
let pathArray = {'nodes': [], 'links' : []}
let data;
let list;
let tags;

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
    if (res.length > 1){
        console.log(res)
        
        while (res.length >1){
            await filterAJList(data,arr,res,list)
            res.shift()
        }

    } else {
        console.log('no results found')
        document.getElementById("myInput").placeholder = 'Oops, we didnt find any stories, try again!';
        document.getElementById("myInput").value = '';

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
                            newList[key].push([list[key][item][0],list[key][item][1]])
                        } else {
                            newList[key] = [[list[key][item][0],list[key][item][1]]]
                        }
                    }
                }
            } else if (key.split('-')[1] != searchTerm) {

                if (list[key][item][0].split('-')[0] == 'ID'){
                    var id = list[key][item][0].split('-')[1]
                    if (data[id].objectBeginDate >= arr[results[0]][1].objectBeginDate && data[id].objectBeginDate <= arr[results[1]][1].objectBeginDate){
                        if (list[key][item][0].split('-')[1] != searchTerm) {
                            if (newList.hasOwnProperty(key)){
                                newList[key].push([list[key][item][0],list[key][item][1]])
                            } else {
                                newList[key] = [[list[key][item][0],list[key][item][1]]]
                            }
                        }
                    }
                } else {
                    if (list[key][item][0].split('-')[1] != searchTerm) {
                        if (newList.hasOwnProperty(key)){
                            newList[key].push([list[key][item][0],list[key][item][1]])
                        } else {
                            newList[key] = [[list[key][item][0],list[key][item][1]]]
                        }
                    }
                }
            }
        }
    }
    await findPath(newList,data,arr[results[1]][0],arr[results[0]][0])
    return Promise.resolve()

}

async function findPath(list,data,start,end){
    //console.log(list)

    if (pathArray.nodes.length > 0){
        pathArray.nodes.pop()
    }
    
    let graph = createGraph();
    for (index in list) {
        for (let i = 0; i<list[index].length; i++) {
            if (index.split('-')[0] == 'ID' ){
                graph.addNode(index, {date : data[index.split('-')[1]].objectBeginDate});
            } else {
                graph.addNode(index);
            }
            graph.addLink(index, list[index][i][0], {weight: 1, linkatt: list[index][i][1]});
        }
    };

    let pathFinder = ngraphPath.aStar(graph, { //aGreedy //nba //aStar
        distance(fromNode, toNode, link) {
            return link.data.weight;
        },
        heuristic(fromNode, toNode) {

            let dist
            if (fromNode.data && toNode.data){
                dist = (toNode.data.date - fromNode.data.date)+1
            } else {
                dist = 0
            }
            return dist;
        }
    });

    let foundPath = pathFinder.find("ID-"+start, "ID-"+end);
    
    let size = 3
    var desc = [];
    var linkstart = foundPath[0].id;

    for (var i = 0; i < foundPath.length; i++){
        //check to see if start or end node and add node
        if (foundPath[i].id == "ID-"+start || foundPath[i].id == "ID-"+end){
            size = 3
            pathArray['nodes'].push({'id' : foundPath[i].id, 'value' : foundPath[i].data, 'size' : size})
        } else {
            size = 1
        }
        // loop each node except the last one
        if (i < foundPath.length-1){
            // check to see if it is an id but NOT the starting id
            if (foundPath[i].id.split('-')[0] == 'ID' && foundPath[i].id != "ID-"+start ) {
                //push to pathArray
                pathArray['nodes'].push({'id' : foundPath[i].id, 'value' : foundPath[i].data, 'size' : size})
                pathArray['links'].push({'source' : linkstart, 'target' : foundPath[i].id,'desc' : desc})
                //wipe the description
                desc = []
                // change start node for link
                linkstart = foundPath[i].id
                //console.log('---')
            } else {
                // loop each possible link for the node
                for (var x =0; x < foundPath[i].links.length; x++){
                    if (foundPath[i].links[x].toId == foundPath[i+1].id){        
                        //console.log(foundPath[i].id + ' -> ' + foundPath[i].links[x].data.linkatt + ' -> ' + foundPath[i+1].id)
                        desc.push([foundPath[i].id, foundPath[i].links[x].data.linkatt, foundPath[i+1].id])
                        break
                    }
                }
            }
        }
    }
    // add the link
    pathArray['links'].push({'source' : linkstart, 'target' : foundPath[foundPath.length-1].id,'desc' : desc})

    //console.log('-------')

    postMessage([pathArray, data])
    return Promise.resolve()
}

/////////////////////////////////////////////////////////////////////
onmessage = function(e) {
    go(e.data[0],e.data[1],e.data[2]);
  }