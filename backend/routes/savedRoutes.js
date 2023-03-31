const express = require("express")

const {
    getAllSavedRoutes,
    getOneSavedRoute,
    createSavedRoute,
    deleteSavedRoute
} = require('../controllers/savedRouteController')

const requireAuth = require("../middleware/requireAuth")

const router = express.Router()

//require auth
router.use(requireAuth)

//GET all saved routes
router.get('/', getAllSavedRoutes)

//GET one saved route
router.get('/:id', getOneSavedRoute)

//POST new saved route
router.post('/', createSavedRoute)

//DELETE one saved route
router.delete('/:id', deleteSavedRoute)

module.exports = router