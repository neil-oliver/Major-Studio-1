var first = false;

async function makeSense(from,to){
        
    var connectingString;

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
        
    return connectingString;
}
