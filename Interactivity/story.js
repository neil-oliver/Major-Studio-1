var first = false;

function makeSense(linkatt, metObjects,start, end){
        
    var connectingString = '';

    for (i in linkatt){
        //console.log(linkatt[i])
        itemOne = linkatt[i][0].split('-')[0]
        itemTwo = linkatt[i][1]

        var list = {}
        list.ID = {}
        list.ID.tags = ' contains '
        list.ID.artistDisplayName = ' was created by '
        list.ID.date = ' was created in '
        list.ID.location = ' was created in ' 
        list.ID.objectBeginDate = ' was created in '


        list.artist = {}
        list.artist.artistDisplayName = ' created ';
        list.artist.artistBeginDate = 'was born in';
        list.artist.artistEndDate = 'died in';
        list.artist.nationality = 'was born in';

        list.date = {}
        list.date.objectBeginDate = ' is the year that ' + metObjects[end.split('-')[1]].title + ' was created. ';
        list.date.artistEndDate = ' is the year that ' + linkatt[i][2].split('-')[1] + ' died. ';
        list.date.artistBeginDate = ' is the year that ' + linkatt[i][2].split('-')[1] + ' was born. ';

        list.description = {}
        list.description.tags = ' features in ';
        list.description.medium = ' features in ';

        // list.location?

        if (i == 0){
            if (itemOne == 'ID'){
                connectingString += metObjects[start.split('-')[1]].title + list.ID[itemTwo] + linkatt[i][2].split('-')[1] + '. '
            } else {
                connectingString += metObjects[start.split('-')[1]].title + list.ID[itemTwo] + linkatt[i][0].split('-')[1] + '. '
            }
        } else  if (i < linkatt.length-1){

            if (itemOne == 'date') {

                connectingString += linkatt[i][0].split('-')[1] + list[itemOne][itemTwo];

            } else if (itemOne == 'description'){
                connectingString += linkatt[i][0].split('-')[1] + ' ' + list[itemOne][itemTwo]  + ' ' + metObjects[linkatt[i][2].split('-')[1]].title + '. ';
            } else {
                connectingString += linkatt[i][0].split('-')[1] + ' ' + list[itemOne][itemTwo]  + ' ' + linkatt[i][2].split('-')[1] + '. ';
            }
        }

        if (i == linkatt.length-1){
            connectingString += linkatt[i][0].split('-')[1] + list[itemOne][itemTwo] + metObjects[end.split('-')[1]].title + '. '
        }
    }

    return connectingString;
}

//ID
    //artistDisplayName
    //objectBeginDate
    //tags
    //city
    //excavation
    //medium

//artist
    //artistBeginDate
    //artistEndDate
    //nationality

