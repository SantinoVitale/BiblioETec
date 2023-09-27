import mongoose from "mongoose";

const bookManagerCollection = "booksManager"

const booksManagerSchema = new mongoose.Schema({
  title: String,
  retiredDate: Date,
  expireDate: Date,
  books: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "books"
  },
  owner: String
  /*owner: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  }*/
})

export const booksManagerModel = mongoose.model(bookManagerCollection, booksManagerSchema)