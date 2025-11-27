import path from 'node:path';
import * as dotenv from 'dotenv'
dotenv.config({path:path.join('./.env')})
import express from 'express';
import fs from 'fs';

export const Bootsrap=()=>{
const app=express();
const port=process.env.PORT 
app.use(express.json());




app.listen(port,()=>{

    console.log(`Server is running on port ${port}`);
})





}