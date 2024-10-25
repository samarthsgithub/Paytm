const mongoose = require('mongoose');

const connectDB = async function(){
      try{
        await mongoose.connect("mongodb+srv://samarthdb:samarth123@samarthdb.gp7idaw.mongodb.net/Paytm");
        console.log('mongoose connected successfully');
      }catch(err){
         console.error('mongoose connection error',err);
         process.exit(1);
      }
}

module.exports = connectDB;