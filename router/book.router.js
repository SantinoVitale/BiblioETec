import express from "express";
import { bookController } from "../controller/book.controller.js";

export const bookRouter = express.Router();

bookRouter.get("/", bookController.get);
bookRouter.get("/:bid", bookController.getById);
bookRouter.post("/", bookController.post);
bookRouter.put("/:bid", bookController.put);
bookRouter.delete("/:bid", bookController.delete);
// bookRouter.post("/many", bookController.postMany) //! Rehacer en algun momento para que reciba archivos