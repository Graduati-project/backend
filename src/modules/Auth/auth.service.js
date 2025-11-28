import { UserModel } from "../../config/models/user.model.js";
import { sendResetEmail } from "../../utils/email/email.js";
import { generateNumberOtp } from "../../utils/otp.js";
import { asyncHandler, successResponse } from "../../utils/response/respone.js";
import { compareHash, generateHash } from "../../utils/security/hash.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/security/token.js";



export const Signup=asyncHandler(async(req,res,next)=>{
    const {firstName,lastName,email,password,confirmPassword,phone}=req.body;

     if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if(await UserModel.findOne({email})){
      return res.status(400).json({
          message:"Email already exists"
      })
  }
   const hashedPassword = generateHash(password);
      
    const newUser=new UserModel({
        firstName,
        lastName,
        email,
        password:hashedPassword,
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
       const IsMatch=await compareHash(password,user.password);
       if(!IsMatch){
        return res.status(400).json({
            message:"Invalid email or password"
        })
       }
      const access_token = generateAccessToken({ id: user._id, email: user.email });
const refresh_token = generateRefreshToken({ id: user._id, email: user.email });

    return res.status(200).json({
        message:"Login successful",
       
        access_token,
        refresh_token
    })
})
export const sendResetPasswordEmail=asyncHandler(async(req,res,next)=>{
const{email}=req.body;
const user=await UserModel.findOne({email});
if(!user){
    return res.status(404).json({
        message:"User not found"
    })
}
const RESEND_COOLDOWN_MS = 2 * 60 * 1000;
if (user.resetPasswordLastSent && (Date.now() - user.resetPasswordLastSent.getTime()) < RESEND_COOLDOWN_MS) {
    const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - user.resetPasswordLastSent.getTime())) / 1000);
    return res.status(429).json({
        message:`Please wait ${waitSeconds} seconds before requesting another OTP`
    })
}
const otp=generateNumberOtp();
  const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); 
user.resetPasswordToken=otp;
user.resetPasswordExpires=resetPasswordExpires;
user.resetPasswordLastSent=new Date();
await user.save();
try{
    await sendResetEmail({
        to: email,
        otp,
        expiryMinutes: 10
    });
}catch (emailError) {
    console.error('Failed to send reset email:', emailError);
    return next(new Error("Failed to send reset email", { cause: 500 }));
  }
return successResponse({
    res,
    message:"Reset code sent successfully to your email",
})





});
export const resetPassword=asyncHandler(async(req,res,next)=>{
   
const { email, otp, newPassword } = req.body;
const user=await UserModel.findOne({
    email,
    resetPasswordToken:otp,
    resetPasswordExpires: { $gt: new Date() }
})
if(!user){
    return res.status(400).json({
        message:"Invalid or expired OTP"
    })
}
const hashedPassword=generateHash(newPassword);
user.password=hashedPassword;
user.resetPasswordToken=undefined;
user.resetPasswordExpires=undefined;
await user.save();
return successResponse({
    res,
    message:"Password reset successfully",  

})
});