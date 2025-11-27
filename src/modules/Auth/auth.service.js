import { UserModel } from "../../config/models/user.model.js";
import { asyncHandler } from "../../utils/response/respone.js";



export const Signup=asyncHandler(async(req,res,next)=>{
    const {firstName,lastName,email,password,confirmPassword,phone}=req.body;
    if(await UserModel.findOne({email})){
        return res.status(400).json({
            message:"Email already exists"
        })
    }
      
    const newUser=new UserModel({
        firstName,
        lastName,
        email,
        password,
        phone  
    })
    await newUser.save();
    return res.status(201).json({
        message:"User created successfully",
        data:newUser
    })


   


      





});
export const login=asyncHandler(async(req,res,next)=>{
 const {email,password}=req.body;
 const user=await UserModel.findOne({email});
 if(!user){
    return res.status(400).json({
        message:"User not found"
    })
 }
 if(user.password!==password){
    return res.status(400).json({
        message:"Invalid email or password"
    })
 }
    return res.status(200).json({
        message:"Login successful",
        data:user
    })




})