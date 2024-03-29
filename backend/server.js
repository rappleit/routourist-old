require('dotenv').config()

const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors');

const userRoutes = require('./routes/user')
const savedRouteRoutes = require('./routes/savedRoutes')

//express app
const app = express()

//middleware

app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

// routes
app.use('/api/user', userRoutes)
app.use('/api/savedRoutes', savedRouteRoutes)

console.log(process.env.MONGO_URI)
// connect to db
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log('connected to db & listening on port', process.env.PORT)
    })
  })
  .catch((error) => {
    console.log(error)
  })