module.exports = {
    firRegistryReport : {
        displayName: "FIR Registry Lookup",
        desc: "FIR Registry Lookup",
        columns : [
            "recentFirNo",
            "psCode",
        ],
        collection : "firregistries",
        pipeline : [{
            $match : {}
        }]
    },
    pocsoDetailsReport: {
        displayName: "POCSO Details Report",
        desc: "POCSO Details Report",
        columns: [
            "crime_id",
            "District",
            "PS Name",
            "FIR NO",
            "ACTS & SEC",
            "FIR DT",
            "DT OF ALTERED",
            "NO.OF DAYS",
            "IO NAME",
            "CHARGE SHEET",
            "TAKEN ON FILE DT",
            "ACCUSED_ID",
            "ACCUSED_GENDER",
            "VICTIM_ID",
            "VICTIM_GENDER",
        ],
        collection : "crimes",
        pipeline: [{
            $match: {
                isDraft: false,
                "firDetail.actsAndSections.actDescription": /Protection of children/ig

            }
        }, {
            $lookup: {
                from: 'crimescenes',
                localField: '_id',
                foreignField: 'crime_id',
                as: 'crimescenes'
            }
        },
        { $unwind: "$crimescenes" },
        { $unwind: "$crimescenes.victimDetails" },
        {
            $lookup: {
                from: 'persons',
                localField: "crimescenes.victimDetails.person",
                foreignField: '_id',
                as: 'victimPersonInfo'
            }
        },
        { $unwind: "$victimPersonInfo" },
        { $unwind: "$crimescenes.accusedDetails" },
        {
            $lookup: {
                from: 'persons',
                localField: "crimescenes.accusedDetails.person",
                foreignField: '_id',
                as: 'accusedPersonInfo'
            }
        },
        { $unwind: "$accusedPersonInfo" },        
        {
            $match: {
                "victimPersonInfo.personalDetails.age": {
                    $lt: 18
                }
            }
        },
        {
            $project: {
                crime_id: "$_id",
                District: "$firDetail.district",
                "PS Name": "$firDetail.psName",
                "FIR NO": "$firDetail.firNum",
                "ACTS & SEC": "$firDetail.actsAndSections",
                "FIR DT": "$firDetail.occurenceOfOffence.firDate",
                "DT OF ALTERED": "",
                "NO.OF DAYS": "",
                "IO NAME": "$firDetail.briefFacts.ioAssignedName",
                "CHARGE SHEET": "",
                "TAKEN ON FILE DT": "",
                "ACCUSED_ID": "$accusedPersonInfo._id",
                "ACCUSED_GENDER": "$accusedPersonInfo.personalDetails.gender",
                "VICTIM_ID": "$victimPersonInfo._id",
                "VICTIM_GENDER": "$victimPersonInfo.personalDetails.gender",
            }
        }]
    }
}