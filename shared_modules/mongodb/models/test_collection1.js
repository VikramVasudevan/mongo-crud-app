/* global module */
/* global require */

'use strict';

// get an instance of mongoose and mongoose.Schema
const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
const testCollection1Schema = new Schema({
    name: { type: String },
    age: { type: String },
    dateCreated: { type: Date, default: Date.now },
    dateDeleted: { type: Date },
    dateUpdated: { type: Date },
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deleted: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'dateCreated', updatedAt: 'dateModified' } });

module.exports =
    mongoose.models.testCollection1Schema || mongoose.model('testCollection1', testCollection1Schema);
