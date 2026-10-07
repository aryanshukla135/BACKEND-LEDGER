const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is reqired for creating a user"],
        trim:true,
        lowercase:true,
        match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address"
         ],
        unique:[true,"email already exists"]
        
    },
    name:{
       type:String,
       required:[true,"Name is required for creating an account"]
    },
    password:{
        type:String,
        required:[true,"password is required for creating an account"],
        minlength:[6,"password should contain more than 6 character"],
        select:false
    },
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select:false
    }
},{
    timestamps:true //this will tell that when user data is creatted and updated 
})

// it means that before saving thr iser data this function will be executed
// it id good pratice that store passord in hashed form so that if any hacker get access to our database he will not be able to see the password of user
// for that we will use bcryptjs library to hash the passowrd 


// the role of this pre to convert the passowrd into hash
userSchema.pre('save',async function(next){
     if(!this.isModified("password")){
        return 
     }
     const hash = await bcrypt.hash(this.password,10);
     this.password = hash; 
     return 
})


// this is used to simply check the passowrd coming from the user and the passowrd tthat is save in schema are equal or not 

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}

const userModel = mongoose.model('user',userSchema);

module.exports = userModel;
