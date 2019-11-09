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
        document.getElementById("myInput").placeholder = 'Oops, we didnt find any stories, try again!';
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
    await findPath(newList,data,arr[results[1]][0],arr[results[0]][0])
    return Promise.resolve()

}

async function findPath(list,data,start,end){
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
            graph.addLink(index, list[index][i], {weight: 1});
        }
    };

    let pathFinder = ngraphPath.aStar(graph, { //aGreedy
        distance(fromNode, toNode, link) {
            return link.data.weight+1;
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
            size = 1
        }
        if (foundPath[i].id.split('-')[0] == 'ID'){
            //console.log(data[foundPath[i].id.split('-')[1]].title," created in ",data[foundPath[i].id.split('-')[1]].objectBeginDate)
            pathArray['nodes'].push({'id' : foundPath[i].id, 'value' : foundPath[i].data, 'size' : size})
        } else {
            //console.log(foundPath[i].id)
        }
    }
    pathArray['links'].push({'source' : "ID-"+start, 'target' : "ID-"+end})
    //console.log('-------')
    await draw(pathArray, data)
    //console.log(foundPath)
    return Promise.resolve()
}


async function dataLoad() {
    // we can set up our layout before we have data
    data = await fetch("./Node/reducedMETobjects.json");
    data = await data.json()
    list = await fetch("./Node/AJList-update.json");
    list = await list.json()
    tags = await fetch("./Node/MetTagListandCounts.json");
    tags = await tags.json()
    /*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
    autocomplete(document.getElementById("myInput"), Object.keys(tags));

    var selectedVal = Infinity
    while(selectedVal > 500){
        var keys = Object.keys(tags)
        var rndm = Math.floor(Math.random() * keys.length)
        searchTerm = keys[rndm]
        selectedVal = tags[searchTerm]
    }
    document.getElementById("myInput").placeholder = 'Search for something like... ' + searchTerm + '!';
    console.log("Let me tell you a story about", searchTerm)
  }

  search = function() {
    searchTerm = document.getElementById("myInput").value;
    console.log('searching for ' + searchTerm)
    pathArray = {'nodes': [], 'links' : []}
    go(searchTerm,data,list)
}

  dataLoad()