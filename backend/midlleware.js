const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('./config');

function userMiddleware(req,res,next){
    const authHeader = req.headers['authorization'];
    if(!authHeader){
        return res.status(401).json({message:"Authorization token required"});
    }
    const token = authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({message:"Auth token required"});
    }
    try{
    const decoded = jwt.verify(token,JWT_SECRET);
    req.user = decoded;
    // console.log(req.user);
    next();
    }catch(err){
    console.error(err);
    return res.status(401).json({message:"Invalid or expired token"});
    }
}

module.exports={userMiddleware};
