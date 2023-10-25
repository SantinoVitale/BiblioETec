import {
  bookService
} from "../service/book.service.js"

class BookController {
  async get(req, res) {
    const books = await bookService.get()
    return res.status(200).json({
      status: "success",
      message: "Libros extraidos de la base de datos correctamente",
      payload: {
        books
      }
    })
  }

  async getById(req, res) {
    const {
      bid
    } = req.params
    const book = bookService.getById(bid)
    if (!book) return res.status(400).json({
      status: "error",
      message: "No se ha podido traer la carta del libro correctamente",
      payload: {}
    })
    return res.status(200).json({
      status: "success",
      message: "Carta del libro extraido de la base de datos correctamente",
      payload: {
        bookCard
      }
    })
  }
  async post(req, res) {
    const {
      title,
      description,
      img
    } = req.body;
    if (!title || !description || !img) return res.status(400).json({
      status: "error",
      message: "No se pudo subir el libro debido a que faltan datos",
      payload: {}
    })
    const postBook = await bookService.post(title, description, img)
    if(!postBook) return res.status(400).json({
      status: "error",
      message: "No se pudo subir el libro",
      payload: {}
    })
    return res.status(200).json({
      status: "success",
      message: "Se subio el libro correctamente",
      payload: {postBook}
    })
  }

  async postMany(req, res) {
    const postBook = await bookService.postMany(req.body)
    console.log(req.body);
    if(!postBook) return res.status(400).json({
      status: "error",
      message: "No se pudo subir el libro",
      payload: {}
    })
    return res.status(200).json({
      status: "success",
      message: "Se subio el libro correctamente",
      payload: {postBook}
    })
  }

  async put(req, res) {
    const {bid} = req.params
    const putBook = await bookService.put(bid, req.body)
    if (!putBook) return res.status(400).json({
      status: "error",
      message: "No se pudo actualizar el libro",
      payload: {}
    })
    return res.status(200).json({
      status: "success",
      message: "Se actualizó el libro correctamente",
      payload: {putBook}
    })
  }

  async delete(req, res) {
    const {
      bid
    } = req.params
    const deleteBook = bookService.delete(bid)
    if (!deleteBook) return res.status(400).json({
      status: "error",
      message: "No se ha podido borrar el libro",
      payload: {}
    })
    return res.status(200).json({
      status: "success",
      message: "Se borró el libro correctamente",
      payload: {deleteBook}
    })
  }
}

export const bookController = new BookController()