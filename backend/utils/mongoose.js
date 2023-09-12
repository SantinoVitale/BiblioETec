import mongoose from "mongoose";
import config from "../config/dotenv.config.js";

const mongoURL = config.mongourl;

export async function connectMongo() {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoURL);
    console.log("¡Conectado pa!");
  } catch (error) {
    console.log(error);
  }
}