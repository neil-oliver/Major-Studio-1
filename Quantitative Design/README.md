# The MET Museum
## Design Process

## Initial Sketch

Selected design from the three initials designed detailed [here](https://github.com/neil-oliver/Major-Studio-1/tree/master/Initial%20Sketches).
![IMG_3443](https://user-images.githubusercontent.com/9771424/64180732-4c48bc80-ce33-11e9-8f05-feb2d41a5981.jpeg)

### Initial Design
Design created in Excel / Illustrator using MET API data. Details [here](https://github.com/neil-oliver/Major-Studio-1/tree/master/Initial%20Designs).
![](https://github.com/neil-oliver/Major-Studio-1/blob/master/Initial%20Designs/The%20MET%201.png)

### P5 Design
Data set chnged from using only the photography department dataset, to looking at the much larger (9,000 -> 46,000) modern art department department.
![](https://github.com/neil-oliver/Major-Studio-1/blob/master/Quantitative%20Design/Progress%20Images/Design%20Progress.png)

## Final Design
Changed from displaying a single department to using all of the data from the MET collection. 
![](https://github.com/neil-oliver/Major-Studio-1/blob/master/Quantitative%20Design/Progress%20Images/Current%20Design.png)

## Accessing and Saving the MET API Collection using Node.js
### Get IDs
```javascript
request(objectBaseUrl, function(error, response, body){
    if (!error && response.statusCode == 200) {
        body = JSON.parse(body);
        fs.writeFileSync('data/metIDs.json', JSON.stringify(body.objectIDs));
    }
});
```
### Fetching & Saving Objects
```javascript
fs.readFile('data/metIDs.json', (error, data) => {
    if (error) console.log(error);
    
    var ids = JSON.parse(data);
    console.log("ID File Read");
    
    async.eachSeries(ids, function(value, callback) {
        
        let apiRequest = objectBaseUrl + value;
        console.log("getting MET Object");

        request(apiRequest, function(err, resp, body) {
            if (err) {fs.appendFileSync('METerrors.json', JSON.stringify(value + ','));}
            else {
                var object = JSON.parse(body);
                console.log(object);
                fs.appendFileSync('METData.json', JSON.stringify(object));
                fs.appendFileSync('data/fetchedMETids.json', JSON.stringify(value + ','));
            }
        });
        setTimeout(callback, 100);
    });
});
```

## Evaluating and Processing the Data
### Async Processing of Each Object
```javascript
let metData = {};
let metDataPercentages = {};

async function processData() {
    for (const obj in rawData) {
      await sortData(rawData[obj]);
    }
    download(JSON.stringify(metData), "ProcessedData.json", '"application/json"');
    download(JSON.stringify(metDataPercentages), "ProcessedPercentageData.json", '"application/json"');
}
```
### Sorting the Data
```javascript
async function sortData(data){
    var department = data.department;
    var objectDate = data.objectBeginDate;
    var artistBeginDate = data.artistBeginDate;
    var artistEndDate = data.artistEndDate;
    var acquisitionDate = data.creditLine;
    var alive = await aliveAtAcquisition(artistBeginDate, artistEndDate, acquisitionDate, objectDate)
    
    acquisitionDate = acquisitionDate.split(',')
    var bracket = await dateBracket(acquisitionDate[acquisitionDate.length-1])
    
    if (parseInt(data.objectDate) >= 1870){ //&& (department != 'Photographs')
        
        if (!metData.hasOwnProperty(alive)) {
            metData[alive] = {};
        }

        if (!metData.hasOwnProperty(!alive)) {
            metData[!alive] = {};
        }

        if (!metData[alive].hasOwnProperty(bracket)) {
            metData[alive][bracket] = {};
        }

        if (!metData[!alive].hasOwnProperty(bracket)) {
            metData[!alive][bracket] = {};
        }

        if (!metDataPercentages.hasOwnProperty(alive)) {
            metDataPercentages[alive] = {};
            
        }

        if (!metDataPercentages.hasOwnProperty(!alive)) {
            metDataPercentages[!alive] = {};
        }

        if (!metDataPercentages[alive].hasOwnProperty(bracket)) {
            metDataPercentages[alive][bracket] = {};
        }

        if (!metDataPercentages[!alive].hasOwnProperty(bracket)) {
            metDataPercentages[!alive][bracket] = {};
        }
        
        metData[alive][bracket][department] = (metData[alive][bracket][department] || 0) + 1;
        metData[alive][bracket]['Total'] = (metData[alive][bracket]['Total'] || 0) + 1;
        metDataPercentages[alive][bracket][department] = Math.round((metData[alive][bracket][department] / (metData[alive][bracket][department] + (metData[!alive][bracket][department] || 0)))*100);
        metDataPercentages[!alive][bracket][department] = 100 - metDataPercentages[alive][bracket][department];
        
        if (!metDataPercentages[alive][bracket][department].hasOwnProperty('Total')) {
            metDataPercentages[alive][bracket]['Total'] = 0;
        }

        if (!metDataPercentages[!alive][bracket][department].hasOwnProperty('Total')) {
            metDataPercentages[!alive][bracket]['Total'] = 0;
        }
        for (total in metDataPercentages[alive][bracket]){
            if (total != 'Total'){
                metDataPercentages[alive][bracket]['Total'] += metDataPercentages[alive][bracket][total]
                metDataPercentages[!alive][bracket]['Total'] += (100-metDataPercentages[alive][bracket][total])
            }
        }
    }
}
```
### Decade calculation
```javascript
function dateBracket(objectDate){
    var bracket = null;
    
    bracket = parseInt(objectDate) // need a more robust method
    bracket = bracket - bracket % 10 
    return bracket;
}
```
### Dead or Alive Category
```javascript
function aliveAtAcquisition(artistBeginDate, artistEndDate, acquisitionDate, objectDate){
    var result = null;
    var date = new Date;
    
    acquisitionDate = acquisitionDate.split(',')
    if (artistEndDate != ''){
        if (parseInt(artistEndDate) < parseInt(acquisitionDate[acquisitionDate.length-1])){
            //artist was dead at acquisition
            result = false
        } else if (parseInt(artistEndDate) > parseInt(acquisitionDate[acquisitionDate.length-1])){
            //artist was alive at time of acquisition
            result = true
        }
    } else {
        if (parseInt(artistBeginDate) + 120 > date.getFullYear()) {
            //assume alive
            result = true
        } else if (parseInt(artistBeginDate) + 120 < date.getFullYear()) {
            result = false
        }
        if (artistBeginDate != ''){
            console.log('no start or end date for artist')
        }
    }
    return result;
}
```
### Saving the Processed Data
```javascript
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
```
## Displaying The Data With .P5
```javascript

```
```javascript

```
```javascript

```
```javascript

```
```javascript

```
