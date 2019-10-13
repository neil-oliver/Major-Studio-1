
var margin = 50
var cnv;

function setup() {
  if (windowHeight < 1000){
  cnv = createCanvas(windowWidth, 1000);
  } else {
    cnv = createCanvas(windowWidth, windowHeight*0.6);
  }
  cnv.parent("canvas");
}

//Not currently used
function centerCanvas() {
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);
}

function windowResized() {
  centerCanvas();
}

function preload() {
  console.log(metData)
  console.log(metDataPercentages)
  addDescription()

}

var data = metDataPercentages;

function draw() {
  //setup background and call two functions to draw the graph and labels
  background(50)
  stroke(0)
  drawGraph()
  drawLabels()
}

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


//draw the side axis & labels
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