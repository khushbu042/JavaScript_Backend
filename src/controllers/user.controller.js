import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js";
import {uploadONCloudinary} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"


const genrateAccessAndRefrehToken = async(userId) => {
   try {
         const user = await User.findById(userId)
      
         const accessToken = user.generateAccessToken()
         const refreshToken = user.genrateRefreshToken()
         
         user.refreshToken = refreshToken
         user.save({validateBeforeSave: false})
      
         return {accessToken, refreshToken}
   } catch (error) {
      throw new ApiError(500,"Something Went Wrong during Genrating Tokens")
   }
}

const registerUser =  (async (req, res) => {

   //------------------------------------- get user details from frontend
   const {username, email, fullName, password} = req.body

   //-------------------------------------validation - not empty
   if([username, email, fullName, password].some( (field) => {
       field?.trim() === "";
   })) {
      throw new ApiError(400,"All field are required")
   }
   
   //------------------------------------- check if already exists using email or username
   const existedUser = await User.findOne({
      $or : [{username},{email}]
   })
   if(existedUser){
      throw new ApiError(400,"user Already Exist")
   }
   
   //----------------------------------------check for images, check for avatar
   // console.log(req.files)
   const avatarlocalPath= req.files?.avatar[0]?.path;
   let coverImageLocalPath = "";
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
   }

   // --------------------------------------upload them cloudinary, avatar
   if(!avatarlocalPath) {
      throw new ApiError(400,"Avatar file is required")
   }
   const avatar = await uploadONCloudinary(avatarlocalPath)
   const coverImage = await uploadONCloudinary(coverImageLocalPath)
   if(!avatar){
      throw new ApiError(400,"Cloudinary Avatar file is required")
   }
   
   //----------------------------create user object -create entry in DB 
   const createduser = await User.create({
      username: username.toLowerCase(), 
      email, 
      fullName, 
      password,
      avatar: avatar.url,
      coverImage: coverImage?.url || ""
   })

   //------------------------remove passwrod and refresh token field from response
   const registeredUser = await User.findById(createduser._id).select("-password -refreshToken")

   //---------------------check response user is created or not
   if(!registeredUser){
      throw new ApiError(500, "something went wrong while registering")
   }

   //-------------------------------------return response
   return res.status(201).json(
      new ApiResponse(200, registeredUser, "User Registered Successfully")
   ) 
}) 

const loginUser = (async (req, res) => {

   //-------------------------get user details from frontend req.body ->data
   // res.send("Hello is am login function")
   // console.log(req.body)
   const {username, email, password} = req.body;

   //-------------------------username or email check or password empty
   if(!(username || email)){
      throw new ApiError(400, "Email or username is required")
   }
   if(!password){
      throw new ApiError(400, "password is required")
   }
   //-------------------------- user exist or not 
   const user  = await User.findOne({
      $or: [{username},{email}]
   })
   if(!user){
      throw new ApiError(400, "user not exist please register user")
   }

   //------------------------- password check
   const isPasswordValid = await user.isPasswordCorrect(password)
   if(!isPasswordValid){
      throw new ApiError(401, "Invalid user credentials")
   }

   //------------------------- generate access token and referesh token and store refresh token in database
   const {accessToken, refreshToken} = await genrateAccessAndRefrehToken(user._id)

   // ------------------------take loggendInuser without password and refresh token
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   //------------------------- send cokkies with accesss token and refresh token and response
   const options = {
      httpOnly: true,
      secure: true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new ApiResponse(
         200,
         {loggedInUser,accessToken,refreshToken},
         "user logged in  successfully"
      )
   )
})

const logoutUser = (async(req, res) => {
   User.findByIdAndUpdate(
      req.user._id,
      {
         $unset :{
            refreshToken :1 // this removes the field from document
         }
      },
      {
         new : true
      }
   )

   const options = {
      httpOnly: true,
      secure: true,
   }

   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(
      new ApiResponse(201,{},"User logged out")
   )
})

