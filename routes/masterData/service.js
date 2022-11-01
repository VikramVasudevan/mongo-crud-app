const db = require('./DB');
const fs = require('fs');
const { parse } = require('json2csv');
const csv = require('fast-csv');
const _ = require('lodash');

const getMasterDataEntityList = async () => {
    return ['m_accident',
        'm_act',
        'm_address_proof_details',
        'm_apprehension_type',
        'm_beard',
        'm_belongs_to_whom',
        'm_body_type',
        'm_case_type',
        'm_caseproperty_courtdirection',
        'm_caste',
        'm_category',
        'm_complexion',
        'm_contested',
        'm_court_orders',
        'm_courts',
        'm_crime_classes',
        'm_crime_classification',
        'm_crime_scene_light_condition',
        'm_crime_sub_classification',
        'm_deformities',
        'm_direction_from_PS',
        'm_disposal_of_body',
        'm_district',
        'm_district_mandal',
        'm_district_village',
        'm_dynamic_form',
        'm_educational_qualification',
        'm_efforts_of_tracing',
        'm_evidence_collection',
        'm_exhumation_reasons',
        'm_expert_teams',
        'm_eye_color',
        'm_file_type',
        'm_fir_registration',
        'm_gender',
        'm_hair_color',
        'm_high_court_directions',
        'm_hospitals',
        'm_id_proof_details',
        'm_inquest_held_by',
        'm_jails',
        'm_jjb_orders',
        'm_language',
        'm_major_head',
        'm_mandal_pincode',
        'm_material_object_subtype',
        'm_material_object_type',
        'm_minor_head',
        'm_mode_of_intimation',
        'm_moles',
        'm_mustaches',
        'm_name_of_the_expert',
        'm_nationality',
        'm_nature_of_death',
        'm_occupation',
        'm_person_types',
        'm_person_types_1',
        'm_personstypes',
        'm_pis_detail',
        'm_place_of_inquest',
        'm_place_of_recordings',
        'm_police_custody_reasons',
        'm_police_units',
        'm_ps',
        'm_ps_hrms_cctn',
        'm_ps_village',
        'm_rank',
        'm_relation_type',
        'm_relation_type_1',
        'm_religions',
        'm_report_templates',
        'm_residency_type',
        'm_role_assignments',
        'm_roles',
        'm_roles_old',
        'm_rural_village',
        'm_section',
        'm_seizure_at',
        'm_seizure_from',
        'm_sho_detail',
        'm_stageOfCase',
        'm_state',
        'm_state_district',
        'm_statement_recorded_by',
        'm_stolen_properties',
        'm_sub_caste',
        'm_teeth',
        'm_ts_hierarchy',
        'm_unit_data',
        'm_unit_mapping',
        'm_unit_mapping.',
        'm_unit_state_district',
        'm_unit_types',
        'm_used_act_from_state_master',
        'm_village',
        'm_village_total',
        'm_witness_category',
        'm_witness_strength',
        'm_witness_type'];
}

const processFile = async (fileName, masterDataEntityName) => {

}

const getData = async (masterDataEntityName, filter) => {
    return db.getData(masterDataEntityName, filter);
}

const patchData = async (masterDataEntityName, _id, value) => {
    return db.patchData(masterDataEntityName, _id, value);
}

const postData = async (masterDataEntityName, value) => {
    return db.postData(masterDataEntityName, value);
}

const deleteData = async (masterDataEntityName, _id) => {
    return db.deleteData(masterDataEntityName, _id);
}

const getFilterFromReq = (req) => {
    let filter = {};
    console.log("req.query", req.query);
    if (req.query) {
        Object.keys(req.query).forEach(queryParam => {
            if (req.query[queryParam]) {
                if (queryParam != "_id") {
                    filter[queryParam] = new RegExp(req.query[queryParam], "gi");
                }
                else {
                    filter[queryParam] = new mongoose.mongo.ObjectId(req.query[queryParam]);
                }
            }
        })
    }
    return filter;
};


const downloadTemplate = async (masterDataEntityName, columns, req, res) => {
    try {
        res.setHeader("content-type", "text/csv");
        res.setHeader("content-disposition", `${masterDataEntityName}.csv`);
        const results = db.getDataAsCursor(masterDataEntityName, getFilterFromReq(req), true);
        let firstRow = true;
        for await (const doc of results) {
            if (!columns) columns = Object.keys(doc);
            const csv = parse(doc, { fields: columns, header: firstRow });
            res.write(csv);
            res.write("\n");
            firstRow = false;
        }
        res.end();
    } catch (e) {
        res.status(500).json({ status: 500, error: true, message: JSON.stringify(error) });
    }
}

const loadCSVToDB = async (fileToBeLoaded, collectionName) => {
    const model = db.getModel(collectionName);

    //Take backup
    const backupCollectionName = collectionName + "_" + new Date().getTime();
    await model.aggregate([{ $out: backupCollectionName }]);

    return await new Promise((resolve, reject) => {

        let buffer = [],
            counter = 0;

        let stream = fs.createReadStream(fileToBeLoaded)
            .pipe(csv.parse({ headers: true }))
            .on("data", doc => {
                stream.pause();
                try {
                    console.log("Processing doc ", buffer.length);
                    if (buffer.length > 10) {
                        const loadBuffer = JSON.parse(JSON.stringify(buffer));
                        console.log("Resetting buffer");
                        buffer = [];
                        console.log("Updating ...", loadBuffer.length, 'records');
                        bulkWrite(model, buffer);
                    }
                    buffer.push(doc);
                } catch (e) {
                    console.error("Error loading data", e);
                    stream.destroy();
                }
                stream.resume();
            })
            .on("error", reject)
            .on('end', async () => {
                try {
                    if (buffer.length > 0) {
                        console.log("Updating ...", buffer.length, 'records');
                        bulkWrite(model, buffer);
                        buffer = [];
                    }
                    resolve();
                } catch (e) {
                    console.error("Error loading final data set", e);
                    stream.destroy(e);
                    reject(e);
                } finally {
                    console.log("Finally ...");
                }
            });
    });
};

const bulkWrite = (model, buffer) => {
    model.bulkWrite(buffer.map(rec => {
        if (_.isEmpty(rec._id))
            delete rec._id;

        return (rec._id ? {
            updateOne: {
                filter: { _id: rec._id },
                update: { $set: rec },
                upsert: true,
            }
        } : {
            insertOne: {
                "document": rec
            }
        });
    }))
}

module.exports = {
    getMasterDataEntityList, processFile, getData, patchData, postData, deleteData, downloadTemplate, loadCSVToDB, getFilterFromReq
}