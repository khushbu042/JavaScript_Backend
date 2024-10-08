import mongoose from "mongoose";

const videoSchema =  new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    description : {
        type: String,
        required: true
    },
    videoFile: {
        type: String,     // cloudianry URL
        required: true
    },
    thumbnail: {
        type: String,    // cloudinary URL
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
       type: Boolean,
       default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
},{timestamps: true})

export const Video = mongoose.model("Video",videoSchema)