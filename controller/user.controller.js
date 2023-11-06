import { userModel } from "../DAO/models/user.model.js";
import { userLogger } from "../utils/log4js.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import jwt from "jsonwebtoken";
import config from "../config/dotenv.config.js";

class UserController{
  async register(req, res){
    const {firstName, lastName, course, phone, password, email} = req.body;
    if(!firstName || !lastName || !course || !parseInt(phone) || !password || !email)
    {
      userLogger.error("Missing values")
      return res.status(200).json({
        status: "error",
        message: "missing values",
        valid: false
      })
    }

    const existEmail = await userModel.findOne({email: email})
    if(existEmail)
    {
      userLogger.error("The email is already register in a account");
      return res.status(400).json({
        status: "error",
        message: "The email is already register in a account",
        valid: false
      })
    }
    const hashedPassword = await hashPassword(password)
    const newUser = await userModel.create({
      firstName, lastName, course, phone, password: hashedPassword, email
    })
    if(!newUser)
    {
      userLogger.error("Something went wrong");
      return res.status(400).json({
        status: "error",
        message: "something went wrong",
        valid: false
      })
    }

    userLogger.info(`User created with ID: ${newUser._id}`);
    return res.status(200).json({
      status: "success",
      message: "User created",
      payload: newUser,
      valid: true
    })
  }

  async login(req, res){
    const {email, password} = req.body;
    const user = await userModel.findOne({email})
    if(!user)
    {
      userLogger.error(`The user with the email: ${email} don´t exist`)
      return res.status(400).json({
        status: "error",
        message: `The user with the email: ${email} don´t exist`,
        valid: false
      })
    }

    const match = await comparePassword(password, user.password)
    if(!match)
    {
      userLogger.error(`Wrong password, please try again`)
      return res.status(400).json({
        status: "error",
        message: `Wrong password, please try again`,
        valid: false
      })
    }
    jwt.sign({email: user.email, id: user._id, name: user.firstName}, config.secretJwt, {expiresIn:"1h"}, (err, token) => {
      if(err){
        userLogger.error(err)
        throw err
      }
      userLogger.info(`User with the ID ${user._id} Logged correctly`);
      return res.status(200).cookie("token", token).json({
        status: "success",
        message: "User Logged",
        valid: true,
        payload: user
      })
    })
  }

  async getUser(req, res){
    const { token } = req.cookies
    if(token){
      jwt.verify(token, config.secretJwt, {}, (err, user) => {
        if(err){
          userLogger.error(err)
          throw err
        }
        userLogger.info("Usuario already logged, please continue")
        return res.status(200).json({
          status:"success",
          message: "Usuario already logged, please continue",
          payload: user,
          valid:true
        })
      })
    } else {
      userLogger.warn("User not logged, please log in");
      return res.json({
        status: "error",
        message: "User not logged, please log in",
        valid: false
      })
    }
  }

  async logout(req, res){
    const { token } = req.cookies
    
    if(!token)
    {
      userLogger.error("User try to logout without a login token")
      return res.status(400).json({
        status: "error",
        message: "User try to logout without a login token",
        valid: false
      })
    }
    userLogger.info("User token deleted succefully")
    return res.status(200).cookie("token", "", {maxAge: 1}).json({
      status:"success",
      message: "User token deleted succefully",
      valid:true
    })
  }
}

export const userController = new UserController()