import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

export const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('Backend is running')
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }

}