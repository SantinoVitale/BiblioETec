import { booksManagerModel } from "../DAO/models/booksManager.model.js"

class BooksManagerService{
  async get(){
    const booksCards = await booksManagerModel.find().populate("books")
    return booksCards
  }

  async getById(){
    const bookCard = await booksManagerModel.findById(bid).populate("books")
    return bookCard
  }

  async post(title, date, expireDate, book, user){
    const postBook = await booksManagerModel.create({title: title, retiredDate: date, expireDate: expireDate, books: book, owner: user})
    return postBook
  }

  async put(bid, info){
    const { title, bookId } = info;
    const putBookCard = await booksManagerModel.updateOne({_id: bid}, {title: title, book: bookId})
    return putBookCard
  }

  async delete(bid){
    const deleteBookCard = await booksManagerModel.findByIdAndDelete(bid)
    return deleteBookCard
  }
}

export const booksManagerService = new BooksManagerService()