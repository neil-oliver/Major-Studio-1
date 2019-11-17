// starter code from : https://www.d3-graph-gallery.com/graph/arc_highlight.html

// SVG setup
var margin = {top: 0, right: 60, bottom: 30, left: 60},
width = window.innerWidth - margin.left - margin.right,
height = window.innerHeight*0.45

var colorScale = ['#ece7f2', '#a6bddb', '#7fcdbb'];
var strokeColor = ['gray','#525252','#525252']
var nodeSize = [5,10,20]
var previousYear = 0;

// append the SVG object to the body of the page
var svg = d3.select("#content")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform","translate(" + margin.left + "," + margin.top + ")")


var allExtra = []
var data = {'nodes': [], 'links' : []};
var timeSpan = 1;

//////////////////////////////////////////////

function draw() {
  document.getElementById('explanation').style.visibility='visible';
  document.getElementById('hovertitle').style.visibility='visible';


  var spacing = 200
  // List of node names
  //var allNodes = data.nodes.map(function(d){return d.id})
  var scaleMin = d3.min(data.nodes, function(d) { return +d.value.date} );
  var scaleMax = scaleMin + timeSpan;

  var yearSize = 10
  width = timeSpan*yearSize;

  var xScale = d3.scaleLinear().domain([scaleMin, scaleMax]).range([0, width]);
  var timelineY = height*0.85

  d3.select('svg').style("width", width+(spacing*2));

  var idToNode = {};
  data.nodes.forEach(function (n) {
    idToNode[n.id] = n;
  });

  var x_axis = d3.axisBottom()
        .scale(xScale)
        .tickFormat(d3.format("d"));

  svg.append("g")
    .attr("transform", "translate("+spacing/2+","+ timelineY+")")
    .attr("class", "xAxis")
    .call(x_axis);

  // set initialcy position before force layout 
  data.nodes.forEach(function(d) { d.x = xScale(d.value.date)+(spacing/2); d.y = timelineY; });

  //for neighbour referencing
  var linkedByIndex = {};
  data.links.forEach(function(d) {
    linkedByIndex[d.source + "," + d.target] = 1;
  });
  function neighboring(a, b) {
    return linkedByIndex[a.id + "," + b.id];
  }


  ///////////////////////////////////////////

  // force simulation setup
  var simulation = d3.forceSimulation(data.nodes)
    .force('charge', d3.forceManyBody().strength(0))
    .force('x', d3.forceX().x((d) => xScale(d.value.date)+(spacing/2)))
    .force('y', d3.forceY().y(timelineY))
    .force("link", d3.forceLink().id((d) => d.id))
    .force('collision', d3.forceCollide().radius((d) => nodeSize[d.size-1]))
    .on('tick', ticked)

  ////////////////

    // rect for year
    // var titleHeight = [60,80,100,120,140,160,180,200]
    // var titleLine = svg
    //   .selectAll('.titleLines')
    //   .data(data.nodes)
    //   .join('line')
    //   .filter(function(d) { return d.size == 3 }) 
    //     .style("stroke-width", 1)
    //     .attr('y1', timelineY)
    //     .attr("y2", (d,i) => (timelineY)+(titleHeight[(i+1)%8]))
    //     .attr("x1", function(d){ return(xScale(d.value.date))+(spacing/2)})
    //     .attr("x2", function(d){ return(xScale(d.value.date))+(spacing/2)})
    //     .attr('stroke', 'lightgray')
    //     .attr("dominant-baseline", "middle")
    //     .attr('class', 'titleLines')      
    //     .attr('id', (d) => d.id);


    // // And give them a label
    // var titles = svg
    //   .selectAll(".titles")
    //   .data(data.nodes)
    //   .join("text")
    //   .filter(function(d) { return d.size == 3 }) 
    //     .attr("x", function(d){ return(xScale(d.value.date))+(spacing/2)})
    //     .attr("y",(d,i) => (timelineY)+(titleHeight[(i+1)%8]))
    //     .text((d) => metObjects[d.id.split('-')[1]].title)
    //     .attr("dominant-baseline", "middle")
    //     .attr('class', 'titles')
    //     .attr('id', (d) => d.id);


    // Link story
    var linkDesc = d3.select('#innerlinkdesc')
      .selectAll("span")
      .data(data.links)
      .join("span")
        .html((d) => makeSense(d.desc,metObjects,d.source, d.target))
        .attr('id', (d) => d.source);
        
    // images
    var images = svg
    .selectAll('.artworkImages')
    .data(data.nodes)
    .join('image')                             
    .filter(function(d) { return d.size == 3 }) 
      .attr('xlink:href', (d) => metObjects[d.id.split('-')[1]].primaryImageSmall)
      .attr("x", (d) => xScale(d.value.date)+(spacing/2)-(spacing*2))
      .attr("y", (timelineY)-(spacing*2))
      .attr('class', 'artworkImages')
      .on("click", (d) => window.open("https://www.metmuseum.org/art/collection/search/" + d.id.split('-')[1], "_blank"))
      .attr('id', (d) => d.id)
      .attr('alignment-baseline', 'bottom')
      .attr('width', (spacing*4))
      .attr('height', (spacing*2))

    // Add the links
    var links = svg
      .selectAll('.links')
      .data(data.links)
      .join('path')
      .style("fill", "none")
      .attr("stroke", 'gray')
      .attr("stroke-width",1)
      .attr('class', 'links');

    // Add the circle for the nodes
    var nodes = svg
    .selectAll(".nodes")
    .data(data.nodes)
    .join("circle")
      .attr('r', (d) => nodeSize[d.size-1])
      .style('fill', (d) => colorScale[d.size-1])
      .on("click", (d) => window.open("https://www.metmuseum.org/art/collection/search/" + d.id.split('-')[1], "_blank"))
      .attr('stroke', (d) => strokeColor[d.size-1])
      .attr('stroke-width', (d) => d.size/2)
      .attr('class', 'nodes')
      .attr('id', (d) => d.id);
    
    // Add the highlighting functionality
    nodes
    .on('mouseover', function (d) {

      document.getElementById('hovertitle').innerText = d.value.date + ' : ' + metObjects[d.id.split('-')[1]].title;
      document.getElementById('hovertitle').style.fontSize = "3em";

      // Highlight the nodes: every node is green except of him
        svg.selectAll('.nodes')
        .style("opacity", function(o) {
          return neighboring(d, o) || neighboring(o, d) ? 1 : 0.2;
        })
        .style("fill", function(o) {
          return neighboring(d, o) || neighboring(o, d) ? '#69b3b2' : 'B8B8B8';
        })

        nodes
          d3.select(this).style('stroke-width', '4')
          d3.select(this).style('fill', '#69b3b2')
          .style('opacity', 1);

      // Highlight the connections
      links
        .style('stroke', function (link_d) { return link_d.source === d.id || link_d.target === d.id ? '#69b3b2' : 'transparent';})
        .style('stroke-width', function (link_d) { return link_d.source === d.id || link_d.target === d.id ? 4 : 1;});
      
      //hide images
      svg.selectAll('.artworkImages')
        .style('opacity',function (image_d) { 
          if(d3.select(this).attr("id") === d.id){
            d3.select(this).raise()
            d3.selectAll('.links').raise()
            d3.selectAll('.nodes').raise()
            return 1
          } else {
            return 0
          }
        });

      linkDesc
        .style('opacity',function (linkdesc_d) { return d3.select(this).attr("id") === d.id ? 1 : 0.1;});


      svg.selectAll('.titles')
        .style('opacity',function (titles_d) { return d3.select(this).attr("id") === d.id ? 1 : 0.2;});

      svg.selectAll('.titleLines')
        .style('opacity',function (titleLines_d) { return d3.select(this).attr("id") === d.id ? 1 : 0.2;});

    })
    .on('mouseout', function (d) {
      document.getElementById('hovertitle').innerHTML = "Hover over a <span id='largedot'></span> to isolate the artwork and story.";
      document.getElementById('hovertitle').style.fontSize = "1em";
      nodes
        .style('fill', (d) => colorScale[d.size-1])
        .style('stroke', (d) => strokeColor[d.size-1])
        .style('stroke-width', (d) => d.size/2)
        .style('opacity', 1);

      links
        .style('stroke', 'gray')
        .style('stroke-width', 1);

      images
        .style('opacity', 1);
    
      linkDesc
        .style('opacity', 1);

      titles
        .style('opacity', 1);

      titleLine
        .style('opacity', 1);

    })

    //put the nodes above the lines
    d3.selectAll(".links").raise();
    d3.selectAll(".nodes").raise();

    //move images to the front on rollover on node
    d3.selectAll(".artworkImages").on("mouseover", function(d){
      d3.select(this).raise()
      d3.selectAll('.links').raise()
      d3.selectAll('.nodes').raise()
    });
    

  function ticked() {
    // Add the links
    links
      .attr('d', function (d) {
        start = idToNode[d.source].x   // X position of start node on the X axis
        end = idToNode[d.target].x    // X position of end node
        return ['M', start, idToNode[d.source].y,
      // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
          'A',                            // This means we're gonna build an elliptical arc
          (start - end) < -2500 ? (start - end)*((start - end)/2500) : (start - end), ',',    // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
          (start - end) < -2500 ? (start - end)*((start - end)/2500): (start - end), 0, 0, ',',
          start < end ? 1 : 0, end, ',', idToNode[d.target].y] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
          .join(' ');
      })

    nodes
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
  }
}

