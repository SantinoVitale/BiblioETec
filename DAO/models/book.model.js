import mongoose from "mongoose";

const bookCollection = "books"

const bookSchema = new mongoose.Schema({
  title: String,
  description: String,
  img: String
})


export const bookModel = mongoose.model(bookCollection, bookSchema)