const refreshAccessToken = (async(req, res,) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshAccessToken

    if(!incomingRefreshToken){
      throw new ApiError(401, "unauthorized access")
    }

  try {
         const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
      
         const user = await User.findById(decodedToken?._id)
      
         if(!user){
            throw new ApiError(401, "unauthorized access")
         }
      
         if(!(incomingRefreshToken === user?.refreshToken)){
            throw new ApiError(401, "Refresh Token is expired or used")
         }
      
         const {newAccessToken, newRefreshToken} = genrateAccessAndRefrehToken(user?._id)
      
         const options = {
            httpOnly : true,
            secure : true
         }
 
         return res.status(200)
         .cookie("accessToken", newAccessToken, options)
         .cookie("refreshToken", newRefreshToken,options)
         .json(
            new ApiResponse(200, {accessToken: newAccessToken, refreshToken: newRefreshToken}, "Access Token Refreshed")
         )
  } catch (error) {
      throw new ApiError(401,error?.message || "invalid Refresh Token")
  }
})

const changeCurrentPassword = (async(req,res) => {
   const {oldPassword, newPassword} = req.body 

   if(!(newPassword && oldPassword)){
      throw new ApiError(401, "oldpassword and newpassword is required")
   }
   const user = await User.findById(req.user?._id)
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

   if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid old password")
   }

   user.password = newPassword
   await user.save({validateBeforeSave: false})
  
   return res.status(200).json(
      200,
      {},
      "Password Changed Sucessfully"
   )
})

const getCurrentUser = (async(req, res ) => {

   return res.status(200).
   json(
         new ApiResponse( 200, req.user, "User Fetched sucessfully")
   )
})

const updateUserAvatar = (async(req, res) => {
   const avatarLocalPath = req.file?.path

   if(!avatarLocalPath){
      throw new ApiError(400, "Avatar file is missing")
   }

   const avatar = await uploadONCloudinary(avatarLocalPath)
   if (!avatar.url) {
      throw new ApiError(400, "Error while uploading on avatar")
      
  }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            avatar: avatar.url 
         }
      },
      {new: true}
   ).select("-password")

   return res.status(200).json(
      new ApiResponse(200, user, "avatar image updated sucessfully")
   )

})

const updateUserCoverImage = (async(req, res) => {
   const coverImageLocalPath = req.file?.path

   if(!coverImageLocalPath){
      throw new ApiError(400, "CoverImage file is missing")
   }

   const coverImage = await uploadONCloudinary(coverImageLocalPath)
   if (!coverImage.url) {
      throw new ApiError(400, "Error while uploading on CoverImage")
      
  }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            coverImage: coverImage.url 
         }
      },
      {new: true}
   ).select("-password")

   return res.status(200).json(
      new ApiResponse(200, user, "cover image updated sucessfully")
   )

})

const getUserChannelProfile =(async(req,res) => {
   let {username} = req.params

   if(!username){
      username = "ram123"
   }

   const channel = await User.aggregate([
      {
         $match: {
            username: username
         }
      },
      {
         $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
         }
      },
      {
         $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as:"subscribesTo"

         }
      },
      {
         $addFields: {
            subscribersCount: {
               $size: "$subscribers"
            },
            channelsSubscribedToCount: {
               $size: "$subscribesTo"
            },
            isSubscribed: {
               $cond: {
                  if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                  then: true,
                  else: false
               }
            }
         }
      },
      {
         $project: {
            fullName: 1,
            username: 1,
            subscribersCount: 1,
            channelsSubscribedToCount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
            email: 1
         }
      }
   ])

   if(!channel?.length){
      throw new ApiError(401,"channel does not exists")
   }

   return res.status(200).json(
      new ApiResponse(200,channel[0],"user Channel fetched sucessfully")
    
   )
})

   

export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateUserAvatar,
   updateUserCoverImage,
   getUserChannelProfile
};