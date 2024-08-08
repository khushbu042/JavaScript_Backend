import { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadONCloudinary } from "../utils/cloudinary.js"

const publishVideo = (async (req,res) => {
    
    const {title, description  } = req.body

    if(!(title && description )){
        throw new ApiError(400,"title and description  are required")
    }

    const videoFilePath = req.files?.videoFile[0]?.path
    const thumbnailPath = req.files?.thumbnail[0]?.path

    if(!(videoFilePath && thumbnailPath)){
        throw new ApiError(400,"videoFile and thumbnail  are required")
    }

    const videoFile = await uploadONCloudinary(videoFilePath)
    const thumbnail = await uploadONCloudinary(thumbnailPath)

    if(!(videoFile && thumbnail)){
        throw new ApiError(400,"videoFile and thumbnail  are required")
    }

    const uploadVideo = await Video.create({
        title: title,
        description: description,
        videoFile : videoFile.url,
        thumbnail : thumbnail.url,
        duration : videoFile.duration,
        owner : req.user?._id
    })

    if(!uploadVideo){
        throw new ApiError(400,"upload video failed !!")
    }



    return res.status(200).json(
        new ApiResponse(200,{uploadVideo},"video uploaded sucessfully")
    )

})

const getAllVideos = ( async (req,res) => {

    const { page = 1, limit = 10, query, sortBy="createdAt", sortType="asc", userId } = req.query

    //TODO: get all videos based on query, sort, pagination

    // Ensure the page and limit are integers
     const pageNumber = parseInt(page,10)
     const pageSize = parseInt(limit,10)
     const sortDirection = sortBy === "asc" ? 1 : -1

    try {
        // Fetch the videos with pagination, filtering, and sorting
         const allVideos = await  Video.find({owner : req.user?._id})
         .sort({[sortBy] : sortDirection})
         .skip((pageNumber -1) * pageSize)
         .limit(pageSize)
    
        // Get the total count of videos that match the filter
        const totalVideo = await Video.countDocuments({owner : req.user?._id})

        return res.status(200).json(
            new ApiResponse(200,{allVideos,totalVideo},"Sucessfully getting all videos")
        )
    
    } catch (error) {
        throw new ApiError(400,error.message || "Server error")
    }



})

const getVideoById = ( async(req,res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400,"VideoId are required")
    }

    if(!(isValidObjectId(videoId))){
        throw new ApiError(400, "Invalid video id")
    }

    const video =  await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"Couldnt Find the video or video does not exist")
    }

    return res.status(200).json(
        new ApiResponse(200,{video},"video found sucessfully")
    )
})


const updateVideoFile= ( async(req,res) => {
    const { videoId } = req.params

    if(!(isValidObjectId(videoId))){
        throw new ApiError(400, "Invalid video id")
    }

    const video = await findById(videoId)
    if(!video){
        throw new ApiError(400,"video is not exist")
    }
    
    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
          400,
          "Only the owner of the video can update the video File ",
        )
      }

    const videoFilePath = req.file?.path

    if(!videoFilePath){
        throw new ApiError(400, "video is required to update")
    }

    const videoFile = await uploadONCloudinary(videoFilePath);

    if(!videoFile){
        throw new ApiError(400, "Cloudinary video is required")
    }

    
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                videoFile: videoFile.url
            }
        },
        {new : true}
    )

    if(!updatedVideo){
        throw new ApiError(400,"Video is Not updated")
    }

    return res.status(200).json(
        new ApiResponse(200, {updatedVideo},"Video updated Sucessfully")
    )
})

const updateThumbnail= ( async(req,res) => {
    const { videoId } = req.params

    if(!(isValidObjectId(videoId))){
        throw new ApiError(400, "Invalid video id")
    }

    const video = await findById(videoId)
    if(!video){
        throw new ApiError(400,"video is not exist")
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
          400,
          "Only the owner of the video can update the thumbnail",
        )
      }

    const thumbnailPath = req.file?.path

    if(!thumbnailPath){
        throw new ApiError(400, "thumbnail is required to update")
    }

    const thumbnail = await uploadONCloudinary(thumbnailPath);

    if(!thumbnail){
        throw new ApiError(400, "Cloudinary thumbnail is required")
    }


    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                thumbnail: thumbnail.url
            }
        },
        {new : true}
    )

    if(!updatedVideo){
        throw new ApiError(400,"thumbnail is Not updated")
    }

    return res.status(200).json(
        new ApiResponse(200, {updatedVideo},"thumbnail updated Sucessfully")
    )
})

const updateVideoDetail = ( async(req, res) => {
    const { videoId } = req.params

    if(!(isValidObjectId(videoId))){
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video is not exist")
    }

    if(video.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "Only the owner of the video can update the deatil of video")
    }
    const {title,description} = req.body

    if (!(title && description)){
        throw new ApiError(400, "title and discription are required");
    }

    const updatedVideoDetails = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title : title,
                description: description

            }
        },
        {new : true}
    )

    if(!updatedVideoDetails){
        throw new ApiError(400, "Video details can't be updated")
    }

    return res.staus(200).json(
        new ApiResponse(200, {updateVideoDetail},"Video Detail updated Sucessfully")
    )
})

const deleteVideo = ( async(req, res) => {
    const { videoId } = req.params

    if(isValidObjectId(videoId)){
        throw new ApiError(400, "object Id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"video is not exist")
    }

    if(video.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "only owner can delete the video")
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if(!deletedVideo){
        throw new ApiError(400, "Video couldn't be deleted")
    }

    return res.status(200).json(
        new ApiResponse(200,{deletedVideo},"Video deleted Sucessfully")
    )
})





export {
    publishVideo,
    getAllVideos,
    getVideoById,
    updateVideoFile,
    updateThumbnail,
    updateVideoDetail,
    deleteVideo
}