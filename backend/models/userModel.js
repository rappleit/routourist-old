const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  savedRoutes: {
    routeName:{
        type:String
    },
    overview:{
        type:Array
    },
    request:{
        origin:{
            type:String
        },
        destination:{
            type:String
        },
        waypoints:{
            type: Array
        },
        travelMode:{
            type:String
        },
        optimizedWaypoints:{
            type:Boolean
        }
    }
  }
})

//static signup method
userSchema.statics.signup = async function(email, password) {
    //validation
    if (!email || !password) {
        throw Error("Please fill in all fields")
    }

    if (!validator.isEmail(email)) {
        throw Error("Please use a valid email")
    }

    if (!validator.isLength(password, { min: 8, max: undefined })) {
        throw Error("Password must be at least 8 characters long")
    }
    
    //check is email alrdy exists
    const exists = await this.findOne({email}) 
     if (exists) {
        throw Error("Email is already in use")
     }

     const salt = await bcrypt.genSalt(10)
     const hash = await bcrypt.hash(password, salt)

     const user = await this.create({email, password: hash})

     return user
    }
//static login method
userSchema.statics.login = async function(email, password) {
    if (!email || !password) {
        throw Error("Please fill in all fields")
    }
    const user = await this.findOne({email}) 
    
    if (!user) {
       throw Error("Email is incorrect")
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
        throw Error("Password is incorrect")
    }

    return user
}

module.exports = mongoose.model('User', userSchema)