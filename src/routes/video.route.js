import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import { 
    deleteVideo, 
    getAllVideos, 
    getVideoById, 
    publishVideo, 
    updateThumbnail, 
    updateVideoDetail, 
    updateVideoFile 
} from "../controllers/video.controller.js";

const videoRouter = Router()

videoRouter.use(jwtVerify)

videoRouter.route('/publish').post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }

    ])
    ,publishVideo)

videoRouter.route('/video').get(getAllVideos)
videoRouter.route('/:videoId').get(getVideoById)
videoRouter.route('/:videoId').patch(upload.single("videoFile"),updateVideoFile)
videoRouter.route('/:videoId').patch(upload.single("thumbnail"),updateThumbnail)
videoRouter.route('/:videoid').patch(updateVideoDetail)
videoRouter.route('/:videoId').delete(deleteVideo)


export {videoRouter}


