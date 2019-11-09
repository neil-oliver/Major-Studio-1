var fs = require('fs');
var async = require('async');

var linksCount = 0
var keysCount = 0

fs.readFile('AJList.json', (error, data) => {
    if (error) console.log(error);
    data = JSON.parse(data);

    async.forEachOf(data, function(value,key, callback) {
        // loop through and add each key to an array
        keysCount += 1;
        linksCount += data[key].length
        
        setTimeout(callback, 0);

    }, function() {
        console.log("The number of different possible links is : " + linksCount)
        console.log("The number of different linking items is : " + keysCount)
    })
});
