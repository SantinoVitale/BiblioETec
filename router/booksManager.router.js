import express from "express";
import { booksManagerController } from "../controller/booksManager.controller.js";

export const booksManagerRouter = express.Router();

booksManagerRouter.get("/", booksManagerController.get);
booksManagerRouter.get("/:bid", booksManagerController.getById);
booksManagerRouter.post("/", booksManagerController.post);
booksManagerRouter.delete("/:bid", booksManagerController.delete);
booksManagerRouter.get("/getByUser/:uid", booksManagerController.getByUser);