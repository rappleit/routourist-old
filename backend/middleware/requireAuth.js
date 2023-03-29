const jwt = require('jsonwebtoken')

const requireAuth = (req, res, next) => {

    //verify authentication
    const {authorisation} = req.headers

    if(!authorisation) {
        return res.status(401).json({error: "Authorisation token required"})
    }

    const token = authorisation.split(' ')[1]

    try {
        const {_id} = jwt.verify(token, process.env.SECRET)
    } catch (error) {
        console.log(error)
        res.status(401).json({erorr: "Request is not authorised"})
    }
}