////////////////////////////////////////////////////

var w;

function startWorker(searchTerm,metObjects,list) {
  if (typeof(Worker) !== "undefined") {
    //if (typeof(w) == "undefined") {
      console.log('starting new web worker')
      w = new Worker("search.js");
    //}
    w.postMessage([searchTerm,metObjects,list])

    w.onmessage = function(event) {
      data.nodes = data.nodes.concat(event.data[0].nodes);
      data.links = data.links.concat(event.data[0].links);
      timeSpan = event.data[1];
      draw();
      allExtra = allExtra.concat(event.data[2].nodes)
      if (event.data[3] == true){
        w.terminate()
        addExtra()
      }

    };
  } else {
    console.log("Sorry! No Web Worker support.");
  }
}

function addExtra(){
  if (allExtra.length > 0){
    var newExtra = [allExtra.pop()]
    console.log(newExtra)
    data.nodes = data.nodes.concat(allExtra)
    draw();
    //setTimeout(addExtra,100);
  }
}

async function dataLoad() {
  // we can set up our layout before we have data
  metObjects = await fetch("./Node/reducedMETobjects.json");
  metObjects = await metObjects.json()
  list = await fetch("./Node/AJList-update.json");
  list = await list.json()
  tags = await fetch("./Node/MetSearchTags.json");
  tags = await tags.json()
  suggestions = await fetch("./Node/MetSearchSuggestions.json");
  suggestions = await suggestions.json()
  /*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
  autocomplete(document.getElementById("myInput"), Object.keys(tags));
  
  //typing settings
  var examples = [''];
  var options = {
    strings: examples,
    typeSpeed: 100
  };

  for (i=0;i<3;i++){
    var selectedVal = Infinity
    while(selectedVal > 500){
        var keys = Object.keys(suggestions)
        var rndm = Math.floor(Math.random() * keys.length)
        suggestedTerm = keys[rndm]
        selectedVal = suggestions[suggestedTerm]
        examples.unshift(suggestedTerm)
    }
    if (examples.length == 4) {
      var typed = new Typed("#myInput", options);
    }
  }
  
  document.getElementById("myInput").placeholder = 'Anything!';
}

search = function() {
  searchTerm = document.getElementById("myInput").value;
  searchTerm = toTitleCase(searchTerm)
  if (Object.keys(tags).includes(searchTerm)){
    console.log('searching for ' + searchTerm)
    document.getElementById("myInput").value = searchTerm;
    reset()
    startWorker(searchTerm,metObjects,list)
  } else {
    document.getElementById("myInput").value = '';
    document.getElementById("myInput").placeholder = 'Try Again!';
  }
}

function reset(){
  width = window.innerWidth - margin.left - margin.right
  height = window.innerHeight*0.45;
  previousYear = 0;
  allExtra = []
  data.nodes = []
  data.links = []
  timeSpan = 1;
  svg.selectAll("*").remove();
  draw()
}

function toTitleCase(str) {
  return str.replace(
      /\w\S*/g,
      function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
  );
}

// scroll testing
window.addEventListener('scroll', function() {
  var content = document.querySelector('svg')
  console.log(content.style.width)
  if (parseInt(content.style.width) > window.innerWidth){  
    var scrollPercent = ((pageXOffset+1) / (parseInt(content.style.width) - window.innerWidth)).toFixed(2)
    var innerlinkdesc = document.getElementById("innerlinkdesc")
    var storyBox = document.getElementById('linkDesc')
    storyBox.scroll(0, (innerlinkdesc.offsetHeight-storyBox.offsetHeight)*scrollPercent)
  }

});

dataLoad()

