import mongoose from "mongoose";

const userSchema=new mongoose.Schema({

  firstName:{
    type:String,
    required:true,
    minlength:3,
    maxlength:[30,"Too long name"]
  },
  lastName:{
    type:String,
    required:true,
    minlength:3,
    maxlength:[30,"Too long name"]
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  role:{
    type :String,
    enum:["admin","doctor","patient"],
    default:"patient"
  },
  phone:{
    type:String,
  },
    password:{
    type:String,
    required:true,
    },
    isDeleted:{
    type:Boolean,
    default:false
    },
    deleteAt:{type:Date},
    
    resetPasswordToken:{type:String},
    resetPasswordExpires:{type:Date},
    resetPasswordLastSent:{type:Date}

},{

timestamps:true
})
userSchema.set("toJSON", {
  transform: (doc, ret, options) => {
    delete ret.password;
    return ret;
  },
});

export const UserModel=mongoose.model.User||mongoose.model("User",userSchema);





