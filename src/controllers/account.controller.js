const accountModel = require("../models/account.model");

async function createAccountController(req,res){
    const user = req.user;
    const account = await accountModel.create({
        user:user._id
    })

    res.status(201).json({
        account
    })
}

async function getAccountsController(req,res){      
    const user = req.user;
    const accounts = await accountModel.find({user:user._id});

    res.status(200).json({
        accounts
    })
}   

async function getAccountBalanceController(req,res){      
    const user = req.user;
    const {accountId} = req.params;
    const account = await accountModel.findOne({user:user._id,_id:accountId});

    if(!account){
        return res.status(404).json({
            message:"Account not found"
        })
    }
 
    const balance = await account.getBalance();

    res.status(200).json({
        accountId:account._id,
        balance
    })
}

module.exports = {
    createAccountController,
    getAccountsController,
    getAccountBalanceController
}