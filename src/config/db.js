const mongoose = require('mongoose');


 async function connectDB(){
    
    await mongoose.connect(process.env.MONGO_URI)
     .then(()=>{
         console.log("server is connected to db")
     })
     .catch(err => {
          console.log('Error connecting to db');
          process.exit(1);
     })
}


module.exports = connectDB;
