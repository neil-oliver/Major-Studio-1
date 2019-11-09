// starter code from : https://www.d3-graph-gallery.com/graph/arc_highlight.html

// SVG setup
var margin = {top: 10, right: 60, bottom: 30, left: 60},
width = window.innerWidth - margin.left - margin.right,
height = 500

var colorScale = ['orange', '#abdda4', '#74add1'];
var previousYear = 0;

// append the SVG object to the body of the page
var svg = d3.select("#content")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform","translate(" + margin.left + "," + margin.top + ")")

async function draw(data, metObjects) {

  console.log(data)

  var spacing = 200
  
  d3.select('svg')
    .style("height", (data.nodes.length*spacing)+(spacing*2));
  
  height = (data.nodes.length*spacing)+spacing;

  // List of node names
  var allNodes = data.nodes.map(function(d){return d.id})

  // A linear scale to position the nodes on the X axis
  var x = d3.scalePoint()
    .range([0, height])
    .domain(allNodes)

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

  var images = svg
    .selectAll('.artworkImages')
    .data(data.nodes)
    .join('image')
      .attr('width', 200)
      .attr('height', 200)
      .attr("y", function(d){ return(x(d.id))+(spacing/2)})
      .attr("x", (width/2)+300)
      .attr('class', 'artworkImages');


  // And give them a label
  var titles = svg
    .selectAll(".titles")
    .data(data.nodes)
    .join("text")
      .attr("y", function(d){ return(x(d.id))+(spacing/2)})
      .attr("x", (width/2)+100)
      .text((d) => metObjects[d.id.split('-')[1]].title)
      .attr('class', 'titles');

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
      .attr('class', 'years');

  // Add links between nodes. Here is the tricky part.
  // In my input data, links are provided between nodes -id-, NOT between node names.
  // So I have to do a link between this id and the name
  var idToNode = {};
  data.nodes.forEach(function (n) {
    idToNode[n.id] = n;
  });
  // Cool, now if I do idToNode["2"].name I've got the name of the node with id 2

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
    .attr('class', 'links');

    // Add the highlighting functionality
    nodes
      .on('mouseover', function (d) {
        // Highlight the nodes: every node is green except of him
        nodes.style('fill', "#B8B8B8")
        d3.select(this).style('fill', '#69b3b2')
        // Highlight the connections
        links
          .style('stroke', function (link_d) { return link_d.source === d.id || link_d.target === d.id ? '#69b3b2' : '#b8b8b8';})
          .style('stroke-width', function (link_d) { return link_d.source === d.id || link_d.target === d.id ? 4 : 1;})
      })
      .on('mouseout', function (d) {
        nodes.style('fill', (d) => colorScale[d.size-1])
        links
          .style('stroke', 'black')
          .style('stroke-width', '1')
      })


  // d3.select("svg g")
  //   .selectAll("circle")
  //   .data(data.nodes)
  //   .join("circle")
  //   .attr('r', (d) => d.size*10)
  //   .style('fill', (d) => colorScale[d.size-1])
  //   .attr('cx', width/2)
  //   .attr('cy', (d,i) => spacing*(i+1))
  //   .attr('stroke', 'grey')
  //   .attr('stroke-width', 1)
  //   .on("click", (d) => window.open("https://www.metmuseum.org/art/collection/search/" + d.id.split('-')[1], "_blank"))
  //   .on('mouseover', function(d,i) {
  //     d3.select(this).transition()
  //       .ease(d3.easeCubic)
  //       .duration(200)
  //       .attr('r', (d) => d.size*15)
  //   })
  //   .on('mouseout', function(d,i) {
  //     d3.select(this).transition()
  //       .ease(d3.easeCubic)
  //       .duration(200)
  //       .attr('r', (d) => d.size*10)
  //   });

  // d3.select('svg g')
  //   .selectAll('.years')
  //   .data(data.nodes)
  //   .join('text')
  //   .attr('x', (width/2)-500)
  //   .attr('y', (d,i) => spacing*(i+1))
  //   .text(function (d) {
  //     if (d.value.date != previousYear){
  //       previousYear = d.value.date
  //       return d.value.date
  //     } else {
  //       return ''
  //     }
  //   })
  //   .attr('class', 'years');

  // d3.select('svg g')
  //   .selectAll('.titles')
  //   .data(data.nodes)
  //   .join('text')
  //   .attr('x', (width/2)+100)
  //   .attr('y', (d,i) => spacing*(i+1))
  //   .text((d) => metObjects[d.id.split('-')[1]].title)
  //   .attr('class', 'titles');

  return Promise.resolve()
}