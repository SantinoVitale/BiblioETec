import mongoose from "mongoose";

const bookManagerCollection = "booksManager"

const booksManagerSchema = new mongoose.Schema({
  owner: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  retiredDate: {type: Date, required: true},
  expireDate: {type: Date, required: true},
  books: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "books"
  }
})

export const booksManagerModel = mongoose.model(bookManagerCollection, booksManagerSchema)