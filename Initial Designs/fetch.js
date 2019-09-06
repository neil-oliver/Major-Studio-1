const search = 'color'
const dept = '19' //Photographs

const searchUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/search?q=' + search;
const objectBaseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';
const departmentBaseURL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=' + dept;

fetchMuseumData(departmentBaseURL);

let metData = {};

// fetch a query
function fetchMuseumData(url) {
  window
    .fetch(url)
    .then(data => data.json())
    .then(data => {
      console.log(data);
      fetchObjects(data);
    });
}

// from the response, fetch objects
function fetchObjects(data){

  let objectIDs = data.objectIDs;
  console.log("fetching: " + objectIDs.length + " objects");
  objectIDs.forEach(function(n) {
    let objUrl = objectBaseUrl + n;
    window
      .fetch(objUrl)
      .then(data => data.json())
      .then(data => {
        sortData(data);
      });
  });
}

function dateBracket(objectDate){
    var bracket = null;
    
    bracket = parseInt(objectDate) // need a more robust method
    bracket = (parseInt(bracket/10, 10)+1)*10
    return bracket;
}

// create your own array using just the data you need
function sortData(data){
    var classification = data.classification;
    var objectDate = data.objectDate;
    var artistBeginDate = data.artistBeginDate;
    var artistEndDate = data.artistEndDate;
    var acquisitionDate = data.creditLine;
    var alive = aliveAtAcquisition(artistBeginDate, artistEndDate, acquisitionDate, objectDate)
    var bracket = dateBracket(objectDate)
    
    if (!metData.hasOwnProperty(alive)) {
        metData[alive] = {};
    }
    if (!metData[alive].hasOwnProperty(bracket)) {
        metData[alive][bracket] = {};
    }
    
    metData[alive][bracket][classification] = (metData[alive][bracket][classification] || 0) + 1;
    metData[alive][bracket]['Total'] = (metData[alive][bracket]['Total'] || 0) + 1;

    console.log(metData)
}

function aliveAtAcquisition(artistBeginDate, artistEndDate, acquisitionDate, objectDate){
    var result = null;
    var date = new Date;
    
    acquisitionDate = acquisitionDate.split(',')
    
    if (!parseInt(artistEndDate) && parseInt(artistBeginDate) + 120 > date.getFullYear()) {
        //assume alive
        result = true
    } else if (!parseInt(artistEndDate) && parseInt(artistBeginDate) + 120 < date.getFullYear()) {
        //lets try and dig a bit deeper
        if (!parseInt(objectDate) && parseInt(objectDate) + 120 < date.getFullYear()) {
        // assume dead
            result = false
        }
    } else if (parseInt(artistEndDate) < parseInt(acquisitionDate[acquisitionDate.length-1])){
        //artist was dead at acquisition
        result = false
    } else if (parseInt(artistEndDate) > parseInt(acquisitionDate[acquisitionDate.length-1])){
        //artist was alive at time of acquisition
        result = true
    }
    
    return result;
}
