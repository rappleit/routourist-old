require('dotenv').config()
const express = require('express')

//express app
const app = express()

//middleware
app.use((req, res, next) => {
    //response
    next()
})

// routes
app.get('/', (req, res) => {
    //response
})


//listen for requests
app.listen(process.env.PORT, () => {
    console.log("listening on port", process.env.PORT)
})
