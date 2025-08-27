import dbconnect from "@/lib/dbconnect";
import UserModel from "@/Modal/users";
 import bcrypt from "bcryptjs";
 import { sendVerificationEmail } from "@/Helper/sendVerificationEmail";
import { success } from "zod";

 export async function POST(request:Request){
  await dbconnect()
  try {
    const {username,email,password}=await request.json()
    const existingUserVerifiedByUsername=await UserModel.findOne({
      username,
      isVerified:true,
    })
    if(existingUserVerifiedByUsername){
      return Response.json({
        success:false,
        message:'username is already taken',

      },{
        status:400
      })
    }
   const existingUserbyemail=await UserModel.findOne({email})
   const verifyCode=Math.floor(100000+Math.random()*900000).toString()
   if(existingUserbyemail){
    if(existingUserbyemail.isVerified){
       return Response.json({
      success:false,
      message:'User already exist with this email'
    },{status:500})
    }
    else{
      const hashedpassword=await bcrypt.hash(password,10)
      existingUserbyemail.password=hashedpassword;
      existingUserbyemail.verifyCode=verifyCode;
      existingUserbyemail.verifyCodeExpiry=new Date(Date.now()+3600000);
      await existingUserbyemail.save();

    }
   }
   else{
    const hashedpassword=await bcrypt.hash(password,10)
    const expiryDate=new Date()
    expiryDate.setHours(expiryDate.getHours()+1)
    const newUser=new UserModel({
      username,
       email,
       password:hashedpassword,
       verifyCode,
       verifyCodeExpiry:expiryDate,
       isVerified:false,
       isAccptingMessage:true,
       messages:[],

    })
    await newUser.save()
   }
   //send verification email
   const emailResponse=await sendVerificationEmail(
    email,
    username,
    verifyCode,
   )
   if(!emailResponse.success){
    return Response.json({
      success:false,
      message:emailResponse.message
    },{status:500})
    
   }
   return Response.json({
      success:true,
      message:"user registered successfully please verify user email"
    },{status:200})
    
  } catch (error) {
    console.error("Error Registering user",error)
    return Response.json({
      success:false,
      message:'error registering message'
    },{
      status:500
    }
  )
  }
 }
