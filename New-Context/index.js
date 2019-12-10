console.log('load index.js')

var vertical = false
var finished = false;
// SVG setup
var margin = {top: 0, right: 60, bottom: 30, left: 60}
if (vertical){
  var width = window.innerWidth*0.45
  var height = window.innerHeight
} else {
  var width = window.innerWidth - margin.left - margin.right
  var height = window.innerHeight*0.45
}

var colorScale = ['#ece7f2', '#a6bddb', '#7fcdbb'];
var strokeColor = ['gray','#525252','#525252']
var nodeSize = [5,10,20]
var previousYear = 0;
var svg;

function setupSVG(){
  d3.select("svg").remove();

  // append the SVG object to the body of the page
  if (vertical){
    svg = d3.select("#content")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
  } else {
    svg = d3.select("#content")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")")
  }
}

//setupSVG
setupSVG()

var allExtra = []
var data = {'nodes': [], 'links' : []};
var timeSpan = 1;

// resizer!
//window.addEventListener("resize", flipIt);

function flipIt(){
  if (window.innerWidth < 750 || ((/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) && window.innerWidth < 750)) {
    vertical = true
    d3.selectAll(".timelineAxis").remove()
    setMargins()

  } else {
    vertical = false
    d3.selectAll(".timelineAxis").remove()
    setMargins()
  }
  //draw()
}

//////////////////////////////////////////////

