
////////////////////////////////////////////////////////////////////

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
  var spacing = 200
  
  d3.select('svg')
    .style("height", (data.nodes.length*spacing)+spacing);

  d3.select("svg g")
    .selectAll("circle")
    .data(data.nodes)
    .join("circle")
    .attr('r', (d) => d.size*10)
    .style('fill', (d) => colorScale[d.size-1])
    .attr('cx', width/2)
    .attr('cy', (d,i) => spacing*(i+1))
    .attr('stroke', 'grey')
    .attr('stroke-width', 1)
    .on("click", (d) => window.open("https://www.metmuseum.org/art/collection/search/" + d.id.split('-')[1], "_blank"))
    .on('mouseover', function(d,i) {
      d3.select(this).transition()
        .ease(d3.easeCubic)
        .duration(200)
        .attr('r', (d) => d.size*15)
    })
    .on('mouseout', function(d,i) {
      d3.select(this).transition()
        .ease(d3.easeCubic)
        .duration(200)
        .attr('r', (d) => d.size*10)
    });

  d3.select('svg g')
    .selectAll('.years')
    .data(data.nodes)
    .join('text')
    .attr('x', (width/2)-500)
    .attr('y', (d,i) => spacing*(i+1))
    .text(function (d) {
      if (d.value.date != previousYear){
        previousYear = d.value.date
        return d.value.date
      } else {
        return ''
      }
    })
    .attr('class', 'years');

    d3.select('svg g')
    .selectAll('.titles')
    .data(data.nodes)
    .join('text')
    .attr('x', (width/2)+100)
    .attr('y', (d,i) => spacing*(i+1))
    .text((d) => metObjects[d.id.split('-')[1]].title)
    .attr('class', 'titles');


  // Add links between nodes. Here is the tricky part.
  // In my input data, links are provided between nodes -id-, NOT between node names.
  // So I have to do a link between this id and the name
  var idToNode = {};
  data.nodes.forEach(function (n) {
    idToNode[n.id] = n;
  });
  // Cool, now if I do idToNode["2"].name I've got the name of the node with id 2

  // Add the links
  svg
    .selectAll('mylinks')
    .data(data.links)
    .enter()
    .append('path')
    .attr('d', function (d) {
      start = x(idToNode[d.source].name)    // X position of start node on the X axis
      end = x(idToNode[d.target].name)      // X position of end node
      return ['M', start, height-30,    // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
        'A',                            // This means we're gonna build an elliptical arc
        (start - end)/2, ',',    // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
        (start - end)/2, 0, 0, ',',
        start < end ? 1 : 0, end, ',', height-30] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
        .join(' ');
    })
    .style("fill", "none")
    .attr("stroke", "black")

  return Promise.resolve()
}