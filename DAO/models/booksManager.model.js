import mongoose from "mongoose";

const bookManagerCollection = "booksManager"

const booksManagerSchema = new mongoose.Schema({
  title: {type: String, required: true},
  retiredDate: {type: Date, required: true},
  expireDate: {type: Date, required: true},
  books: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "books"
  },
  owner: {type: String, required: true}
  /*owner: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  }*/
})

export const booksManagerModel = mongoose.model(bookManagerCollection, booksManagerSchema)