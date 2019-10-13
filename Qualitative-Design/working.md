# Original Plan

artistNationality
objectID - assume will be converted to title
artistDisplayName
artistBeginDate
artistEndDate
objectBeginDate
title
creditLine
tags

# Updated

objectID - assume will be converted to title
artistDisplayName
artistBeginDate
artistEndDate
objectBeginDate
tags (below 1000 occurances)
Nationality (converet to birthplace)
## adding
Excavation
City (need to add the country in the story)
Medium (must be in a different department)? Or have exclusion list 

## Logic (Basic)
add key to html body
remove link from previous item in adjacency list (both ways)
generate new key

## Logic Advanced
get data either from MET api or METData.json
create text linking previous key and current key
output text
remove keys
get new key 

## exclusions
'group' in artist name
'fragment' in title
9999 date (died in)
blank names

## things to work on 10-10-19
square brackets [] around title
cant just pick the link with the most links - creates the same story each time 
turn negative into B.C.


