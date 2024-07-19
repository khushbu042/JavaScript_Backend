import mongoose from "mongoose";

const userSchema =  new mongoose.Schema({
    username: {
        type: String,
        require: true,
        lowercase: true,
        unique: true,
        trim: true, 
        index: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true
    },
    fullName: {
        type: String,   
        required: true
    },
    avatar: {
        type: String,  // cloudinary URL
        required: true
    },
    coverImage: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : "video"
        }
    ],
    refreshToken: {
        type: String
    }
},{timestamps: true})

export const user = mongoose.model("user",userSchema)