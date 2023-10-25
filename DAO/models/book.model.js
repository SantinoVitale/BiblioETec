import mongoose from "mongoose";

const bookCollection = "books"

const bookSchema = new mongoose.Schema({
  title: {type: String, required: true},
  author: {type: String, required: true},
  category: {type: String, required: true},
  img: {type: String, required: false},
})


export const bookModel = mongoose.model(bookCollection, bookSchema)