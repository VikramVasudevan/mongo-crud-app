module.exports = {
    "fir" : {
        "name" : "FIR Administration",
        "desc" : "Manage FIR attributes",
        "model" : "crimes",
        "attributes" : [
            {
                "name" : "firNum",
                "displayName" : "FIR Number",
                "fieldName" : "firDetail.firNum",
                "editable" : false,
                "component" : "text",
                "filter" : true
            },
            {
                "name" : "psCode",
                "displayName" : "PS Code",
                "fieldName" : "firDetail.psCode",
                "editable" : false,
                "component" : "text",
                "filter" : true
            },
            {
                "name" : "firRegDate",
                "displayName" : "FIR Registration Date",
                "fieldName" : "firDetail.occurenceOfOffence.firDate",
                "editable" : true,
                "component" : "date"
            },
            {
                "name" : "firFacts",
                "displayName" : "FIR Contents",
                "fieldName" : "firDetail.briefFacts.factsOfComplainant",
                "editable" : true,
                "component" : "textarea"
            },
            {
                "name" : "actsAndSections",
                "displayName" : "FIR Acts & Sections",
                "fieldName" : "firDetail.actsAndSections",
                "editable" : true,
                "component" : "table"
            }
        ]
    },
    "crimeScene" : {
        "name" : "Crime Scene Administration",
        "desc" : "Manage Crime Scene attributes",
        "model" : "crime_scene",
        "attributes" : [
            {
                "name" : "CrimeSceneID",
                "displayName" : "Crime Scene ID",
                "fieldName" : "_id",
                "editable" : false,
                "component" : "text",
                "filter" : true
            },
        ]
    }
};