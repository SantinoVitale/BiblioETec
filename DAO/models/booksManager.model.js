import mongoose from "mongoose";

const bookManagerCollection = "booksManager"

const booksManagerSchema = new mongoose.Schema({
  title: String,
  retiredDate: Date,
  expireDate: Date,
  owner: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users"
  }
})

export const booksManagerModel = mongoose.model(bookManagerCollection, booksManagerSchema)