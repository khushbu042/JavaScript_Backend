import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    getUserChannelProfile,
    updateUserCoverImage,
    getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { jwtVerify } from "../middlewares/auth.middleware.js";

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

userRouter.route('/logout').post(jwtVerify, logoutUser)
userRouter.route('/refresh-token').post(refreshAccessToken)
userRouter.route('/change-password').post(jwtVerify,changeCurrentPassword)
userRouter.route('/current-user').get(jwtVerify, getCurrentUser)
userRouter.route('/avatar').patch(jwtVerify, upload.single("avatar"), updateUserAvatar)
userRouter.route('/cover-image').patch(jwtVerify, upload.single("coverImage"),  updateUserCoverImage)
userRouter.route('/c/:username').get(jwtVerify,getUserChannelProfile)
userRouter.route('/history').get(jwtVerify,getWatchHistory)


export {userRouter}