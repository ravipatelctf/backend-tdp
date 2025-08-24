const mongoose = require("mongoose");
require("dotenv").config();
const mongoUri = process.env.MONGODB;

async function initializeDatabase() {
    await mongoose
        .connect(mongoUri)
        .then(() => {
            console.log("Connect to database successfully.");
        })
        .catch((error) => {
            throw error;
        })
}

module.exports = {initializeDatabase};