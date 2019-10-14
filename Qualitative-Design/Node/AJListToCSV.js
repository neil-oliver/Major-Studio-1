// convert AJList to CSV
var fs = require('fs');

fs.readFile('miniAJList.json', (error, data) => {
    if (error) console.log(error);
    data = JSON.parse(data);
      fs.writeFileSync('miniAJList.csv', "Source;Target\n");
      fs.writeFileSync('miniAJListlabels.csv', "Id;Label\n");

    for (var key in data) {
        for (var item in data[key]){
            if (item <4){
                var csvLine = key + ';' + data[key][item];
                fs.appendFileSync('miniAJList.csv', csvLine + '\n');
                var labelLine = data[key][item] + ';' + data[key][item].split('-')[1];
                fs.appendFileSync('miniAJListlabels.csv', labelLine + '\n');
            }
        }
        var labelLine = key + ';' + key.split('-')[1];
        fs.appendFileSync('miniAJListlabels.csv', labelLine + '\n');
    }
});