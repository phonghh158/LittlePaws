const mongoose = require("mongoose");

const connectDB = async (isTest = false) => {
    let mongoURI;

    if (isTest) mongoURI = process.env.MONGO_URI_TEST;
    else mongoURI = process.env.MONGO_URI;

    try {
        const conn = await mongoose.connect(mongoURI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`❌ Error connecting to MongoDB: ${err.message}`);

        process.exit(1);
    }
};

module.exports = connectDB;
