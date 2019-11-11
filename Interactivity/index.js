// starter code from : https://www.d3-graph-gallery.com/graph/arc_highlight.html

// SVG setup
var margin = {top: 10, right: 60, bottom: 30, left: 60},
width = window.innerWidth - margin.left - margin.right,
height = 0

var colorScale = ['orange', '#abdda4', '#74add1'];
var previousYear = 0;

// append the SVG object to the body of the page
var svg = d3.select("#content")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform","translate(" + margin.left + "," + margin.top + ")")

function draw(data, metObjects) {

  var spacing = 100
  
  d3.select('svg')
    .style("height", (data.nodes.length*spacing)+(spacing*2));
  
  height = (data.nodes.length-1)*spacing;

  // List of node names
  var allNodes = data.nodes.map(function(d){return d.id})

  // A linear scale to position the nodes on the X axis
  var x = d3.scalePoint()
    .range([0, height])
    .domain(allNodes)

  var timeline = svg
    .selectAll(".lines")
    .data(data.nodes)
    .join("line")
      .style("stroke", "lightgray")
      .style("stroke-width", 0.5)
      .attr("x1", width/2)
      .attr("y1", spacing/2)
      .attr("x2", width/2)
      .attr("y2", height+(spacing/2))
      .attr('class', 'lines');


  // And give them a label
  var titles = svg
    .selectAll(".titles")
    .data(data.nodes)
    .join("text")
      .attr("y", function(d){ return(x(d.id))+(spacing/2)})
      .attr("x", (width/2)+100)
      .text((d) => metObjects[d.id.split('-')[1]].title)
      .attr('class', 'titles')

        // rect for year
  var yearsLine = svg
    .selectAll('.titleLines')
    .data(data.nodes)
    .join('line')
      .style("stroke-width", 1)
      .attr('x1', width/2)
      .attr("x2", (width/2)+(spacing/2))
      .attr("y1", function(d){ return(x(d.id))+(spacing/2)})
      .attr("y2", function(d){ return(x(d.id))+(spacing/2)})
      .attr('stroke', 'grey')
      .attr('class', 'titleLines');

  // rect for year
  var yearsRect = svg
    .selectAll('.yearsRect')
    .data(data.nodes)
    .join('rect')
      .attr("width", 40)
      .attr("height", 20)
      .attr('x', (width/2)-500)
      .attr("y", function(d){ return(x(d.id))+(spacing/2)-15})
      .attr('fill', function (d) {
        if (d.value.date != previousYear){
          previousYear = d.value.date
          return 'grey'
        } else {
          return 'white'
        }
      })
      .attr('class', 'yearsRect');
  
  // rect for year
  var yearsLine = svg
    .selectAll('.yearLines')
    .data(data.nodes)
    .join('line')
      .style("stroke-width", 1)
      .attr('x1', (width/2)-500)
      .attr("x2", width/2)
      .attr("y1", function(d){ return(x(d.id))+(spacing/2)})
      .attr("y2", function(d){ return(x(d.id))+(spacing/2)})
      .attr('stroke', function (d) {
        if (d.value.date != previousYear){
          previousYear = d.value.date
          return 'grey'
        } else {
          return 'white'
        }
      })
      .attr('class', 'yearLines');

  // print the year
  var years = svg
    .selectAll('.years')
    .data(data.nodes)
    .join('text')
      .attr('x', (width/2)-500)
      .attr("y", function(d){ return(x(d.id))+(spacing/2)})
      .text(function (d) {
        if (d.value.date != previousYear){
          previousYear = d.value.date
          return d.value.date
        } else {
          return ''
        }
      })
      .attr('class', 'years')
      .attr('fill', 'white')

  // images
  var images = svg
    .selectAll('.artworkImages')
    .data(data.nodes)
    .join('image')
      .attr('xlink:href', (d) => metObjects[d.id.split('-')[1]].primaryImageSmall)
      .attr('width', spacing)
      .attr('height', spacing)
      .attr("y", function(d){ return(x(d.id))})
      .attr("x", (width/2)-(spacing*2))
      .attr('class', 'artworkImages')
      .on("click", (d) => window.open("https://www.metmuseum.org/art/collection/search/" + d.id.split('-')[1], "_blank"));

  var idToNode = {};
  data.nodes.forEach(function (n) {
    idToNode[n.id] = n;
  });

  // Add the links
  var links = svg
    .selectAll('.links')
    .data(data.links)
    .join('path')
    .attr('d', function (d) {
      start = x(idToNode[d.source].id)+(spacing/2)    // X position of start node on the X axis
      end = x(idToNode[d.target].id)+(spacing/2)     // X position of end node
      return ['M', width/2, start,
    // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
        'A',                            // This means we're gonna build an elliptical arc
        (start - end)/2, ',',    // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
        (start - end)/2, 0, 0, ',',
        start < end ? 1 : 0, width/2, ',', end] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
        .join(' ');
    })
    .style("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width",1)
    .attr('class', 'links');

  // Link story
  var linkDesc = svg
  .selectAll(".linkDesc")
  .data(data.links)
  .join("text")
    .attr("y", function(d){ return(x(idToNode[d.source].id)+(spacing*1.25))})
    .attr("x", (width/2)+(spacing*1.5))
    .text((d) => d.desc)
    .attr('class', 'linkDesc');

  // Add the circle for the nodes
  var nodes = svg
  .selectAll(".nodes")
  .data(data.nodes)
  .join("circle")
    .attr("cy", function(d){ return(x(d.id))+(spacing/2)})
    .attr("cx", width/2)
    .attr('r', (d) => d.size*10)
    .style('fill', (d) => colorScale[d.size-1])
    .on("click", (d) => window.open("https://www.metmuseum.org/art/collection/search/" + d.id.split('-')[1], "_blank"))
    .attr('stroke', 'grey')
    .attr('stroke-width', 1)
    .attr('class', 'nodes');

  // Add the highlighting functionality
  nodes
    .on('mouseover', function (d) {
      // Highlight the nodes: every node is green except of him
      nodes
        .style('fill', "#B8B8B8")
        .style('stroke', 'grey')
        d3.select(this).style('stroke-width', '4')
        d3.select(this).style('fill', '#69b3b2')
      // Highlight the connections
      links
        .style('stroke', function (link_d) { return link_d.source === d.id || link_d.target === d.id ? '#69b3b2' : '#b8b8b8';})
        .style('stroke-width', function (link_d) { return link_d.source === d.id || link_d.target === d.id ? 4 : 1;})
    })
    .on('mouseout', function (d) {
      nodes
        .style('fill', (d) => colorScale[d.size-1])
        .style('stroke', 'grey')
        .style('stroke-width', 1)
      links
        .style('stroke', 'black')
        .style('stroke-width', 1)
    })

  //put the nodes above the lines
  d3.selectAll(".nodes").raise();

}

//autoscroll feature
function pageScroll() {
  window.scrollBy(0,1);
  scrolldelay = setTimeout(pageScroll,30);
}

//setTimeout(pageScroll,20000);

///////////////////////////////////////////////////
var w;

function startWorker(searchTerm,data,list) {
  if (typeof(Worker) !== "undefined") {
    if (typeof(w) == "undefined") {
      w = new Worker("search.js");
    }
    w.postMessage([searchTerm,data,list])

    w.onmessage = function(event) {
      draw(event.data[0],event.data[1]);
    };
  } else {
    console.log("Sorry! No Web Worker support.");
  }
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
  document.getElementById("mySubmit").disabled = false
  console.log("Can i recommend searching for ", searchTerm)
}

search = function() {
  searchTerm = document.getElementById("myInput").value;
  console.log('searching for ' + searchTerm)
  pathArray = {'nodes': [], 'links' : []}
  startWorker(searchTerm,data,list)
}

document.getElementById("mySubmit").disabled = true
dataLoad()

