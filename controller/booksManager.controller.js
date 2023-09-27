import { bookService } from "../service/book.service.js"
import { booksManagerService } from "../service/booksManager.service.js"
import { ObjectId } from "mongoose"
class BooksManagerController{
  async get(req, res){
    const booksCard = await booksManagerService.get()
    return res.status(200).json({
      status: "success",
      message: "Libros extraidos de la base de datos correctamente",
      payload: {booksCard}
    })
  }

  async getById(req, res){
    const {bid} = req.params
    const bookCard = await booksManagerService.getById(bid)
    if (!bookCard) return res.status(400).json({
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
    const {
      title,
      books
    } = req.body;
    const fechaActual = new Date();
    const fechaArg = new Date(fechaActual.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
    const unaSemana = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos
    const fechaMasUnaSemana = new Date(fechaArg.getTime() + unaSemana);

    if (!title || !books) return res.status(400).json({
      status: "error",
      message: "No se pudo subir el libro debido a que faltan datos",
      payload: {}
    })
    const postBookCard = await booksManagerService.post(title, fechaArg, fechaMasUnaSemana, books, "Usuario Prueba")
    if(!postBookCard) return res.status(400).json({
      status: "error",
      message: "No se pudo subir el libro",
      payload: {}
    })
    return res.status(200).json({
      status: "success",
      message: "Se subio el libro correctamente",
      payload: {postBookCard}
    })
  }

  async put(req, res){

  }

  async delete(req, res){
    const {bid} = req.params
    const deleteBookCard = await booksManagerService.delete(bid)
    if (!deleteBookCard) return res.status(400).json({
      status: "error",
      message: "No se ha podido borrar la carta del libro correctamente",
      payload: {}
    })
    return res.status(200).json({
      status: "success",
      message: "Carta del libro borrado de la base de datos correctamente",
      payload: {deleteBookCard}
    })
  }
}

export const booksManagerController = new BooksManagerController()