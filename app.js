import express from "express";
import config from "./config/dotenv.config.js";
import { connectMongo } from "./utils/mongoose.js";
import { bookRouter } from "./router/book.router.js";
import { booksManagerRouter } from "./router/booksManager.router.js";

// * CONFIGURACION EXPRESS
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = config.port

// * CONEXIÓN A MONGO
connectMongo();

// * ROUTERS
app.use("/api/books", bookRouter);
app.use("/api/booksManager", booksManagerRouter);


app.listen(port, () => {
  console.log("Server escuchando en el puerto ", port)
})
