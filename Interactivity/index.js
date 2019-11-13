// starter code from : https://www.d3-graph-gallery.com/graph/arc_highlight.html

// SVG setup
var margin = {top: 10, right: 60, bottom: 30, left: 60},
width = window.innerWidth - margin.left - margin.right,
height = window.innerHeight*0.5

var colorScale = ['orange', '#abdda4', '#74add1'];
var previousYear = 0;

// append the SVG object to the body of the page
var svg = d3.select("#content")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform","translate(" + margin.left + "," + margin.top + ")")

var data = {'nodes': [], 'links' : []};

//////////////////////////////////////////////

function draw(data) {
  console.log(data)
  var spacing = 200
    
  // List of node names
  var allNodes = data.nodes.map(function(d){return d.id})

  var scaleMax = d3.max(data.nodes, function(d) { return +d.value.date} );
  var scaleMin = d3.min(data.nodes, function(d) { return +d.value.date} );

  var yearSize = 10
  width = (scaleMax-scaleMin)*yearSize;

  var xScale = d3.scaleLinear().domain([scaleMin, scaleMax]).range([0, width]);
  var timelineY = height*0.5

  d3.select('svg')
  .style("width", width+(spacing*2));

  var idToNode = {};
  data.nodes.forEach(function (n) {
    idToNode[n.id] = n;
  });

  // set initialcy position before force layout 
  data.nodes.forEach(function(d) { d.x = xScale(d.value.date); d.y = timelineY; });

  ///////////////////////////////////////////

  // force simulation setup
  var simulation = d3.forceSimulation(data.nodes)
  .force('charge', d3.forceManyBody().strength(5))
  .force('x', d3.forceX().x((d,i) => xScale(d.value.date)+(spacing/2)))
  .force('y', d3.forceY().y((d) => timelineY))
  .force("link", d3.forceLink().id((d) => d.id))
  .force('collision', d3.forceCollide().radius((d) => d.size*6))
  .on('tick', ticked)


  ////////////////

  var timeline = svg
    .selectAll(".lines")
    .data(data.nodes)
    .join("line")
      .style("stroke", "lightgray")
      .style("stroke-width", 0.5)
      .attr("y1", timelineY)
      .attr("x1", spacing/2)
      .attr("y2", timelineY)
      .attr("x2", width+(spacing/2))
      .attr('class', 'lines');

    // rect for year
    var titleHeight = [100,125,150,175,200]
    var titleLine = svg
      .selectAll('.titleLines')
      .data(data.nodes)
      .join('line')
      .filter(function(d) { return d.size >2 }) 
        .style("stroke-width", 1)
        .attr('y1', timelineY)
        .attr("y2", (d,i) => (timelineY)+(titleHeight[(i+1)%5]))
        .attr("x1", function(d){ return(xScale(d.value.date))+(spacing/2)})
        .attr("x2", function(d){ return(xScale(d.value.date))+(spacing/2)})
        .attr('stroke', 'lightgray')
        .attr("dominant-baseline", "middle")
        .attr('class', 'titleLines');

    // And give them a label
    var titles = svg
      .selectAll(".titles")
      .data(data.nodes)
      .join("text")
      .filter(function(d) { return d.size >2 }) 
        .attr("x", function(d){ return(xScale(d.value.date))+(spacing/2)})
        .attr("y",(d,i) => (timelineY)+(titleHeight[(i+1)%5]))
        .text((d) => metObjects[d.id.split('-')[1]].title)
        .attr("dominant-baseline", "middle")
        .attr('class', 'titles')

    // Link story
    var linkDesc = d3.select('#linkDesc')
      .selectAll("span")
      .data(data.links)
      .join("span")
        .text((d) => makeSense(d.desc,metObjects,d.source, d.target))


  function ticked() {

    // images
    var images = svg
    .selectAll('.artworkImages')
    .data(data.nodes)
    .join('image')                             
    .filter(function(d) { return d.size >2 }) 
      .attr('xlink:href', (d) => metObjects[d.id.split('-')[1]].primaryImageSmall)
      .attr('width', (spacing))
      .attr('height', (spacing))
      .attr("x", (d) => xScale(d.value.date)+(spacing*0.25))
      .attr("y", (timelineY)-(spacing*2))
      .attr('class', 'artworkImages')
      .on("click", (d) => window.open("https://www.metmuseum.org/art/collection/search/" + d.id.split('-')[1], "_blank"))

    // Add the links
    var links = svg
      .selectAll('.links')
      .data(data.links)
      .join('path')
      .attr('d', function (d) {
        start = idToNode[d.source].x   // X position of start node on the X axis
        end = idToNode[d.target].x    // X position of end node
        return ['M', start, idToNode[d.source].y,
      // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
          'A',                            // This means we're gonna build an elliptical arc
          (start - end), ',',    // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
          (start - end), 0, 0, ',',
          start < end ? 1 : 0, end, ',', idToNode[d.target].y] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
          .join(' ');
      })
      .style("fill", "none")
      .attr("stroke", 'transparent')
      .attr("stroke-width",1)
      .attr('class', 'links');


    // Add the circle for the nodes
    var nodes = svg
    .selectAll(".nodes")
    .data(data.nodes)
    .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr('r', (d) => d.size*6)
      .style('fill', (d) => colorScale[d.size-1])
      .on("click", (d) => window.open("https://www.metmuseum.org/art/collection/search/" + d.id.split('-')[1], "_blank"))
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('class', 'nodes')
    

    // Add the highlighting functionality
    nodes
    .on('mouseover', function (d) {
      // Highlight the nodes: every node is green except of him
      nodes
        .style('opacity', 0.5)
        .style('fill', "#B8B8B8")
        .style('stroke', 'grey')
        d3.select(this).style('stroke-width', '4')
        d3.select(this).style('fill', '#69b3b2')
        .style('opacity', 1)

      // Highlight the connections
      links
        .style('stroke', function (link_d) { return link_d.source === d.id || link_d.target === d.id ? '#69b3b2' : 'transparent';})
        .style('stroke-width', function (link_d) { return link_d.source === d.id || link_d.target === d.id ? 4 : 1;})
      
      //hide images
      images
        .style('opacity',function (image_d) { return image_d.id === d.id ? 1 : 0.2;})


    })
    .on('mouseout', function (d) {
      nodes
        .style('fill', (d) => colorScale[d.size-1])
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .style('opacity', 1)

      links
        .style('stroke', 'transparent')
        .style('stroke-width', 1)

      images
        .style('opacity',1)
    })

    //put the nodes above the lines
    d3.selectAll(".nodes").raise();
  }

  //move images to the front on rollover on node
  d3.selectAll(".artworkImages").on("mouseover", function(){
    d3.select(this).raise()
  });


}

////////////////////////////////////////////////////

//autoscroll feature
function pageScroll() {
  window.scrollBy(0,1);
  scrolldelay = setTimeout(pageScroll,30);
}

//setTimeout(pageScroll,20000);

///////////////////////////////////////////////////
var w;

function startWorker(searchTerm,metObjects,list) {
  if (typeof(Worker) !== "undefined") {
    if (typeof(w) == "undefined") {
      w = new Worker("search.js");
    }
    w.postMessage([searchTerm,metObjects,list])

    w.onmessage = function(event) {

      draw(event.data);
    };
  } else {
    console.log("Sorry! No Web Worker support.");
  }
}

async function dataLoad() {
  // we can set up our layout before we have data
  metObjects = await fetch("./Node/reducedMETobjects.json");
  metObjects = await metObjects.json()
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
  startWorker(searchTerm,metObjects,list)
}

document.getElementById("mySubmit").disabled = true
dataLoad()

