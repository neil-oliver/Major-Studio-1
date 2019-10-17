# A Great Story doesnt happen by accident
While every piece within the [MET Museum](https://www.metmuseum.org) has an impoertant part in art and history, linking one of the 62,856 pieces together because they both contain **men** really ins't that interesting.

This is just one example of many decisions of what to include (or exclude) in the story of The MET collection.

## How does it work? - The technical stuff
We need to create an [adjacency list](https://en.wikipedia.org/wiki/Adjacency_list) using Node.js. 
This involves looping through the whole of the MET data, adding each item to the list and then adding a reference to any other item it links to. Its not just artworks that get added to the list, but actually anything that is linked. That mean **every date, tag, place, medium and person** has their own link in the adjacency list. Its quite a long process and efficiency is key, instead of explaining it here, you can check out the [code](https://github.com/neil-oliver/Major-Studio-1/blob/master/Qualitative-Design/Node/story.js) with detailed comments.

### Not everything is interesting.
First we have to decide what would make an interesting link. We chose:
- Artist year of birth
- Artist year of death
- The year the piece was created (sometimes this is an approximation)
- The artist
- Artist place of birth (this has to be converted from a nationality).
- The contents (tags) of the artwork (i.e. does it contain dogs?) - *they all have to be separated and linked separately*.
- The medium of the artwork (what is itr made of?)
- Where the art was made
- Where the art was excavated

### What did we ignore?
Within these categories we chose to ignore some possible links. 
- Any medium that had been used more than 50 times
- Any tag that was used more than 1000 times
- Any tag that has the tag in the title

### Art data isnt perfect
Sometimes there are errors on more commonly, information is missing or unknown about a piece. We therefore also excluded any of the following:
- Artwork with a blank title
- Artwork by an unknown artist
- Any unknown mediums
- Fragments of items
Due to the high number of variations in the ways the issues above present themselves, different exclusion lists were created and each object is referenced against the list before adding it to the adjacency list.

Once you have done all of that and let it process for a *very* long time, you end up with [this](https://github.com/neil-oliver/Major-Studio-1/blob/master/Qualitative-Design/Node/AJList.json), a file so big that **GitHub can't display it!** To give you an idea, here is a **tiny** section of the adjacency matrix visualized using [Gephi](https://gephi.org).
![](https://github.com/neil-oliver/Major-Studio-1/blob/master/Qualitative-Design/mini.svg)

## So its all linked together, now what?
### Telling the Story
After everything is linked we now need to follow a path from one item to another.
### Random is easy, but not perfect
The first iteration of the project chose each link at random, as this is intended to be a *random* story, so that makes sense. The problem is that for each artwork, it potentially has links to 4 dates (the artist year of birth, artist year of death, creation date and date when it was excavated). Not every artwork receives every link so in many cases, dates make up over 50% of the possible links. This doesnt cause a problem, its just **not that interesting**.

### Rarity is interesting.
In reality *some links are more interesting than others*. In order to stop the high number of date realted links, and to pick out some of the rarer links that are hidden behind the scenes (the user only sees <1% of all of the possibilities), we created a ranking system by giving each link a score, with **some element of randomness** to pick the more interestings links where possible.
- Start at 0
- Pick a random score between 1 and 5 as a starting point
- Add 10 if there is a link to something that was excavated (these are pretty rare to find so they make an interesting story)
- Add 7 if its links to the same city (knowing the country is quite common, but knowing the city is much less common)
- Add 5 if the artists nationality (where they were born) is known.
- Add 2 if there link is a tag. As we originally only included tags that were used less than 50 times, these can be very unique and interesting. 

**Zero Score**
We want to avoid (where we can) making similar links within the story, so if the same item has been used before, or it was the same kind of link (for expample from place of birth to place of birth), we give it a zero score.
![](https://github.com/neil-oliver/Major-Studio-1/blob/master/Qualitative-Design/mini-path.png)

```javascript
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
```

### Speaking English
We now have a start and end point, usually an artwork and a place, time or tag. We need to create a sentence for our story. Many things have generic names so hyperlinks were also added in to allow the user to visit the correct page of the MET website.

```javascript
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

```

### Cleaning the data
Most of the inconsistencies in the data has been removed during the process of creating the adjacency list, however some data items are fine to be stored, but could be presented in a better way.  
A few examples of this are titles that are surrounded by square brackets and additional information such as dates or alternative names being presented in parentheses in both the title and ther artist name. 
Before the sentence is added to the DOM, these items are searched for and removed (they can still be seen by the user if they click on the link to the item on the MET's website.)
```javascript
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
```

### An Endless loop
Adding similar links in the story isnt ideal, but its not the end a totally rubbish story. Repeating the same sentence isnt negotiable, it would be better to stop talking. Therefore each time a sentence is produced, the link is removed from the adjacency list. 

```javascript
if (lastKey != 'start'){
    data[key].forEach((element,i) => {
        if ( data[key][i] == lastKey) {
            data[key].splice(i, 1); 
        }
    });

    data[lastKey].forEach((element,i) => { 
        if ( data[lastKey][i] == key) {
            data[lastKey].splice(i, 1); 
        }
    });
}
```

### Check the length
This story can go on for a *very long time*. We need to know when to stop it. Initially we counted a number of sentences, but the varying length of titles meants that we ended up with vastly different length stories. The updated version now evaluated the current length of story, stripping away any HTML tags, plus the next (once again stripping away any HTML) sentence, against a set character limit before adding the sentence. 

The lengths still vary, so the area for the story is slightlyt flexible, with an overflow creating a scroll area to stop it ever pushing the layout totally out of control.

```javascript
let div = document.getElementById('story')

span = createSpan('').parent(div);
var toAdd = await makeSense(lastKey,key)
if (toAdd) {
    toAdd.unshift(span)
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
```

### Type it out
Animations can be fun, grab the users interest and give the website time to process. P5 was used in a very limited way. A 1px canvas was drawn in the corner to allow access to P5 simplified library of commands for interacting with the DOM and to allow the use of the draw loop for a typing animation. No information is drawn in the canvas and all visuals and styling are done within HTML and CSS.

A custom typing animation was created that reads from a queue of information and can output html tags while typing one letter at a time. This was **A lot harder than it sounds!**. It even has randomization in the typing speed and natural pauses after each sentence.

```javascript
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
        // add to mini story at the bottom of the page
        let div = document.getElementById('mini-story')
        createSpan(addToDOM[0][1]).parent(div)
        addToDOM.shift();
        rnd = 60;
        storyIndex = 0;
        isTag = false;
    }
}
```

### Color code and keep their interest
Finally the story is categorized into the different types of links it is creating. Each sentence is added to a different span and given the appropriate class. On a random cycle, a ```highlighted``` id is given to one of the spans, which fades in and out a new set of CSS styles appropriate for that category. 

```javascript
if (spanClass.split('-',1)[0] == 'artistBeginDate' || spanClass.split('-',1)[0] == 'artistEndDate' || spanClass.split('-',1)[0] == 'objectBeginDate') {
    span.addClass('date')
};

if (spanClass.split('-',1)[0] == 'tags' || spanClass.split('-',1)[0] == 'medium') {
    span.addClass('content')
};

if (spanClass.split('-',1)[0] == 'city' || spanClass.split('-',1)[0] == 'excavation' || spanClass.split('-',1)[0] == 'artistNationality') {
    span.addClass('geography')
};

if (frameCount % 270 == 0){
    if (selectedSpan){
        selectedSpan.removeAttribute('id')
    }
    var allSpans = selectAll('span','story');
    selectedSpan = random(allSpans);
    selectedSpan.attribute('id', 'highlighted');
}
```

### Project Iterations
The end project is very close in nature to the original sketch and plan. Careful planning of the process meant that there was no point in which a large rewrite of code happened (apart from a minor change from working with Node & Express to using P5 for visuals). 

The project did however go over many stages of reflection, testing, feedback and refinement. A small selection of dated screenshots and the initial plan can be seen in the [Process Folder](https://github.com/neil-oliver/Major-Studio-1/tree/master/Qualitative-Design/Process).
