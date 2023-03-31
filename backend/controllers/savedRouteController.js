const SavedRoute = require("../models/savedRouteModel")
const mongoose = require('mongoose')

//GET all user's saved routes
const getAllSavedRoutes = async (req, res) => {
    const user_id = req.user._id
    const savedRoutes = await SavedRoute.find({user_id}).sort({createdAt: -1})

    res.status(200).json(savedRoutes)
}

//GET one saved route

const getOneSavedRoute = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: "Route not found"})
    }

    const savedRoute = await savedRoute.findById(id)
    
    if (!savedRoute) {
        return res.status(404).json({error: 'Route not found'})
    }

    res.status(200).json(savedRoute)
}

// Create new saved route

const createSavedRoute = async (req, res) => {
    const {name, overview, route} = req.body

    if (!name) {
        return res.status(400).json({error: "Please name your route"})
    }

    try {
        const user_id = req.user._id
        const savedRoute = await SavedRoute.create({name, overview, route, user_id})
        res.status(200).json(savedRoute)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

//delete a route
const deleteSavedRoute = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: "Route not found"})
    }

    const savedRoute = await SavedRoute.findOneAndDelete({_id: id})

    if (!savedRoute) {
        return res.status(400).json({error: "Route not found"})
    }

    res.status(200).json(savedRoute)
}

module.exports = {
    getAllSavedRoutes,
    getOneSavedRoute,
    createSavedRoute,
    deleteSavedRoute
}