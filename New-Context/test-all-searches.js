var finished
var metObjects
var list
var alltags
var timeSpan
var data = []
var workingTags = {}
var goodTags = {}

var w;

function startWorker(searchTerm,metObjects,list) {

  if (typeof(Worker) !== "undefined") {
      console.log('starting new web worker')
      w = new Worker("search.js");
    w.postMessage([searchTerm,metObjects,list])
    w.onmessage = function(event) {
      if (event.data[0] == true){
        data = data.concat(event.data[1].nodes);
        timeSpan = event.data[2];

        if (event.data[4] == true){
          w.terminate()
          document.getElementById('values').innerHTML += '<br>' + searchTerm + ' - timespan : ' + timeSpan + ' - artworks : ' + data.length
          workingTags[searchTerm] = {}
          workingTags[searchTerm]['timespan'] = timeSpan;
          workingTags[searchTerm]['artworks'] = data.length;

          if (data.length > 5 && timeSpan > 30){
          goodTags[searchTerm] = {}
          goodTags[searchTerm]['timespan'] = timeSpan;
          goodTags[searchTerm]['artworks'] = data.length;
          }

          search()
          finished = true;
        } 
      } else {
        w.terminate()
        document.getElementById('values').innerHTML += '<br> Failed : ' + searchTerm + ' - timespan : ' + timespan + ' - artworks : ' + data.length
        search()
        finished = true;
      }
    };
  }
}

async function dataLoad() {
  // we can set up our layout before we have data
  metObjects = await fetch("./Node/reducedMETobjects.json");
  metObjects = await metObjects.json()
  list = await fetch("./Node/AJList-update.json");
  list = await list.json()
  var tags = await fetch("./Node/MetSearchTags.json");
  tags = await tags.json()
  alltags = Object.keys(tags)
  alltags.reverse()
  search()

}

function toTitleCase(str) {
  return str.replace(
      /\w\S*/g,
      function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
  );
}

function search() {
  finished = false;
  if (alltags.length > 0){
    data = []
    timespan = 0
    var searchTerm = alltags.pop()
    searchTerm = toTitleCase(searchTerm)
    console.log('searching for ' + searchTerm)
    startWorker(searchTerm,metObjects,list)
  } else {
    console.log(workingTags)
    download(JSON.stringify(workingTags), "workingTags.json", '"application/json"');
    setTimeout(function(){ download(JSON.stringify(goodTags), "goodTags.json", '"application/json"'); }, 2000);
  }
}

//Saving JSON Locally
function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], {type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}


dataLoad();
