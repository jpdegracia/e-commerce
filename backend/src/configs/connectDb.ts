import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

export const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI ||"mongodb://127.0.0.1:27017/ecommerce";
        const conn = await mongoose.connect(MONGO_URI)
        console.log(`MongoDb Connected: ${conn.connection.host}`)
    } catch (error) {
        if (error instanceof Error)
       console.log("Error connection to MongoDB: ", error.message)
        process.exit(1) // 1 is failure, 0 status code is success
    }
}