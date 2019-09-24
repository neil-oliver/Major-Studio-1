# The MET Museum
## Design Process

### Initial Sketch

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
### Setup
```javascript
var margin = 50
var cnv;

function setup() {
  cnv = createCanvas(windowWidth, windowHeight*0.6);
  cnv.parent("canvas");
}

function preload() {
  console.log(metData)
  console.log(metDataPercentages)
  addDescription()

}

var data;

function draw() {
  //setup background and call two functions to draw the graph and labels
  background(50)
  stroke(0)
  drawGraph()
  drawLabels()
}
```
### Draw Graph
```javascript
var deptColor = {}
var colors = ['#f97b72','#A5AA99','#7F3C8D','#11A579','#3969AC','#F2B701','#E68310','#80BA5A','#008695','#4b4b8f','#CF1C90']
  

function drawGraph(){

  if (document.getElementById("percentageCheck").checked == true){
    data = metDataPercentages
  } else {
    data = metData
  }

  //check that data array is not empty to avoid errors
  if (data.hasOwnProperty('false') && data.hasOwnProperty('true')){    

    //variables to hold the max and min year and max and min total
    var maxTotal = 0
    var minTotal = Infinity
    var maxYear = 0
    var minYear = Infinity

    // work out the max and min values for the 'artists alive at time of acquisition' data
    for (yearData in data['true']) {
      if (data['true'][yearData]['Total'] > maxTotal){ maxTotal = data['true'][yearData]['Total'] }
      if (data['true'][yearData]['Total'] < minTotal){ minTotal = data['true'][yearData]['Total'] }
      if (parseInt(yearData) > maxYear){ maxYear =  parseInt(yearData)}
      if (parseInt(yearData) < minYear){ minYear =  parseInt(yearData)}
    }
  
    // work out the max and min values for the 'artists deceased at time of acquisition' data
    for (yearData in data['false']) {
      if (data['false'][yearData]['Total'] > maxTotal){ maxTotal = data['false'][yearData]['Total'] }
      if (data['false'][yearData]['Total'] < minTotal){ minTotal = data['false'][yearData]['Total'] }
      if (parseInt(yearData) > maxYear){ maxYear =  parseInt(yearData)}
      if (parseInt(yearData) < minYear){ minYear =  parseInt(yearData)}
    }

    var FbarW = 0
    var TbarW = 0
    var FbarH = height - margin
    var TbarH = height - margin
    textSize(10)

    //create the bars for the 'deceased' side of the graph
    for (yearData in data['false']) {

      //starting X coordinate is the middle of the canvas
      var bottomX = width/2 - (margin/2)
      
      stroke(30)
      for (department in data['false'][yearData]){

      var yearTotal = 0;
      if (data['false'][yearData] != undefined){
        if (data['false'][yearData].hasOwnProperty('Total')){
          var yearTotal =  Math.round(data['false'][yearData]["Total"] / (data['false'][yearData]["Total"] + data['true'][yearData]["Total"])*100)
        }
      }

        if (department != 'Total'){

          if (colors.length == 0){
            colors.push('#1a1a1a')
          }
          if (!deptColor.hasOwnProperty(department)){
            deptColor[department] = colors.pop()
          }
          fill(deptColor[department])

          FbarW = map(parseInt(data['false'][yearData][department]), minTotal, maxTotal, 0, (width/2)-(margin*3))
          FbarH = map(parseInt(yearData), 1870, 2020, height-margin, margin)
          rect(bottomX,FbarH,-FbarW,-30)
          if (parseInt(data['false'][yearData][department]) >= maxTotal/20){ 
            textAlign(CENTER);
            fill(255,90)
            noStroke()
            if (document.getElementById("percentageCheck").checked == true){
              text(data['false'][yearData][department]+"%",bottomX-(FbarW/2), FbarH-10)
            } else {
              text(data['false'][yearData][department],bottomX-(FbarW/2), FbarH-10)
            }
          }
          stroke(30)
          bottomX = bottomX-FbarW
        }
      }
      bottomX = bottomX+FbarW
      fill(255,90)
      noStroke()

      if (document.getElementById("percentageCheck").checked == true){
        text(yearTotal+"\%",bottomX-FbarW-(margin/2), FbarH-10)
      } else {
        text(yearTotal+"%",bottomX-FbarW-(margin/2), FbarH-10)
      }

    }
    

    //create the bars for the 'alive' side of the graph
    // Method is the same as above with slight variations
    for (yearData in data['true']) {
      var bottomX = width/2 + (margin/2)
      stroke(30)

      for (department in data['true'][yearData]){
        var yearTotal = 0;
        if (data['false'][yearData] != undefined){
          if (data['false'][yearData].hasOwnProperty('Total')){
            var yearTotal =  Math.round(data['true'][yearData]["Total"] / (data['true'][yearData]["Total"] + data['false'][yearData]["Total"])*100)
          }
        }

        if (department != 'Total'){

          if (colors.length == 0){
            colors.push('#1a1a1a')
          }
          if (!deptColor.hasOwnProperty(department)){
            deptColor[department] = colors.pop()
          }
          fill(deptColor[department])
          
          TbarW = map(parseInt(data['true'][yearData][department]), minTotal, maxTotal, 0, (width/2)-(margin*3))
          TbarH = map(parseInt(yearData), 1870, 2020, height-margin, margin)
          rect(bottomX,TbarH,TbarW,-30)
          if (parseInt(data['true'][yearData][department]) >= maxTotal/20){ 
            textAlign(CENTER);
            fill(255,90)
            noStroke()
            if (document.getElementById("percentageCheck").checked == true){
              text(data['true'][yearData][department]+"%",bottomX+(TbarW/2), TbarH-10)
            } else {
              text(data['true'][yearData][department],bottomX+(TbarW/2), TbarH-10)
            }
          }
          stroke(30)
          bottomX = bottomX+TbarW
        }
      }

      bottomX = bottomX-TbarW
      fill(255,90)
      noStroke()

      if (document.getElementById("percentageCheck").checked == true){
        text(yearTotal+"%",bottomX+TbarW+(margin/2), TbarH-10)
      } else {
        text(yearTotal+"%",bottomX+TbarW+(margin/2), TbarH-10)
      }
    }

    //Draw Legend
    var spacing = (width-margin) / (Object.getOwnPropertyNames(deptColor).length)
    var xPos = 100
    for (dept in deptColor) {
      fill(deptColor[dept])
      rect(xPos,height-20,20,20)
      textAlign(LEFT);
      fill(255,90)
      noStroke()
      textSize(10)
      text(dept,xPos+30, height-5)
      xPos += spacing
    }
  }
}
```
### Draw Labels
```javascript
function drawLabels() {
  textAlign(CENTER);
  fill(255)
  textSize(24);
  textFont('Quicksand')
  text("Dead", (windowWidth/8)*3, (margin/4)*3)
  text("Alive", (windowWidth/8)*5, (margin/4)*3)
  textSize(12);

  for (i = 1870; i < 2020; i+=10){
    var h = map(i, 1870, 2020, height-margin, margin)
    text(i, windowWidth/2, h-10)
  }
}
```
### Calculate Totals and Add Description Below Canvas
```javascript
function addDescription() {
  var total = 0
  // total true
  for (year in data['true']){
    for (dept in data['true'][year]){
      if (dept != 'Total'){
        total += data['true'][year][dept]
      }
    }
  }
  //total false
  for (year in data['false']){
    for (dept in data['false'][year]){
      if (dept != 'Total'){
        total += data['false'][year][dept]
      }
    }
  }
  var unknownTotal = 0
  for (year in data['unknown']){
    for (dept in data['unknown'][year]){
      if (dept != 'Total'){
        unknownTotal += data['unknown'][year][dept]
        total += data['unknown'][year][dept]
      }
    }
  }

  var info = "Disclaimer: Art data isn't perfect. Sometimes we dont know the exact date an object was created or when an artist was born or died. Out of the " + total + " items purchased by the MET museum since 1870, a total of " + unknownTotal + " were unable to be put into a category."
  var para = document.getElementById("info");
  var node = document.createTextNode(info);
  para.appendChild(node);
}
```
