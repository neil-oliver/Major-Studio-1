var cnv;
const objectBaseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';
//addToDOM[0][0] is the span
//addToDOM[0][1] is the text
//addToDOM[0][2] is the html


var addToDOM = [];
function preload() {
    data = loadJSON('AJList.json');
    keys = loadJSON('keys.json');
}

function setup() {
    cnv = createCanvas(0, 0);
    tellStory();
}

var rnd = 1;
var sentenceExamples = [
    [["La Grenouillère","Artwork"],["was painted in","Connector"],["1869","Date"],"date"],
    [["Claude Monet","Artist"],["was born in","Connector"],["France","Place"],"geography"],
    [["Water Lilies","Artwork"],["contains","Connector"],["Frogs","Made you look..."],"content"]
]
var sentenceIndex = 0;
var storyIndex = 0;
var isTag = false;
var story = '';
var gifIndex = 1;

function draw(){
    if (frameCount % 270 == 0){
        highlight()
    }
    if (frameCount % 60 == 0){
        var gif = select('#mini-path')
        gif.attribute('src','mini-path-gif/mini-path' + gifIndex + '.png')
        if (gifIndex == 7){
            gifIndex = 1
        } else {
            gifIndex +=1
        }
    }

    if (addToDOM.length > 0){
        var part = addToDOM[0][1].slice(0,storyIndex);

        if( part.slice(-1) === '<' ) isTag = true;
        if( part.slice(-1) === '>' ) isTag = false;
        
        while (isTag){ 
            storyIndex += 1
            part = addToDOM[0][1].slice(0,storyIndex);
            if( part.slice(-1) === '<' ) isTag = true;
            if( part.slice(-1) === '>' ) isTag = false;
        }

        if (frameCount % rnd == 0){
            
            if(!isTag) {
                addToDOM[0][0].html(part);
                storyIndex += 1
                rnd = round(random(1,10))
            }
        }

        if (storyIndex == addToDOM[0][1].length) {
            addToDOM[0][0].html(addToDOM[0][1]);
            // add to mini story
            let div = document.getElementById('mini-story')
            createSpan(addToDOM[0][1]).parent(div)
            addToDOM.shift();
            rnd = 60;
            storyIndex = 0;
            isTag = false;
        }
    }

    if (frameCount % 300 == 0){
        var sentenceFrom = select('#from')
        var sentenceConnect = select('#connect')
        var sentenceTo = select('#to')
        sentenceTo.removeClass('date')
        sentenceTo.removeClass('geography')
        sentenceTo.removeClass('content')
        sentenceFrom.html('<h2>' + sentenceExamples[sentenceIndex][0][0] + '</h2><p>' + sentenceExamples[sentenceIndex][0][1] + '</p>').addClass(sentenceExamples[sentenceIndex][3])
        sentenceConnect.html('<h2>' + sentenceExamples[sentenceIndex][1][0] + '</h2><p>' + sentenceExamples[sentenceIndex][1][1] + '</p>').addClass(sentenceExamples[sentenceIndex][3])
        sentenceTo.html('<h2>' + sentenceExamples[sentenceIndex][2][0] + '</h2><p>' + sentenceExamples[sentenceIndex][2][1] + '</p>').addClass(sentenceExamples[sentenceIndex][3])
        sentenceTo.addClass('highlighted')


        if (sentenceIndex == sentenceExamples.length-1){
            sentenceIndex = 0;
        } else {
            sentenceIndex += 1;
        }
    }

    document.getElementById('more').onclick = function() {
        console.log('lets start again')
        var wipeStory = select('#story')
        wipeStory.html('',false)
        var wipeMiniStory = select('#mini-story')
        wipeMiniStory.html('',false)
        addToDOM = [];
        lastKey = 'start';
        story = '';
        storyIndex = 0;
        isTag = false;
        tellStory();
    }
}

var selectedSpan;

function highlight() {
    if (selectedSpan){
        selectedSpan.removeAttribute('id')
    }
    var allSpans = selectAll('span','story');
    selectedSpan = random(allSpans);
    selectedSpan.attribute('id', 'highlighted');

}

var key;
var lastKey = 'start';


