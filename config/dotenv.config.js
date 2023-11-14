import dotenv from "dotenv";

dotenv.config();

const mode = process.argv[3];

dotenv.config({
  path:mode=== "DEVELOPMENT"? "./.env.development.local" : "./.env.production.local"
});

export default{
  port: process.env.PORT,
  mongourl: process.env.MONGO_URL,
  mongoName: process.env.MONGO_USER,
  mongoPass: process.env.MONGO_PASS,
  secretJwt: process.env.JWT_SECRET,
  googleUser: process.env.GOOGLE_USER,
  googlePass: process.env.GOOGLE_PASS
}