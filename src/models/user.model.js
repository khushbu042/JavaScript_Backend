import mongoose from "mongoose";
import bcrypt from "bcrypt";
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

userSchema.pre("save", async function(next){
   if(!this.isModified("password")) return next();
   this.password = await bcrypt.hash(password, 10);
   next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// userSchema.methods.generateAccessToken = function {
//     return (jwt.sign(
//         {},
//         {},
//         {}
//     ))
// }


export const User = mongoose.model("User",userSchema)