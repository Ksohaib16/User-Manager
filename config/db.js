const mongoose = require('mongoose');
const { Schema } = mongoose;

const url = process.env.MONGO_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(url);
        console.log('connected to DB');
    } catch (error) {
        console.log('Error connecting to DB');
        console.log(error);
    }
};

module.exports = connectDB;