function draw() {
  document.getElementById('explanation').style.visibility='visible';
  document.getElementById('hovertitle').style.visibility='visible';
  if (document.getElementById('intro')) {
    document.getElementById('intro').remove()
  }
  
  if (vertical){
    var spacing = width*0.8
  } else{
    var spacing = height*0.4
  }

  var scaleMin = d3.min(data.nodes, function(d) { return +d.value.date} );
  var scaleMax = scaleMin + timeSpan;

  var yearSize = spacing/20
  if (vertical) {
    width = window.innerWidth*0.45
    height = timeSpan*yearSize;
  } else {
    width = timeSpan*yearSize;
    height = window.innerHeight*0.45
  }

  
  if (vertical){
    var timeScale = d3.scaleLinear().domain([scaleMin, scaleMax]).range([0, height]);
    var timelineMiddle = 0 //position on the axis
  } else {
    var timeScale = d3.scaleLinear().domain([scaleMin, scaleMax]).range([0, width]);
    var timelineMiddle = height*0.85
  }

  if (vertical){
    d3.select('svg')
    .style("height", height+(spacing*2))
    .style("width", width + margin.left + margin.right);
  } else {
    d3.select('svg')
    .style("width", width+(spacing*2))
    .style("height", height + margin.top + margin.bottom);
  }

  var idToNode = {};
  data.nodes.forEach(function (n) {
    idToNode[n.id] = n;
  });

  var ticks = Math.floor(timeSpan/50)

  if (vertical){
      var timelineAxis = d3.axisLeft()
      .scale(timeScale)
      .tickArguments([ticks, "d"]);

    svg.append("g")
    .attr("transform", "translate("+timelineMiddle+","+(spacing/2)+")")
    .attr("class", "timelineAxis")
    .call(timelineAxis);
  } else {
    var timelineAxis = d3.axisBottom()
          .scale(timeScale)
          .tickArguments([ticks, "d"]);

    svg.append("g")
    .attr("transform", "translate("+spacing/2+","+ timelineMiddle+")")
    .attr("class", "timelineAxis")
    .call(timelineAxis);
}


  // set initialcy position before force layout 
  if (vertical){
    data.nodes.forEach(function(d) { d.y = timeScale(d.value.date)+(spacing/2); d.x = timelineMiddle; });
  } else {
    data.nodes.forEach(function(d) { d.x = timeScale(d.value.date)+(spacing/2); d.y = timelineMiddle; });
  }

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
  if (vertical){
    var simulation = d3.forceSimulation(data.nodes)
      .force('charge', d3.forceManyBody().strength(5))
      .force('y', d3.forceY().y((d) => timeScale(d.value.date)+(spacing/2)))
      .force('x', d3.forceX().x(timelineMiddle))
      .force("link", d3.forceLink().id((d) => d.id))
      .force('collision', d3.forceCollide().radius((d) => nodeSize[d.size-1]))
      .on('tick', ticked)
  } else {
    var simulation = d3.forceSimulation(data.nodes)
      .force('charge', d3.forceManyBody().strength(5))
      .force('x', d3.forceX().x((d) => timeScale(d.value.date)+(spacing/2)))
      .force('y', d3.forceY().y(timelineMiddle))
      .force("link", d3.forceLink().id((d) => d.id))
      .force('collision', d3.forceCollide().radius((d) => nodeSize[d.size-1]))
      .on('tick', function() { finished=false; ticked()})
      .on('end', function() { finished=true; });
  }
  ////////////////

    if (vertical){
      d3.selectAll('.artworkImages').remove()

    } else {

    // Link story
    var linkDesc = d3.select('#innerlinkdesc')
    .selectAll("span")
    .data(data.links)
    .join("span")
      .html((d) => makeSense(d.desc,metObjects,d.source, d.target))
      .attr('class', (d) => d.source);

      // images
      var images = svg
      .selectAll('.artworkImages')
      .data(data.nodes)
      .join('image')                             
      .filter(function(d) { return d.size == 3 }) 
        .attr('xlink:href', (d) => metObjects[d.id.split('-')[1]].primaryImageSmall)
        .attr("x", (d) => timeScale(d.value.date)+(spacing/2)-(spacing*2))
        .attr("y", (timelineMiddle)-(spacing*2))
        .on("click", (d) => window.open("https://www.metmuseum.org/art/collection/search/" + d.id.split('-')[1], "_blank"))
        .attr('class', (d) => 'artworkImages ' + d.id)
        .attr('alignment-baseline', 'bottom')
        .attr('width', (spacing*4))
        .attr('height', (spacing*2))
    }

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
      .attr('class', (d) => 'nodes ' + d.id);

      if (vertical){
        nodes.attr('opactiy', 0.6)
      }
    
    // Add the highlighting functionality
    if (!vertical){
      nodes
      .on('mouseover', function (d) {
        //document.getElementById('linkDesc').removeEventListener('scroll', matchscroll)

        document.getElementById('hovertitle').innerText = d.value.date + ' : ' + metObjects[d.id.split('-')[1]].title;
        document.getElementById('hovertitle').style.fontSize = "2em";

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
            if(d3.select(this).attr("class") == 'artworkImages '+d.id){
              d3.select(this).raise()
              d3.selectAll('.links').raise()
              d3.selectAll('.nodes').raise()
              return 1
            } else {
              return 0
            }
          });

        linkDesc
          .style('opacity',function (linkdesc_d) { return d3.select(this).classed(d.id) ? 1 : 0.1;});
          var span = $(`span.${d.id}`)
          if (span.length != 0){
            span[0].scrollIntoView()
          }
      })

      .on('mouseout', function (d) {
        // if (finished){
        //   document.getElementById('linkDesc').addEventListener('scroll', matchscroll)
        // }

        document.getElementById('hovertitle').innerHTML = "";
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

  } else {

    nodes.on('click', function (d) {
      //reset all of the nodes
      svg.selectAll("circle")
      .attr('stroke-width',1)
      .attr('opacity',0.6)
      .style('fill',(d) => colorScale[d.size-1]);

      // change to the selected node.
      $('.bg').css("background-image", "url('" + metObjects[d.id.split('-')[1]].primaryImageSmall + "')");
      d3.select(this)
      .attr('stroke-width',3)
      .attr('opacity',1)
      .style('fill','#a98b19');

      //change description
      $('#innerlinkdesc').html('')
      for (link in data.links){
        if (data.links[link].source == d.id || (data.links[link].target == d.id && data.links[link].source != d.id) ){
            $('#innerlinkdesc').html(makeSense(data.links[link].desc,metObjects,data.links[link].source, data.links[link].target))
            break;
        } else {
          $('#innerlinkdesc').html(`${d.value.date}<br><a href='https://www.metmuseum.org/art/collection/search/${d.id.split('-')[1]}' target='_blank'>${metObjects[d.id.split('-')[1]].title}</a><br><span>This didn't make it into our story, but its still a fantastic artwork from the same time period.</span>`)
        }
      }

      $('#linkDesc span').css('font-size','1em')
      $('#linkDesc a').css('color','#fff')

    })

    //put the nodes above the lines
    d3.selectAll(".links").raise();
    d3.selectAll(".nodes").raise();
  }

function ticked() {

  function curve(d) {

    // control X and Y for curves
    var ctlx = 10;
    var ctly = 35;

    // Bezier curve
    // we assume source is earlier than target or on same day
    var c, upper, lower;
    if (vertical) {
        // same day - control points on right - need to start with upper
        if (idToNode[d.source].y < idToNode[d.target].y) {
            upper = idToNode[d.source];
            lower = idToNode[d.target];
        } else {
            upper = idToNode[d.target];
            lower = idToNode[d.source];
        }
        c = "M" + upper.x + "," + upper.y +
            " C" + (upper.x + ctly) + "," + (upper.y - ctlx) +
            " " + (lower.x + ctly) + "," + (lower.y + ctlx) +
            " " + lower.x + "," + lower.y;
    } else {

      start = idToNode[d.source].x   // X position of start node on the X axis
      end = idToNode[d.target].x    // X position of end node
      c = ['M', start, idToNode[d.source].y,
        'A',                            // This means we're gonna build an elliptical arc
        (start - end) < -(height*5) ? (start - end)*((start - end)/(height*5)) : (start - end), ',',    // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
        (start - end) < -(height*5) ? (start - end)*((start - end)/(height*5)) : (start - end), 0, 0, ',',
        start < end ? 1 : 0, end, ',', idToNode[d.target].y] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
        .join(' ');
    }
    return c;
  }
  
  links
    .attr("d", function (d) {
      return curve(d);
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
      console.log('starting new web worker')
      w = new Worker("search.js");
    w.postMessage([searchTerm,metObjects,list])
    w.onmessage = function(event) {
      if (event.data[0] == true){
        data.nodes = data.nodes.concat(event.data[1].nodes);
        data.links = data.links.concat(event.data[1].links);
        timeSpan = event.data[2];
        document.getElementById("myInput").placeholder = '';
        draw();
        scrolly();
        allExtra = allExtra.concat(event.data[3].nodes)
        if (event.data[4] == true){
          w.terminate()
          addExtra()
          finished = true;
          var storyBox = document.getElementById('linkDesc')
          //storyBox.addEventListener('scroll', matchscroll)
        }
      } else {
        console.log('no results')
        document.getElementById("myInput").placeholder = 'Try Again!';
        //document.getElementById('explanation').innerHTML = "We tried, but unfortunately we didn't find any stories for " + document.getElementById("myInput").value
        //document.getElementById('hovertitle').style.visibility='hidden';

        document.getElementById("myInput").value = '';
      }

    };
  } else {
    console.log("Sorry! No Web Worker support.");
  }
}

function addExtra(){
  if (allExtra.length > 0){
    // create existing id list
    var ids = []
    var newArray = []
    for (x in data.nodes){
      ids.push(data.nodes[x].id)
    }
    for (x in allExtra){
      if (!ids.includes(allExtra[x].id)){
        newArray.push(allExtra[x])
      }
    }
      //data.nodes = data.nodes.concat(allExtra)
      data.nodes = data.nodes.concat(newArray)
      console.log('--------------push it real good')
      draw();
  }
}
var typed;
//stop the suggestions when the user clicks a box
$('input').on('click', function(){
  console.log('stop auto typing')
  typed.stop()
  setTimeout(function(){ document.getElementById("myInput").value = '';   document.getElementById('myInput').style.color = '#383838';}, 200);
})

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
    typeSpeed: 110
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
    if (examples.length == 4 ) {
      document.getElementById('myInput').style.color = 'grey';

      typed = new Typed("#myInput", options);
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
  $('.bg').css("background-image", "url('')");
  $('#innerlinkdesc').html('')
  if (svg){
    d3.selectAll(".timelineAxis").remove()
    svg.selectAll("*").remove();
    setMargins()
    draw()
  }
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
window.addEventListener('scroll', scrolly)
var svgcontent = document.querySelector('svg')
var innerlinkdesc = document.getElementById("innerlinkdesc")
var storyBox = document.getElementById('linkDesc')

// function matchscroll(){
//   if (storyBox.scrollTop < 1){
//   var storyScollTop = 1
//   } else {
//     var storyScollTop = storyBox.scrollTop
//   }
//   var storyScrollPercent = storyScollTop / (innerlinkdesc.offsetHeight-storyBox.offsetHeight+1)
//   window.scroll(((parseInt(svgcontent.style.width) - window.innerWidth) * storyScrollPercent),0)
// }


//vertical alignment
const header = document.getElementsByTagName('header')[0]
const content = document.getElementById('content')
const description = document.getElementById('linkDesc')
const intro = document.getElementById('intro')
const hovertitle = document.getElementById('hovertitle')

function scrolly() {

  if (vertical){

    //sort horizontal orientation for mobile
    var innerStory = document.getElementById('innerlinkdesc')
      if (screen.innerWidth > screen.innerHeight){
        innerStory.style.visibility = 'hidden';
        intro.style.visibility = 'hidden';

        if (!(pageYOffset < (window.innerHeight*0.5))){
          innerStory.style.visibility = 'visible';
        }

      } else {
        innerStory.style.visibility = 'visible';
        intro.style.visibility = 'visible';

      }

    if (data.nodes.length != 0){


      // change background image
      var filteredImages = data.nodes.filter(function(d) { return d.size == 3 }) 
      var backgroundIndex = Math.floor(((pageYOffset / (document.documentElement.scrollHeight - window.innerHeight))*100) / (100 / (filteredImages.length)))

      //get rid of overscroll errors
      if (backgroundIndex < 0){
        backgroundIndex = 0
      }
      if (isNaN(backgroundIndex)){
        backgroundIndex = 0
      }
      if (backgroundIndex > filteredImages.length-1){
        backgroundIndex = filteredImages.length-1
      }

      var backgroundId = filteredImages[backgroundIndex].id.split('-')[1]
      $('.bg').css("background-image", "url('" + metObjects[backgroundId].primaryImageSmall + "')");
      $('body').css('color','#fff')
      $('#linkDesc a').css('color','#fff')

      $("#logo").attr("src","The_Metropolitan_Museum_of_Art_Logo_white.svg");

      $('#topfade').addClass('topfade')
      $('#bottomfade').addClass('bottomfade')

      // change text
      var linkIndex = Math.floor(((pageYOffset / (document.documentElement.scrollHeight - window.innerHeight))*100) / (100 / (data.links.length)))

      //get rid of overscroll errors
      if (linkIndex < 0){
        linkIndex = 0
      }
      if (linkIndex > data.links.length-1){
        linkIndex = data.links.length-1
      }
      if (isNaN(linkIndex)){
        linkIndex = 0
      }

        $('#innerlinkdesc').html(makeSense(data.links[linkIndex].desc,metObjects,data.links[linkIndex].source, data.links[linkIndex].target))
        $('#linkDesc a').css('color','#fff')
        $('#linkDesc').css('font-size','3em')
        $('#linkDesc').css('line-height','1.5em')

      //set all nodes to normal color / transparent
      svg.selectAll("circle")
      .attr('stroke-width',1)
      .attr('opacity',0.6)
      .style('fill',(d) => colorScale[d.size-1]);

      // change color of selected node
      svg.selectAll("circle." + filteredImages[backgroundIndex].id)
        .attr('stroke-width',3)
        .attr('opacity',1)
        .style('fill','#a98b19');
    }

  } else {
    if (parseInt(svgcontent.style.width) > window.innerWidth){  
      var scrollPercent = ((pageXOffset+1) / (parseInt(svgcontent.style.width) - window.innerWidth)).toFixed(2)
      var innerlinkdesc = document.getElementById("innerlinkdesc")
      var storyBox = document.getElementById('linkDesc')
      storyBox.scroll(0, (innerlinkdesc.offsetHeight-storyBox.offsetHeight)*scrollPercent)

    }
    $('#linkDesc a').css('color','#383838')
    $('#linkDesc').css('font-size','2em')
    $('#linkDesc').css('line-height','2em')
    $('body').css('color','#383838')
    $('.bg').css("background-image", "url('')");

    //highlight node
    svg.selectAll("circle")
    .attr('stroke-width',1)
    .attr('opacity',1)
    .style('fill',(d) => colorScale[d.size-1]);

  }

  setMargins()

};

dataLoad()

function setMargins(){
  content.style.marginTop = header.clientHeight + 'px';
  intro.style.top = header.clientHeight + 50 + 'px';
  intro.style.zIndex = -1
  hovertitle.style.top = header.clientHeight + 'px';


  if (vertical){
    //change header to move on scroll
    header.style.position = 'absolute';

    //hide footer
    document.getElementById('footer').style.opacity = 0;

    //size description box
    description.removeAttribute("max-height");
    description.removeAttribute("overflow");

    $('#linkDesc').css('padding-left','5%')
    $('#linkDesc').css('padding-right','5%')
    description.style.marginLeft = '25%'
    description.style.marginRight = '0'
    content.style.marginTop = 150 + 'px';

  } else {
    header.style.position = 'fixed'
    description.style.maxHeight = window.innerHeight - content.clientHeight - header.clientHeight - 70 + 'px';
    description.style.marginLeft = '0'
    description.style.marginRight = '0'
    description.style.overflow = 'scroll'
    description.style.marginBottom = '2.5em'


    $('#topfade').removeClass('topfade')
    $('#bottomfade').removeClass('bottomfade')
    $("#logo").attr("src","The_Metropolitan_Museum_of_Art_Logo.svg");

    if ($('#bg').attr("background-image")){
      $('#bg').removeAttribute("background-image");
    }

  }

}

function init(){
          
  flipIt()
  setMargins()
  finished = false
}

init();

window.addEventListener('resize', setMargins);
window.addEventListener('resize', scrolly);

//device orientation
window.addEventListener("orientationchange", function() {
  console.log("the orientation of the device is now " + screen.orientation.angle);
  scrolly()
});
