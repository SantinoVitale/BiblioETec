import { booksManagerModel } from "../DAO/models/booksManager.model.js"
import { bookManagerLogger } from "../utils/log4js.js"

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
    try {
      const deleteBookCard = await booksManagerModel.findByIdAndDelete(bid);
      if (deleteBookCard) {
        // Si el libro se eliminó correctamente, retornar true
        return true;
      } else {
        // Si el libro no se encontró para eliminar, también retornar true
        return true;
      }
    } catch (error) {
      // En caso de error, retornar false
      bookManagerLogger.error("Error al eliminar el libro:", error);
      return false;
    }
  }
}

export const booksManagerService = new BooksManagerService()