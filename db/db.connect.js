import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config()

export async function initializeDatabase() {
    await connect(process.env.MONGODB)
        .then(() => {
            console.log("Connected to database successfully.");
        })
        .catch((error) => {
            throw error;
        })
}