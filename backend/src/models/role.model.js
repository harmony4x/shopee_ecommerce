'use strict';

const { mongoose, Schema, model } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Role'
const COLLECTION_NAME = 'Roles'
// Declare the Schema of the Mongo model
var roleSchema = new Schema({
    name: {
        type: String,
        trim: true,
        maxLength: 150,
    },
    
},
    {
        timestaps: true,
        collection: COLLECTION_NAME
    }
);

//Export the model
module.exports = model(DOCUMENT_NAME, roleSchema);