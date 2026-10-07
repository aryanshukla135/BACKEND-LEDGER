const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");    
const emailServices = require("../services/email.service");
const mongoose = require("mongoose");


/**
 * * -Create a new transaction
 * the 10 step transaction flow:
 * 1. Validate the request 
 * 2. validate idempotency key
 * 3. check account status
 * 4. derive sender balance from ledger
 * 5. create transaction (pending)
 * 6. create ledger entry for sender (debit)
 * 7. create ledger entry for receiver (credit)
 * 8. update transaction status to completed
 * 9. commit MongoDB session
 * 10.send email notification
 */

async function createTransaction(req,res){

    const {fromAccount,toAccount,amount,idempotencyKey} = req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
       return res.status(400).json({  
            message:"Missing required fields"
        });
    }
    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount
    }).populate("user");

    const fromToUserAccount = await accountModel.findOne({
        _id: toAccount
    }).populate("user");

    if(!fromUserAccount || !fromToUserAccount){
        return res.status(400).json({
            message:"Account not found"
        })
    }

    // validate idempotency key
    const isaTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey:idempotencyKey
    })
    if(isaTransactionAlreadyExists){
       if(isaTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message:"Transaction already completed",
                transaction:isaTransactionAlreadyExists
            })
       }
       if(isaTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message:"Transaction is already pending",
                transaction:isaTransactionAlreadyExists
            })
       }
       if(isaTransactionAlreadyExists.status === "FAILED"){
            return res.status(500).json({
                message:"Transaction has already failed",
                transaction:isaTransactionAlreadyExists
            })
       } 
       if(isaTransactionAlreadyExists.status === "REVERSED"){
            return res.status(500).json({
                message:"Transaction has already been reversed",
                transaction:isaTransactionAlreadyExists
            })
       }   
    }

    // check account status  

    if(fromUserAccount.status !== "ACTIVE" || fromToUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message:"One or both accounts are not active"
        })
    }

    // derive sender balance from ledger
    // aggregation pipeline to get the balance of the fromAccount
    const balance = await fromUserAccount.getBalance();
    if(balance < amount){
        return res.status(400).json({
            message:`Insufficient balance, curent balance is ${balance}.requested amount is ${amount}`
        })
    }

    // create transaction (pending)
    let transation;
    try{

    const session = await mongoose.startSession();
    session.startTransaction();

    transation = await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    }],{ session })[0]
   
    const debitLedgerEntry = await ledgerModel.create([{
        account:fromAccount,
        type:"DEBIT",
        amount:amount,
        transaction:transation._id
    }], { session }) 

    await (() =>{
        return new Promise((resolve)=> setTimeout(resolve, 1000 * 100));
    })()

    const creditLedgerEntry = await ledgerModel.create([{
        account:toAccount,
        type:"CREDIT",
        amount:amount,
        transaction:transation._id
    }], { session })

    await transactionModel.findOneAndUpdate({_id:transation._id},{status:"COMPLETED"},{session})    
    
    await session.commitTransaction();
    await session.endSession();
    }catch(err){  
        res.status(400).json({
            message:"Transaction is pending but failed to complete",
            error:err.message
        })
    }

    // send email notification
     await emailServices.sendTransactionEmail(
        fromToUserAccount.user.email,
        fromToUserAccount.user.name,
        amount,
        toAccount,
        fromAccount
     );

    res.status(201).json({
        message:"Transaction completed successfully",
        transaction:transation
    })
}  

async function createInitialFundsTransaction(req,res){
      const {toAccount,amount,idempotencyKey} = req.body;

      if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"Missing required fields"
        })
      }
      const toUserAccount = await accountModel.findOne({
        _id: toAccount
      })
      if(!toUserAccount){   
        return res.status(404).json({
            message:"Account not found"
        })
      }
      const fromUserAccount = await accountModel.findOne({
        user:req.user._id
        })

        if(!fromUserAccount){
            return res.status(404).json({
                message:"System account not found"
            })
        }

        const session = await mongoose.startSession();
        session.startTransaction(); 

        const transaction = new transactionModel({
            fromAccount:fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status:"PENDING"
        })

        if (!fromUserAccount._id.equals(toUserAccount._id)) {
            await ledgerModel.create([{
                account:fromUserAccount._id,
                type:"DEBIT",
                amount:amount,
                transaction:transaction._id
            }], { session })
        }

        const creditLedgerEntry = await ledgerModel.create([{
            account:toUserAccount._id,
            type:"CREDIT",
            amount:amount,
            transaction:transaction._id
        }], { session })

        transaction.status = "COMPLETED";
        await transaction.save({ session });    

        await session.commitTransaction();
        await session.endSession();

        res.status(201).json({
            message:"Initial funds transaction completed successfully",
            transaction:transaction
        })  

}

 module.exports = {
    createTransaction,
    createInitialFundsTransaction
    
}          