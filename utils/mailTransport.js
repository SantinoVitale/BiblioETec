import nodemailer from "nodemailer";
import config from "../config/dotenv.config.js";

export const sendMailTransport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: config.googleUser,
        pass: config.googlePass
    }
})