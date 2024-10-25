const express = require('express');
const {JWT_SECRET} = require('../config');
const jwt = require('jsonwebtoken');
const {userMiddleware} = require('../midlleware');
const {User} = require('../models/User');
const {Account} = require('../models/User');

const router = express.Router();


router.post('/signup',async function(req,res){
       const{email,username,password} = req.body;
       try{
         const existingUser = await User.findOne({email});
         console.log(existingUser);
         if(existingUser){
            return res.status(411).json("Incorrect Input or Email already exist");
         }
         const newUser = await User({
            email,
            username,
            password
         })
         
         const userId = newUser._id;
         const jwttoken = jwt.sign({userId},JWT_SECRET,{expiresIn:'1h'});
         const newAccount = await Account({
            userId,
            balance:1 + Math.random()*10000
         })
         
         await newUser.save();
         await newAccount.save();
         res.status(200).json({message:"user created successfully",jwttoken});
       }catch(err){
          console.error(err);
           res.status(500).json({message:"server error while login"});
       }
});

router.post('/signin',async function(req,res){
    const{username,password} = req.body;
    try{
      const user = await User.findOne({
        username:username,
        password:password
      });
      if(!user){
        res.status(400).json({message:"user not found/exist"});
      }
      const token = jwt.sign({
        userId:user._id
      },JWT_SECRET);

      res.json({
        message:"signin successful",
        token:token
      })
      return ;
    }catch(err){
      res.status(500).json({
        message:"Server error"
      })
    }
})

router.put('/',userMiddleware,async function(req,res){
    await User.updateOne({_id:req.userid},req.body);
    res.json({
        message:"User updated successfully"
    })
});

router.get('/bulk',userMiddleware,async function(req,res){
    
    const filter = req.query.filter||"";

    const allUsers = User.find({
        username:{"$regex":filter}
    })
    res.json({
        user: allUsers.map(user=>({
            username:user.username,
            _id:user._id
        }))
    })

})


module.exports = router;