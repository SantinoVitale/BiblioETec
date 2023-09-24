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

  async post(){

  }

  async put(bid){

  }

  async delete(bid){

  }
}

export const bookService = new BookService()