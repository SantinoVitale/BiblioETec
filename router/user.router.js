import express from "express";
import { userController } from "../controller/user.controller.js";

export const userRouter = express.Router();

userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);
userRouter.get("/getUser", userController.getUser);
userRouter.get("/logout", userController.logout);
userRouter.post("/notify", userController.notifyUser);
userRouter.post("/recoverPass", userController.recoverPass);
userRouter.post("/recoverPass/getMail", userController.getMail);
userRouter.post("/recoverPass/changePass", userController.changePass);
userRouter.get("/:id/verify/:token", userController.verifyEmail)