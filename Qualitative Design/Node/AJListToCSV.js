// convert AJList to CSV
var fs = require('fs');

fs.readFile('AJList.json', (error, data) => {
    if (error) console.log(error);
    data = JSON.parse(data);
      fs.writeFileSync('AJList.csv', "Source;Target\n");
    
    for (var key in data) {
        for (var item in data[key]){
            var csvLine = key + ';' + item;
            fs.appendFileSync('AJList.csv', csvLine + '\n');
        }
    }
})