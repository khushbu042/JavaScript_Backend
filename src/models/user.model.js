import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"


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

// Password Hashing Before save into the database
userSchema.pre("save", async function(next){
   if(!this.isModified("password")) return next();
   this.password = await bcrypt.hash(this.password, 10);
   next();
})

// password checking for login 
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// Generate Access token for login purpose
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
// Generate Refresh token for login purpose
userSchema.methods.genrateRefreshToken = function () {
   return jwt.sign(
    {
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
       expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
    }
   )
}


export const User = mongoose.model("User",userSchema)