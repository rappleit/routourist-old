require('dotenv').config({ path: `${__dirname}/../.env` })

const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors');

const userRoutes = require('./routes/user')

//express app
const app = express()

//middleware

app.use(cors());
app.options('*', cors());

app.use(express.json())

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

// routes
app.use('/api/user', userRoutes)

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