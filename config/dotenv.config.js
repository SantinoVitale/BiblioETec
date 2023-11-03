import dotenv from "dotenv";

dotenv.config();


export default{
  port: process.env.PORT,
  mongourl: process.env.MONGO_URL,
  mongoName: process.env.MONGO_USER,
  mongoPass: process.env.MONGO_PASS,
  secretJwt: process.env.JWT_SECRET
}