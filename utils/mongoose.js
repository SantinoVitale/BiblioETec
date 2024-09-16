import mongoose from "mongoose";
import config from "../config/dotenv.config.js";
import { databaseLogger } from './log4js.js';

const mongoURL = config.mongourl;

export async function connectMongo() {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoURL);
    databaseLogger.debug("¡Conectado!");
  } catch (error) {
    databaseLogger.error(error);
  }
}