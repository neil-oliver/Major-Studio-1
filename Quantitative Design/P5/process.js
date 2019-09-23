
processData();

let metData = {};
let metDataPercentages = {};

async function processData() {
    for (const obj in rawData) {
      await sortData(rawData[obj]);
    }
    download(JSON.stringify(metData), "ProcessedData.json", '"application/json"');
    //download(JSON.stringify(metDataPercentages), "ProcessedPercentageData.json", '"application/json"');
}

//Saving JSON Locally
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function dateBracket(objectDate){
    var bracket = null;
    
    bracket = parseInt(objectDate) // need a more robust method
    bracket = bracket - bracket % 10 
    return bracket;
}

// create your own array using just the data you need
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
            //console.log('no start or end date for artist')
        }
    }
    return result;
}
