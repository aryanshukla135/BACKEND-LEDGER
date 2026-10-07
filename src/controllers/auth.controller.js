const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service')
const tokenBlacklistModel = require('../models/blackList.model')
async function userRegisterController(req,res){
      const {email,password,name} = req.body;
      const normalizedEmail = email.trim().toLowerCase();

      const isExists = await userModel.findOne({
        email:normalizedEmail
      })

      if(isExists){
        return res.status(422).json({
            message:"USer already exists with email",
            status:"failed"
        })
      }

      const user = await userModel.create({
        email:normalizedEmail,password,name
      })

      const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})
      res.cookie("token",token);

      await emailService.sendRegistrationEmail(user.email, user.name)

      res.status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
      })
      
}

async function userLoginController(req,res){
      const {email,password} = req.body
      const normalizedEmail = email.trim().toLowerCase();

      const user = await userModel.findOne({
         email:normalizedEmail
      }).select("+password")
      if(!user){
        return res.status(401).json({
            maessage:"Email or password is invalid"
        })
      }
      const isValidPassword = await user.comparePassword(password)
      if(!isValidPassword){
         return res.status(401).json({
            maessage:"Email or password is invalid"
        })
      }
      const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})
      res.cookie("token",token);

      res.status(200).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
      })
}

async function userLogoutController(req,res){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1] || req.headers["x-access-token"] || req.headers.token;
    if(!token){
        return res.status(400).json({
            message:"No token found"
        })
    }
    await tokenBlacklistModel.create({
        token
    })
    res.clearCookie("token");
    res.status(200).json({
        message:"User logged out successfully"
    })
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
} 