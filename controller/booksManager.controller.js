import { booksManagerService } from "../service/booksManager.service.js";
import { bookManagerLogger } from "../utils/log4js.js";
import { userService } from "../service/user.service.js";

class BooksManagerController{
  async get(req, res){
    const booksCard = await booksManagerService.get();
    bookManagerLogger.info(`Se trajeron ${booksCard.length} tarjetas de los libros correctamente`);
    return res.status(200).json({
      status: "success",
      message: "Libros extraidos de la base de datos correctamente",
      valid: true,
      payload: {booksCard}
    });
  }

  async getById(req, res){
    const {bid} = req.params;
    if(!bid)
    {
      return res.status(406).json({
        status: "error",
        message: "No se pasó el bid",
        valid: false
      });
    }
    const bookCard = await booksManagerService.getById(bid);

    if (!bookCard)
    {
      bookManagerLogger.error(`Hubo un error al encontrar el libro con el ID ${bid}. Error: ${bookCard}`);
      return res.status(502).json({
        status: "error",
        message: "No se ha podido traer la carta del libro correctamente",
        valid: false
      });
    }
    
    bookManagerLogger.info(`Se encontró el libro con el ID ${bid}. Libro: ${bookCard}`);
    return res.status(200).json({
      status: "success",
      message: "Carta del libro extraido de la base de datos correctamente",
      valid: true,
      payload: {bookCard}
    })
  }

  async post(req, res){
    const {user, books} = req.body;
    const fechaActual = new Date();
    const fechaArg = new Date(fechaActual.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
    const unaSemana = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos
    const fechaMasUnaSemana = new Date(fechaArg.getTime() + unaSemana);

    if (!user || !books)
    {
      return res.status(406).json({
        status: "error",
        message: "No se pudo retirar el libro debido a que faltan datos",
        valid: false
      });
    }

    await booksManagerService.post(fechaArg, fechaMasUnaSemana, books, user)
    .then(async (data) => {
      const userPostCard = await userService.postBook(user, data._id);
      if(!data || !userPostCard)
      {
        bookManagerLogger.error(`No se pudo retirar el libro. Error: ${data}`);
        return res.status(502).json({
          status: "error",
          message: "No se pudo retirar el libro",
          valid: false
        });
      }
  
      bookManagerLogger.info(`El usuario con el ID ${data._id} retiró un libro llamado: ${data.books}`);
      return res.status(200).json({
        status: "success",
        message: "Se retiró el libro correctamente",
        valid: true,
        payload: {data}
      });
    })

  }

  async delete(req, res){
    const {bid} = req.params;
    const {id} = req.body;

    if(!bid)
    {
      return res.status(406).json({
        status: "error",
        message: "No se pasó el bid",
        valid: false
      });
    }
    const deleteBookCard = await booksManagerService.delete(bid, id);
    if (!deleteBookCard)
    {
      bookManagerLogger.error(`No se pudo devolver el libro con el ID ${bid}. Error: ${deleteBookCard}`);
      return res.status(502).json({
        status: "error",
        message: "No se ha podido borrar la carta del libro correctamente",
        valid: false
      });
    }
    bookManagerLogger.info(`Se devolvío el libro con el ID ${bid} correctamente`);
    return res.status(200).json({
      status: "success",
      message: "Carta del libro borrado de la base de datos correctamente",
      payload: {deleteBookCard},
      valid: true
    });
  }

  async getByUser(req, res){
    const {uid} = req.params;
    if(!uid)
    {
      return res.status(406).json({
        status: "error",
        message: "No se pasó el uid",
        valid: false
      });
    }
    const bookCard = await booksManagerService.getByUser(uid);
    if (!bookCard)
    {
      bookManagerLogger.error(`Hubo un error al encontrar el usuario con el ID ${uid}. Error: ${bookCard}`);
      return res.status(502).json({
        status: "error",
        message: "No se ha podido traer la carta del libro correctamente",
        valid: false
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Carta del libro extraido de la base de datos correctamente",
      valid: true,
      payload: {bookCard}
    });
  }
}

export const booksManagerController = new BooksManagerController();