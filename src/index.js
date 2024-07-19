import dotenv from 'dotenv'; 
import connectDB from './db/db.js';
import express from "express";


dotenv.config();
const app = express();

connectDB()
.then( () => {
    app.listen(process.env.PORT || 8000, () => { 
        console.log("server running on port", process.env.PORT);
    })
})
.catch( (error) => {
    console.log("MongoDB connetion failed",error);
} )








/* import mongoose from "mongoose";
import { DB_NAME } from "./constants";

import express from "express";
const app = express()

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => { 
            console.log("Err:", error)
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("Error:" , error);
        throw error
    }
})()
*/
