import mongoose from 'mongoose';

const userCollection = "users"

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required:true
  },
  lastName: {
    type: String,
    required:true
  },
  course:{
    type: String,
    required: true
  },
  phone:{
    type: Number,
    required: true
  },
  password: {
    type: String,
    required:true
  },
  email: {
    type: String,
    unique: true,
    required:true
  },
  role:{
    type:String,
    required:true,
    default: "student",
  },
  booksCard:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "booksManager"
      }
    ],
  verified: {
    type: Boolean,
    default: false
  }
});


export const userModel = mongoose.model(userCollection, userSchema);