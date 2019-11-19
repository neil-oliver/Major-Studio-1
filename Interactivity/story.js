var first = false;

function makeSense(linkatt, metObjects,start, end){
        
    var connectingString = '';

    for (i in linkatt){
        console.log(linkatt[i])
        
        var from = linkatt[i][0].split('-')[1]
        var to = linkatt[i][2].split('-')[1]
        var how = linkatt[i][1]
        var fromType = linkatt[i][0].split('-')[0]
        var toType = linkatt[i][2].split('-')[0]

        if (fromType == 'ID'){
            from = makehyperlink(from)
        }

        if (toType == 'ID'){
            to = metObjects[to].title
        }
        
        if(from == ''){
            from = linkatt[i][0].split('-')[2] + 'BC'
        }
        if(to == ''){
            to = linkatt[i][2].split('-')[2] + 'BC'
        }

        var list = {}
        list.ID = {}
        list.ID.tags = ' contains '
        list.ID.medium = ' was created using '
        list.ID.excavation = ' was excvated in '
        list.ID.city = ' was made in '
        list.ID.country = ' was made in '
        list.ID.artistDisplayName = ' was created by '
        list.ID.artist = ' was created by '
        list.ID.date = ' was created in '
        list.ID.location = ' was created in ' 
        list.ID.objectBeginDate = ' was created in '


        list.artist = {}
        list.artist.artistDisplayName = ' created ';
        list.artist.artistBeginDate = ' was born in ';
        list.artist.artistEndDate = ' died in ';
        list.artist.nationality = ' was born in ';

        list.date = {}
        list.date.objectBeginDate = ' is the year that ' + to + ' was created. ';
        list.date.artistEndDate = ' is the year that ' + to + ' died. ';
        list.date.artistBeginDate = ' is the year that ' + to + ' was born. ';

        list.description = {}
        list.description.tags = ' features in ';
        list.description.medium = ' features in ';

        list.location = {}
        list.location.city = ' created in ';
        list.location.country = ' created in ';
        list.location.excavation = ' excavated in ';


        if (fromType == 'date'){
            connectingString += from + list[fromType][how];

        } else {
            connectingString += from + list[fromType][how] + to + ". ";
        }

    }

    return connectingString;

    function makehyperlink(id){
       var hyperlink = '<b><a href="https://www.metmuseum.org/art/collection/search/' + id + '" target="_blank">' + metObjects[id].title + '</a></b>'
       return hyperlink
    }
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