function tellStory(){
    // Read adjacency list
            
    if (!key){
        key = keys[round(random(Object.keys(keys).length))];
    }

    // Create 100 links
    (async () => {
        var runStory = true;
        var used = []

        while (runStory == true){
            
            var span;
            let div = document.getElementById('story')

            span = createSpan('').parent(div);
            var toAdd = await makeSense(lastKey,key)
            if (toAdd) {
                toAdd.unshift(span)

                //check the length before adding it and story running the story
                var tmp = document.createElement("div");
                tmp.innerHTML = toAdd[1];

                if ((story.length + tmp.innerText.length) < 500){ // how do you just get the text?
                    addToDOM.push(toAdd)
                    story += tmp.innerText
                    runStory = true;
                } else {
                    runStory = false;
                    key = lastKey;
                    lastKey = 'start';
                }
            }

            var spanClass;
            if (lastKey.split('-',1)[0] == 'objectID'){
                spanClass = key;
            } else {
                spanClass = lastKey;
            }

            // detect class type
            if (spanClass.split('-',1)[0] == 'artistBeginDate' || spanClass.split('-',1)[0] == 'artistEndDate' || spanClass.split('-',1)[0] == 'objectBeginDate') {
                span.addClass('date')
            };

            if (spanClass.split('-',1)[0] == 'tags' || spanClass.split('-',1)[0] == 'medium') {
                span.addClass('content')
            };

            if (spanClass.split('-',1)[0] == 'city' || spanClass.split('-',1)[0] == 'excavation' || spanClass.split('-',1)[0] == 'artistNationality') {
                span.addClass('geography')
            };


            // Remove Keys
            if (lastKey != 'start'){
                data[key].forEach((element,i) => {
                    if ( data[key][i] == lastKey) {
                        //console.log("removing " + lastKey + " from " + key);
                        data[key].splice(i, 1); 
                    }
                });
                
                data[lastKey].forEach((element,i) => { 
                    if ( data[lastKey][i] == key) {
                        //console.log("removing " + key + " from " + lastKey);
                        data[lastKey].splice(i, 1); 
                    }
                });
                
            }
            used.push(key.split('-')[1])

            lastKey = key;
            var tempKey;
            if (data[key].length > 0) {

                var high = 0;

                data[key].forEach((element,i) => {

                    var score = 0;
                    // create an element of randomness
                    score += round(random(1,5))
                    // add to the score
                    if (element.split('-',1)[0] == 'excavation') {
                        console.log('yay, excavation. have a +10')
                        score += 10
                    }
                    if (element.split('-',1)[0] == 'city') {
                        console.log('yay, we found a city. have a +9')

                        score += 9
                    }
                    if (element.split('-',1)[0] == 'artistNationality') {
                        console.log('yay, nationalities. have a +5')

                        score += 5
                    }
                    if (element.split('-',1)[0] == 'tags') {
                        score += 2
                    }

                    if (used.includes(element.split('-')[1])) {
                        console.log('boo, this has been used before. go back to zero')

                        score = 0;
                    }
                    if (element.split('-',1)[0] == key.split('-',1)[0]) {
                        console.log('literally the same as last time. go back to zero')

                        score = 0;
                    }

                     if (data[element].length < 5) {
                        score += data[element].length
                     } else {
                         score +=4
                     }

                    if (score > high){
                        high = score;
                        tempKey = element;
                    }
                });
                key = tempKey;
                console.log('newKey = ' + key);
            } else {
                console.log('there are no more links!');
                break;
            }
        }
        console.log('finised telling story');
        createSpan('.')
    })();

}

var first = false;

