const mongoose = require('mongoose');

async function connectDB() {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not configured');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('server is connected to db');
}

module.exports = connectDB;
