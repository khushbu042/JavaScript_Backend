import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectedDB = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB Connection Sucessfully !!`);
        // console.log(connectedDB);
    } catch (error) {
        console.log("Mongo DB Connection Error: ",error);
        process.exit(1)
    }
}

export default connectDB;