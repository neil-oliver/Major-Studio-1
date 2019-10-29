
async function dataLoad() {
  // we can set up our layout before we have data
  initializeLayout();
  //const data = await d3.json("./iris_json.json");
  draw();
}


// this function sets up everything we can before data loads
function initializeLayout() {

}

// everything in this function depends on data, so the function is called after data loads and whenever state changes
function draw() {
  const svg = d3.select(".timeline");
  const rect = svg
    .selectAll("rect")
    .data() // the second argument is the key
    .join()
}

// this function is only called once
dataLoad();
