const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema({
    token:{
        type:String,
        required:[true,"Token is required"],    
    },  
    blacklistedAt:{
        type:Date,
        default:Date.now,
        immutable:true
    }  
},{
    timestamps:true
})


tokenBlacklistSchema.index({blacklistedAt:1},{expireAfterSeconds:3600}); // this will automatically delete the blacklisted token after 1 hour
const tokenBlacklistModel = mongoose.model("tokenBlacklist",tokenBlacklistSchema);
module.exports = tokenBlacklistModel;