  
newObjects = {}
function getHeights(){
    (async () => {
        console.log('starting')
        var metObjects = await fetch("./Node/reducedMETobjects.json");
        metObjects = await metObjects.json()
        for (i in metObjects){
            newObjects[metObjects[i].objectID] = metObjects[i]
            if(metObjects[i].primaryImageSmall != ''){
                var image = await getImage(metObjects[i].primaryImageSmall)
                newObjects[metObjects[i].objectID].primaryImgHeight = image.height;
                newObjects[metObjects[i].objectID].primaryImgWidth = image.width ;
                console.log(metObjects[i].objectID)
            }
        }
        download(JSON.stringify(newObjects), "newMetObjects.json", '"application/json"');
    })();
}

async function getImage(url){
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.src = url;
        img.onload = () => resolve(img)
    })
}

  //Saving JSON Locally
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

getHeights()