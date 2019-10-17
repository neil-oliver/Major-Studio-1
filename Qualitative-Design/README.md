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

Once you have done all of that and let it process for a *very* long time, you end up with [this](https://github.com/neil-oliver/Major-Studio-1/blob/master/Qualitative-Design/Node/AJList.json), a file so big that GitHub can't display it! To give you an idea, here is a **tiny** section of the adjacency matrix visualized using [Gephi](https://gephi.org).
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

### Speaking English
We now have a start and end point, usually an artwork and a place, time or tag. We need to create a sentence for our story. Many things have generic names so hyperlinks were also added in to allow the user to visit the correct page of the MET website.

### An Endless loop
Adding similar links in the story isnt ideal, but its not the end a totally rubbish story. Repeating the same sentence isnt negotiable, it would be better to stop talking. Therefore each time a sentence is produced, the link is removed from the adjacency list. 

### Type it out
Animations can be fun, grab the users interest and give the website time to process. P5 was used in a very limited way. A 1px canvas was drawn in the corner to allow access to P5 simplified library of commands for interacting with the DOM and to allow the use of the draw loop for a typing animation. No information is drawn in the canvas and all visuals and styling are done within HTML and CSS.

A custom typing animation was created that reads from a queue of information and can output html tags while typing one letter at a time. This was **A lot harder than it sounds!**.

### Color code and keep their interest
Finally the story is categorized into the different types of links it is creating. Each sentence is added to a different span and given the appropriate class. On a random cycle, a ```highlighted``` id is given to one of the spans, which fades in and out a new set of CSS styles appropriate for that category. 
