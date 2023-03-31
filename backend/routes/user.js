const express = require('express') 


//controller functions
const {signupUser, loginUser,saveRoute} = require('../controllers/userController')

const router = express.Router()

//login route
router.post('/login', loginUser)

//signup route
router.post('/signup', signupUser)

//saveroute route
router.post('/saveroute', saveRoute)



module.exports = router