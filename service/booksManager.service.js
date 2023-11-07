import { booksManagerModel } from "../DAO/models/booksManager.model.js"
import { bookManagerLogger } from "../utils/log4js.js"
import { userService } from "./user.service.js";

class BooksManagerService{
  async get(){
    const booksCards = await booksManagerModel.find().populate("books").populate("owner");
    return booksCards
  }

  async getById(){
    const bookCard = await booksManagerModel.findById(bid).populate("books");
    return bookCard
  }

  async post(date, expireDate, book, user){
    const postBook = await booksManagerModel.create({retiredDate: date, expireDate: expireDate, books: book, owner: user})
    return postBook
  }

  async put(bid, info){
    const { bookId } = info;
    const putBookCard = await booksManagerModel.updateOne({_id: bid}, {book: bookId})
    return putBookCard
  }

  async delete(bid, user){
    try {
      const deleteBookCard = await booksManagerModel.findByIdAndDelete(bid);
      if (deleteBookCard) {
        userService.getById(user).then((user) => {
          console.log(user.books);
          const newUser = user.books.filter((e) => e._id.toString() !== bid)
          console.log(newUser);
        })
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