async function makeSense(from,to){
        
    var connectingString;

    if (from != 'start'){
        var getID;

        // work out if the 'from' or 'to' value is the objectID
        if (from.split('-',1)[0] == 'objectID') {
            getID = from.split('-')[1]
        } else {
            getID = to.split('-')[1]
        }

        //get the information about the item from the MET api
        const response = await fetch(objectBaseUrl + getID);
        var metObject = await response.json();

        //object to hold all of the correct sentences, either from the starting point of an object or a linking detail (for instance city or medium)
        var list = {};
        list.objectID = {
            objectID : '',
            artistDisplayName : [metObject.title + ' was created by ' + metObject.artistDisplayName + '.'],
            artistBeginDate : [metObject.title + ' was created by ' + metObject.artistDisplayName + ' who was born in ' + metObject.artistBeginDate + '.'],
            artistEndDate : [metObject.title + ' was created by ' + metObject.artistDisplayName + ' who died in ' + metObject.artistEndDate + '.'],
            objectBeginDate : [metObject.title + ' was created in ' + metObject.objectBeginDate + '.'],
            tags : [metObject.title + ' contains ' + to.split('-')[1] + '.'],
            artistNationality : [metObject.title + ' was created by ' + metObject.artistDisplayName + ' who was born in ' + to.split('-')[1] + '.'],
            excavation : [metObject.title + ' was excavated in ' + metObject.excavation + '.'],
            city : [metObject.title + ' was created in ' + metObject.city + '.'],
            medium: [metObject.title + ' was created using ' + metObject.medium + '.']
        };
        
        list.artistDisplayName = {objectID : [' ' + from.split('-')[1] + ' created <b><a href="' + metObject.objectURL + '" target="_blank">' + metObject.title + '</a></b>. ']};
        list.artistBeginDate = {objectID : [' ' + from.split('-')[1] + ' is also the birth year of ' + metObject.artistDisplayName + ', who created <b><a href="' + metObject.objectURL + '" target="_blank">' + metObject.title + '</a></b>. ']};
        list.artistEndDate = {objectID : [' ' + from.split('-')[1] + ' is also the year of death of ' + metObject.artistDisplayName + ', who created <b><a href="' + metObject.objectURL + '" target="_blank">' + metObject.title + '</a></b>. ']};
        list.objectBeginDate = {objectID : [' ' + from.split('-')[1] + ' was also when <b><a href="' + metObject.objectURL + '" target="_blank">' + metObject.title + '</a></b> was created. ']};
        list.tags = {objectID : [' ' + from.split('-')[1] + ' features in <b><a href="' + metObject.objectURL + '" target="_blank">' + metObject.title + '</a></b>. ']};
        list.artistNationality = {objectID : [' ' + from.split('-')[1] + ' is the birthplace of ' + metObject.artistDisplayName + ', who created <b><a href="' + metObject.objectURL + '" target="_blank">' + metObject.title + '</a></b>. ']};        
        list.excavation = {objectID : [' ' + from.split('-')[1] + ' is the same year that <b><a href="' + metObject.objectURL + '" target="_blank">' + metObject.title + ' </a></b> was excavated. ']};       
        list.city = {objectID : [' ' + from.split('-')[1] + ' is where <b><a href="' + metObject.objectURL + '" target="_blank">' + metObject.title + '</a></b> was created. ']};     
        list.medium = {objectID : [' ' + from.split('-')[1] + ' was the same medium ' + metObject.artistDisplayName + ' used to create <b><a href="' + metObject.objectURL + '" target="_blank">' + metObject.title + '</a></b>. ']};
        
        // object senstences dont have links by default but need one if it is the first sentence so add one.
        if (first == true){
            var x = list[from.split('-',1)[0]][to.split('-',1)[0]];
            if (from.split('-',1)[0] == 'objectID') {
                x = x[0].substr(metObject.title.length);
                x = '<b><a href="' + metObject.objectURL + '" target="_blank">' + metObject.title + ' </a></b>' + x;

                list[from.split('-',1)[0]][to.split('-',1)[0]][0] = x;
            }

            // delete the word 'also' or 'same' from the first sentence
            list[from.split('-',1)[0]][to.split('-',1)[0]][0] = list[from.split('-',1)[0]][to.split('-',1)[0]][0].replace('same ', '');
            list[from.split('-',1)[0]][to.split('-',1)[0]][0] = list[from.split('-',1)[0]][to.split('-',1)[0]][0].replace('also ', '');
        }

        // remove any square brackets surround the title
        list[from.split('-',1)[0]][to.split('-',1)[0]][0] = list[from.split('-',1)[0]][to.split('-',1)[0]][0].replace(metObject.title, metObject.title.replace(/[\[\]']+/g,''));
        // get rid of contents in brackets to shorten the title
        //check if the brackets are at the end of the sentence before adding a space
        if (metObject.title[metObject.title.length-1] == ')') {
            list[from.split('-',1)[0]][to.split('-',1)[0]][0] = list[from.split('-',1)[0]][to.split('-',1)[0]][0].replace(metObject.title, metObject.title.replace(/\s*\(.*?\)\s*/g, ''));
        } else {
            list[from.split('-',1)[0]][to.split('-',1)[0]][0] = list[from.split('-',1)[0]][to.split('-',1)[0]][0].replace(metObject.title, metObject.title.replace(/\s*\(.*?\)\s*/g, ' '));
        }

        //do the same for the artist
        if (metObject.artistDisplayName[metObject.artistDisplayName.length-1] == ')') {
            list[from.split('-',1)[0]][to.split('-',1)[0]][0] = list[from.split('-',1)[0]][to.split('-',1)[0]][0].replace(metObject.artistDisplayName, metObject.artistDisplayName.replace(/\s*\(.*?\)\s*/g, ''));
        } else {
            list[from.split('-',1)[0]][to.split('-',1)[0]][0] = list[from.split('-',1)[0]][to.split('-',1)[0]][0].replace(metObject.artistDisplayName, metObject.artistDisplayName.replace(/\s*\(.*?\)\s*/g, ' '));
        }

        if (String(metObject.objectBeginDate).substring(1) == '-'){
            list[from.split('-',1)[0]][to.split('-',1)[0]][0] = list[from.split('-',1)[0]][to.split('-',1)[0]][0].replace(metObject.objectBeginDate, String(metObject.objectBeginDate).substring(1,str.length) + 'BC');
        }

        connectingString = list[from.split('-',1)[0]][to.split('-',1)[0]];
        first = false;
    } else {
        first = true;
    }

    return connectingString;
}
