var fs = require('fs');
var async = require('async');
    
function makesTimelineStory(){
    // variable for the adjacency list. It will contain a list of key:value pairs for example where each value would be an actual name, place or date (ie it would not say city it would say 'New York')
    // ObjectID : [artistBeginDate, city]
    // city : [objectID]
    // artistbeginDate : [objectID]
    var objects = {};
    // read all of the files before any processing begins.
    console.log('starting to create objects');
    // downloaded and saved MET information from the API
    fs.readFile('metObjects.json', (error, objects) => {
        if (error) console.log(error);
        objects = JSON.parse(objects);
        fs.readFile('AJList.json', (error, data) => {
            if (error) console.log(error);
            data = JSON.parse(data);
            var originalData = data
            // AJ master list

            var lists = {}
            var start;
            var current;
            var list;
            var item;
            async.forEachOf(data, function(value,i, callback) {
                data = originalData
                start = i
                // Check if the key is an objectID
                if (start.split('-')[0] == 'ID') {
                    // create an empty list
                    list = []
                    // continually loop through each linked item until empty
                    while (data[i].length){
                        // pop the last item
                        item = data[i].pop()

                        // if (list.length > 1){
                        //     if (item[0] == list[list.length-2]){
                        //         console.log('no circluar references please!')
                        //         item  = data[i].pop()
                        //     }
                        // } else if (list.length == 1 && data[i].length > 0) {
                        //     if (item[0] == start){
                        //         console.log('no early circluar references please!')
                        //         item  = data[i].pop()
                        //     }
                        // } else {
                        //     console.log('breaking bad')
                        //     break
                        // }

                        current = item;
                        
                        // push to the current visited list
                        list.push(current)

                        // set the current variable to the key of the popped item
                        i = current[0]
                        // check to see if the new key is an objectID
                        if (i.split('-')[0] == 'ID'){
                            // check to see if the date of the new item is more than the original object
                            if (objects[i.split('-')[1]].objectBeginDate > objects[start.split('-')[1]].objectBeginDate){
                                // add the AJList to the master list
                                if (!lists[start]) {
                                    lists[start] = [list]
                                } else {
                                    lists[start].push(list)
                                }
                            } 
                            list.pop()
                            i = list[list.length-1][0]
                        }
                    }
                }
                setTimeout(callback, 0);
            }, function() {
                // write the adjacency list ot a file
                for (x in lists){
                    console.log(x, lists[x])
                }
                //fs.writeFileSync('timelineAJList.json', JSON.stringify(lists));
                console.log('saved list!');
            });
        });
    });
}

//////////////////////////////////////////////////////////
makesTimelineStory();