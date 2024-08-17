import { bookModel } from "../DAO/models/book.model.js"

class BookService{
  async get(){
    const books = await bookModel.find();
    return books
  }

  async getById(bid){
    const book = await bookModel.findById(bid)
    return book
  }

  async post(title, author, img, category){
    const postBook = await bookModel.create({title, author, img, category})
    return postBook
  }

  async postMany(data){
    const postBook = await bookModel.insertMany(data)
    return postBook
  }

  async put(bid, info){
    const { title, author, img, category} = info
    const putBook = await bookModel.updateOne({_id: bid}, {title: title, author: author, img: img, category: category})
    return putBook
  }

  async delete(bid){
    const deleteBook = await bookModel.deleteOne({_id: bid})
    return deleteBook
  }
}

export const bookService = new BookService()