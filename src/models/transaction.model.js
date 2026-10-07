const mongoose = require("mongoose");


const transactionSchema = new mongoose.Schema({

    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Transaction must be associated with a fromAccount"],
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Transaction must be associated with a toAccount"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["PENDING","COMPLETED","FAILED","REVERSED"],
            message:'Status can be either PENDING, COMPLETED, FAILED or REVERSED'
        },
        default:"PENDING"
    },
    amount:{
        type:Number,
        required:[true,"Transaction amount is required"],
        min:[0.01,"Transaction amount must be greater than 0"]
    },
    idempotencyKey:{
        type:String,
        required:[true,"Idempotency key is required"],      
        index:true,
        unique:true
    }

},{
    timestamps:true
})

const transactionModel = mongoose.model("transaction",transactionSchema);

module.exports = transactionModel;