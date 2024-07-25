import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const userRouter = Router()

userRouter.route('/register').post(
    upload.fields([
    {
        name: "avatar",
        maxCount : 1
    },
    {
        name: "coverImage",
        maxCount : 1
    }]),
    registerUser)

userRouter.route('/login').post(loginUser)

export {userRouter}