import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js";
import {uploadONCloudinary} from "../utils/cloudinary.js"
import bcrypt from "bcrypt";

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
   console.log(existedUser);
   // if(existedUser){
   //    throw new ApiError(400,"user Already Exist")
   // }
   
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
   if(!username || !email){
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

   //------------------------- generate access token and referesh token

   //------------------------- send cokkies with accesss token and refresh token 

   //--------------------------send response 
})

   

export {
   registerUser,
   loginUser
};