import { bookModel } from "../DAO/models/book.model.js"

class BookService{
  async get(){
    const books = await bookModel.find()
    return books
  }

  async getById(bid){
    const book = await bookModel.findById(bid)
    return book
  }

  async post(title, description, img){
    const postBook = await bookModel.create({title, description, img})
    return postBook
  }

  async put(bid, info){
    const { title, description, img} = info
    const putBook = await bookModel.updateOne({_id: bid}, {title: title, description: description, img: img})
    return putBook
  }

  async delete(bid){
    const deleteBook = await bookModel.deleteOne({_id: bid})
    return deleteBook
  }
}

export const bookService = new BookService()