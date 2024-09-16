import { bookService } from "../service/book.service.js";
import { bookLogger } from "../utils/log4js.js";

class BookController {
  async get(req, res) {
    const books = await bookService.get();
    if(!books)
    {
      bookLogger.error("Hubo un error a la hora de traer los libros");
      return res.status(400).json({
        status: "error",
        message: "Hubo un error a la hora de traer los libros",
        valid: false
      });
    }
    
    bookLogger.info(`Se trajeron ${books.length} libros`);

    return res.status(200).json({
      status: "success",
      message: "Libros extraidos de la base de datos correctamente",
      payload: {
        books
      }
    });
  }

  async getById(req, res) {
    const {bid} = req.params;
    if(!bid)
    {
      bookLogger.error("No se pasó el bid")
      return res.status(400).json({
        status: "error",
        message: "No se pasó el bid",
        valid: false
      });
    }
    const book = bookService.getById(bid);
    if (!book)
    {
      bookLogger.error("No se ha podido traer el libro correctamente")
      return res.status(400).json({
      status: "error",
      message: "No se ha podido traer el libro correctamente",
      valid: false
    });
    }
    bookLogger.info(`Se trajo el libro con el id ${book._id} exitosamente`);
    return res.status(200).json({
      status: "success",
      message: "Carta del libro extraido de la base de datos correctamente",
      valid: true,
      payload: {bookCard}
    });
  }
  async post(req, res) {
    const {title, author, category, img} = req.body;
    if (!title || !author || !img || !category){
      bookLogger.error("Faltó alguno de los 4 campos");
      return res.status(400).json({
        status: "error",
        message: "No se pudo subir el libro debido a que faltan datos",
        valid: false
      });
    }
    
    const postBook = await bookService.post(title, author, img, category);
    
    if(!postBook)
    {
      bookLogger.error("hubo un problema a la hora de subir el libro, error: ", postBook);
      return res.status(500).json({
        status: "error",
        message: "No se pudo subir el libro",
        valid: false
      });
    }

    bookLogger.info(`Se subió el libro ${postBook.title} con el id ${postBook._id}`);
    return res.status(200).json({
      status: "success",
      message: "Se subio el libro correctamente",
      valid: true,
      payload: {postBook}
    });
  }

  /*
  //! Rehacer en algun momneto para que reciba archivos
  async postMany(req, res) {
    const postBook = await bookService.postMany(req.body)
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
  }*/

  async put(req, res) {
    const {bid} = req.params;
    if(!bid)
    {
      bookLogger.error("No se pasó el bid");
      return res.status(400).json({
        status: "error",
        message: "No se pasó el bid",
        valid: false
      });
    }

    const putBook = await bookService.put(bid, req.body);
  
    if (!putBook)
    {
      bookLogger.error("No se pudo actualizar el libro. Error: ", putBook);
      return res.status(400).json({
      status: "error",
      message: "No se pudo actualizar el libro",
      valid: false
      });
    }

    bookLogger.info(`Se actualizó el libro con el ID ${bid} correctamente`);

    return res.status(200).json({
      status: "success",
      message: "Se actualizó el libro correctamente",
      valid: true,
      payload: {putBook}
    });
  }

  async delete(req, res) {
    const {bid} = req.params;
    if(!bid)
    {
      bookLogger.error("No se pasó el bid");
      return res.status(400).json({
        status: "error",
        message: "No se pasó el bid",
        valid: false
      });
    }

    const deleteBook = bookService.delete(bid);

    if (!deleteBook)
    {
      bookLogger.error("No se pudo borrar el libro, Error: ", deleteBook);
      return res.status(400).json({
      status: "error",
      message: "No se ha podido borrar el libro",
      valid: false
    });
    }
    
    bookLogger.info(`Se borró el libro con el ID ${bid} correctamente`);
    return res.status(200).json({
      status: "success",
      message: "Se borró el libro correctamente",
      valid: true,
      payload: {deleteBook}
    });
  }
}

export const bookController = new BookController();