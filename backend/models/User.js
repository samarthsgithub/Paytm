const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    username:{
      type:String,
      required:true
    },
    password:{
        type:String,
        required:true
    }
})

const accountSchema = new mongoose.Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    balance:{
        type:Number,
        required:true
    }
})
const Account = mongoose.model('Account',accountSchema);
const User =  mongoose.model('User',UserSchema);
module.exports = {
    User,
    Account
}