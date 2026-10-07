const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const tokenBlacklistModel = require("../models/blackList.model");




async function authMiddleware(req,res,next){
     const authorization = req.headers.authorization;
     const token = req.cookies.token
        || (authorization?.startsWith("Bearer ") ? authorization.slice(7) : authorization)
        || req.headers["x-access-token"]
        || req.headers.token;

     if(!token){
        return res.status(401).json({
            message:"Unauthorized access . token is missing"
        })
     }
     const isTokenBlacklisted = await tokenBlacklistModel.findOne({token:token});
     if(isTokenBlacklisted){
        return res.status(401).json({
            message:"Unauthorized access . token is blacklisted"
        })
     }
     try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId);

        req.user = user;
        return  next();
         
     }catch(err){
        return res.status(401).json({
            message:"Unauthorized access . token is invalid"
        })
     }
}

async function authSystemUserMiddleware(req,res,next){
    const authorization = req.headers.authorization;
    const token = req.cookies.token
       || (authorization?.startsWith("Bearer ") ? authorization.slice(7) : authorization)
       || req.headers["x-access-token"]
       || req.headers.token;
    
    if(!token){
       return res.status(401).json({
           message:"Unauthorized access . token is missing"
       })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({token:token});
    if(isTokenBlacklisted){
       return res.status(401).json({    
        message:"Unauthorized access . token is blacklisted"
       })
    }
    
    try{
       const decoded = jwt.verify(token,process.env.JWT_SECRET);    
       const user = await userModel.findById(decoded.userId).select("+systemUser");
       if(!user.systemUser){
        return res.status(403).json({
            message:"Forbidden access . user is not a system user"
        })
       }
       req.user = user;
         return  next();
    }catch(err){
       return res.status(401).json({
           message:"Unauthorized access . token is invalid"
       })
    }

}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}
