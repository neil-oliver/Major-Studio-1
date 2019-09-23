# The MET Museum
## Design Process

## Initial Sketch

This design has been created from the sketch below, which was one of three initials designed detailed [here](https://github.com/neil-oliver/Major-Studio-1/tree/master/Initial%20Sketches).
![IMG_3443](https://user-images.githubusercontent.com/9771424/64180732-4c48bc80-ce33-11e9-8f05-feb2d41a5981.jpeg)

### Initial Design
*Data Represented has been collected via the MET API (details below)*
![](https://github.com/neil-oliver/Major-Studio-1/blob/master/Initial%20Designs/The%20MET%201.png)

### Initial P5 Implementation
![](https://github.com/neil-oliver/Major-Studio-1/blob/master/Quantitative%20Design/Progress%20Images/Design%20Progress.png)

### Final Design
![](https://github.com/neil-oliver/Major-Studio-1/blob/master/Quantitative%20Design/Progress%20Images/Current%20Design.png)

### Accessing the MET API Data
#### Script.js
The code in this file has been adapted from the starting code found [here](https://github.com/readyletsgo/msdv-major-studio-1-fa19).

Two Constants were set up with the API addresses to call individual objectID's from an entire department and then the details for each of the objects. The code below these two constants is from the starting code, with only a few variable name changes.
```javascript
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
```

The resulting data is then split into separate variables for easy recall. A nested object is created that will track the number of objects that have the same department and date bracket. The information is also split on whether the artist was alive or dead at the time of acquisition by the museum.
```javascript
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
```

In order to calculate the date bracket and if the artist was alive at the time of acquisition, two additional fucntions were created.
```javascript
function dateBracket(objectDate){
    var bracket = null;
    
    bracket = parseInt(objectDate)
    bracket = (parseInt(bracket/10, 10)+1)*10
    return bracket;
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
```

#### Index.html
So far there is not a lot here! The HTML document was simply used to call the .js file, and allow the use of the console.
The data was removed from the console manually and manipulated in Excel and Illustrator. 
