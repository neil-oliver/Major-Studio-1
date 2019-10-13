const fs = require("fs");
const async = require('async');
var newData = [];

fs.readFile('data/fixedMETdata.json', (error, data) => {
    if (error) console.log(error);
    
    // var fixedData = data.toString().replace('}{"objectID','},{"objectID');
    // fs.writeFileSync('data/fixedMETdata.json', "[" + fixedData + "]");

    data = JSON.parse(data);
    
    async.eachSeries(data, function(obj, callback) {
        if (!(newData.includes(obj.objectID))){
            newData.push(obj.objectID);
            fs.appendFileSync('data/newMETdata.json', JSON.stringify(obj)+",");
            //console.log(obj.objectID + ' added.')
        } else {
            console.log('duplicate');
        }
    
    setTimeout(callback, 0);
    });
});