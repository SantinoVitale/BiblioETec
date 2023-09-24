import { booksManagerService } from "../service/booksManager.service.js"

class BooksManagerController{
  async get(req, res){
    const booksCard = booksManagerService.get()
    return res.status(200).json({
      status: "success",
      message: "Libros extraidos de la base de datos correctamente",
      payload: {booksCard}
    })
  }

  async getById(req, res){
    const {bid} = req.params
    const bookCard = booksManagerService.getById(bid)
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
    
  }

  async put(req, res){

  }

  async delete(req, res){
    
  }
}

export const booksManagerController = new BooksManagerController()