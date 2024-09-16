import express from "express";
import config from "./config/dotenv.config.js";
import { connectMongo } from "./utils/mongoose.js";
import { bookRouter } from "./router/book.router.js";
import { booksManagerRouter } from "./router/booksManager.router.js";
import cors from "cors";
import { defaultlogger } from "./utils/log4js.js";
import { userRouter } from "./router/user.router.js";
import cookieParser from "cookie-parser";


// * CONFIGURACION EXPRESS
const app = express();
app.use(cors({
  origin: "http://localhost:3000", // Reemplaza con tu origen
  credentials: true,
}))
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const port = config.port;

// * CONEXIÓN A MONGO
connectMongo();

// * ROUTERS
app.use("/api/books", bookRouter);
app.use("/api/booksManager", booksManagerRouter);
app.use("/api/users", userRouter);


app.listen(port, () => {
  defaultlogger.debug("Server escuchando en el puerto ", port);
})
