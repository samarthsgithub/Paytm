const express = require('express');
const mongoose = require('mongoose');
const {userMiddleware}= require('../midlleware');
const {Account} = require('../models/User');

const router = express.Router();

router.get('/balance',userMiddleware,async function(req,res){
    console.log(req.userId);
    console.log(req.user.id);
       const accountbalance = await Account.findOne({userId:req.user.userId});
       if(!accountbalance){
        return res.status(404).json({message:"account not found"});
       }
       return res.json({
        balance:accountbalance.balance
       })
});

router.post('/transfer',userMiddleware,async function(req,res){
  
    const session = await mongoose.startSession();
    session.startTransaction();
    const{amount,to} = req.body;

    const account = await Account.findOne({userId:req.user.userId}).session(session);
    if(!account || account.balance<amount){
        await session.abortTransaction();
        return res.status(400).json({
            message:"insufficient balance"
        });
    }
    const toAccount  = await Account.findOne({userId:to}).session(session);
    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({
            message:"Invalid credentials"
        });
    }
    await Account.updateOne({userId:req.user.userId},{$inc:{balance:-amount}}).session(session);
    await Account.updateOne({userId:to},{$inc:{balance:amount}}).session(session);

    await session.commitTransaction();
    res.json({
        message:"Transfer Successful"
    })
})





module.exports = router;
