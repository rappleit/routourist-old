const express = require('express')
const mongoose = require('mongoose')

const Schema = mongoose.Schema 

const savedRouteSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    overview: {
        type: String,
        required: true
    },
    route: {
        type: Object,
        required: true
    },
    user_id: {
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('SavedRoute', savedRouteSchema)
