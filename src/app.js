import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(cors());
app.use(express.json({limit: "20kb"}));
app.use(express.urlencoded({extended: true, limit: "20kb"}));
app.use(express.static("public"));
app.use(cookieParser());


//Routes imports
import { userRouter } from "./routes/user.route.js";
import { videoRouter } from "./routes/video.route.js";


// route Declaratio
app.use('/api/v1/users',userRouter)
app.use('/api/v1/videos',videoRouter)
app.use('/api/v1/subscriber',subscribeRouter)



//http://localhost:4000/api/v1/users/register


export {app}
