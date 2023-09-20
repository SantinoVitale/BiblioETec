import mongoose from 'mongoose';

const userCollection = "users"

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    max: 100,
  },
  lastName: {
    type: String,
    max: 100,
  },
  password: {
    type: String,
    max: 100,
  },
  email: {
    type: String,
    max: 100,
    unique: true,
  },
  books:{
    type:[
      {
        bookRetired:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "booksManager"
        }
      }
    ]
  }
});


export const userModel = mongoose.model(userCollection, userSchema);