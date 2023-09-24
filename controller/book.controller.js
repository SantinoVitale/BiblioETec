import { bookService } from "../service/book.service.js"

class BookController{
  async get(req, res){
    const books = await bookService.get()
    return res.status(200).json({
      status: "success",
      message: "Libros extraidos de la base de datos correctamente",
      payload: {books}
    })
  }

  async getById(req, res){
    const {bid} = req.params
    const book = bookService.getById(bid)
    if (!book) return res.status(400).json({
      status: "error",
      message: "No se ha podido traer la carta del libro correctamente",
      payload: {}
    })
    return res.status(200).json({
      status: "success",
      message: "Carta del libro extraido de la base de datos correctamente",
      payload: {bookCard}
    })
  }
  async post(req, res){

  }

  async put(req, res){

  }

  async delete(req, res){

  }
}

export const bookController = new BookController()