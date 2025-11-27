import path from 'node:path';
import * as dotenv from 'dotenv'
dotenv.config({path:path.join('./.env')})
import express from 'express';
import connectDB from './config/connection.db.js';
import authController from '../src/modules/Auth/auth.controller.js';

export const Bootsrap=async()=>{
const app=express();
const port=process.env.PORT 
app.use(express.json());
await connectDB();



app.use("/auth",authController)



app.listen(port,()=>{

    console.log(`Server is running on port ${port}`);
})

}