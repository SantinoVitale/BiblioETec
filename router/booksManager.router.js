import express from "express";
import { booksManagerController } from "../controller/booksManager.controller.js";

const app = express();
export const booksManagerRouter = express.Router();

booksManagerRouter.get("/", booksManagerController.get);
booksManagerRouter.get("/:bid", booksManagerController.getById);
booksManagerRouter.post("/", booksManagerController.post);
booksManagerRouter.put("/:bid", booksManagerController.put);
booksManagerRouter.delete("/:bid", booksManagerController.delete);