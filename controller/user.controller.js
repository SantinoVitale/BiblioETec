import { userModel } from "../DAO/models/user.model.js";
import { userLogger } from "../utils/log4js.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import jwt from "jsonwebtoken";
import config from "../config/dotenv.config.js";
import { sendMailTransport } from "../utils/mailTransport.js";
import crypto, { createHash } from "crypto";
import { RecoverCodesMongoose } from "../DAO/models/recover-code.model.js";
import { compare } from "bcrypt";

class UserController {
  async register(req, res) {
    const { firstName, lastName, course, phone, password, email } = req.body;
    if (
      !firstName ||
      !lastName ||
      !course ||
      !parseInt(phone) ||
      !password ||
      !email
    ) {
      userLogger.error("Missing values");
      return res.status(200).json({
        status: "error",
        message: "missing values",
        valid: false,
      });
    }

    const existEmail = await userModel.findOne({ email: email });
    if (existEmail) {
      userLogger.error("The email is already register in a account");
      return res.status(400).json({
        status: "error",
        message: "The email is already register in a account",
        valid: false,
      });
    }
    const hashedPassword = await hashPassword(password);
    const newUser = await userModel.create({
      firstName,
      lastName,
      course,
      phone,
      password: hashedPassword,
      email,
    });
    if (!newUser) {
      userLogger.error("Something went wrong");
      return res.status(400).json({
        status: "error",
        message: "something went wrong",
        valid: false,
      });
    }

    userLogger.info(`User created with ID: ${newUser._id}`);
    return res.status(200).json({
      status: "success",
      message: "User created",
      payload: newUser,
      valid: true,
    });
  }

  async login(req, res) {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      userLogger.error(`The user with the email: ${email} don´t exist`);
      return res.status(400).json({
        status: "error",
        message: `The user with the email: ${email} don´t exist`,
        valid: false,
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      userLogger.error(`Wrong password, please try again`);
      return res.status(400).json({
        status: "error",
        message: `Wrong password, please try again`,
        valid: false,
      });
    }
    jwt.sign(
      {
        email: user.email,
        id: user._id,
        name: user.firstName,
        role: user.role,
      },
      config.secretJwt,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          userLogger.error(err);
          throw err;
        }
        userLogger.info(`User with the ID ${user._id} Logged correctly`);
        return res.status(200).cookie("token", token).json({
          status: "success",
          message: "User Logged",
          valid: true,
          payload: user,
        });
      }
    );
  }

  async getUser(req, res) {
    const { token } = req.cookies;
    if (token) {
      jwt.verify(token, config.secretJwt, {}, (err, user) => {
        if (err) {
          userLogger.error(err);
          throw err;
        }
        userLogger.info("Usuario already logged, please continue");
        return res.status(200).json({
          status: "success",
          message: "Usuario already logged, please continue",
          payload: user,
          valid: true,
        });
      });
    } else {
      userLogger.warn("User not logged, please log in");
      return res.json({
        status: "error",
        message: "User not logged, please log in",
        valid: false,
      });
    }
  }

  async logout(req, res) {
    const { token } = req.cookies;

    if (!token) {
      userLogger.error("User try to logout without a login token");
      return res.status(400).json({
        status: "error",
        message: "User try to logout without a login token",
        valid: false,
      });
    }
    userLogger.info("User token deleted succefully");
    return res.status(200).cookie("token", "", { maxAge: 1 }).json({
      status: "success",
      message: "User token deleted succefully",
      valid: true,
    });
  }

  async notifyUser(req, res) {
    const { user } = req.body;
    if (!user) {
      userLogger.error(`Missing user`);
      return res.json({
        status: "error",
        message: "Missing user",
        valid: false,
      });
    }

    await sendMailTransport
      .sendMail({
        from: config.googleUser,
        to: user.email,
        subject: "AVISO ENTREGA DE LIBRO EXPIRADO",
        text: "Porfavor, entregue su libro o renueve el tiempo",
      })
      .then((response) => {
        userLogger.info(`email send succesfully to ${user.email}`);
        return res.status(200).json({
          status: "success",
          message: `email send succesfully to ${user.email}`,
          valid: true,
          payload: { response },
        });
      })
      .catch((err) => {
        userLogger.error(
          `An error ocurred when tried to send Email. ERROR: ${err}`
        );
        return res.status(400).json({
          status: "error",
          message: `An error ocurred when tried to send Email. ERROR: ${err}`,
          valid: false,
        });
      });
  }

  async recoverPass(req, res) {
    const code = crypto.randomBytes(32).toString("hex");
    const { email } = req.body;
    const createdRecoverCodes = await RecoverCodesMongoose.create({
      email,
      code,
      expire: Date.now() + 10 * 60 * 1000,
    });
    userLogger.debug(createdRecoverCodes);
    try{
      const result = await sendMailTransport.sendMail({
        from: config.googleUser,
        to: email,
        subject: "Recuperar tu contraseña",
        html: `
            <div>
                <a href="${config.apiUrl}/recover-pass?code=${code}&email=${email}">Codigo para recuperar tu contraseña: </a>${code}
            </div>
        `,
      });
      userLogger.debug(result);
      return res.status(200).json({
        status: "success",
        message: `email send succesfully to ${email}`,
        valid: true,
        payload: { result },
      })
    }
    catch(err){
      return res.status(400).json({
        status: "error",
        message: `An error ocurred when tried to send Email. ERROR: ${err}`,
        valid: false,
      });
    }
  }

  async getMail(req, res) {
    const { code, email } = req.body;
    console.log(req.body);
    
    const foundRecoverCode = await RecoverCodesMongoose.findOne({
      email,
      code,
    });
    userLogger.debug(foundRecoverCode)
    
    if (Date.now() < foundRecoverCode.expire) {
      return res.status(200).json({
        status: "success",
        message: ``,
        valid: true,
        payload: "",
      })
    } else {
      userLogger.error("El codigo de recuperacion está vencido");
      return res
        .status(400)
        .render("error", {
          status: "error",
          title: "fecha expirada",
          cause:
            "Se expiró el tiempo para recuperar su contraseña, porfavor, genere otro código",
          message: "Expirado",
        });
    }
  }

  async changePass(req, res) {
    const { password, email, code } = req.body;
    const foundRecoverCode = await RecoverCodesMongoose.findOne({
      email,
      code,
    });
    userLogger.debug(foundRecoverCode)
    if (Date.now() < foundRecoverCode.expire) {
      const checkUser = await userModel.findOne({ email: email });
      
      if (await compare(password, checkUser.password)) {
        userLogger.error(
          "La contraseña nueva es la misma que la anterior, porfavor cambiela"
        );
        return res
          .status(400)
          .render("error", {
            status: "error",
            title: "Misma contraseña",
            cause:
              "La contraseña es la misma que la anterior, porfavor, cambiela",
            message: "",
          });
      } else {
        const updatePassword = await userModel.updateOne(
          { email: email },
          { password: await hashPassword(password) }
        );
        userLogger.debug(updatePassword);

        return res.status(200).json({
          status: "success",
          message: ``,
          valid: true,
          payload: "",
        })
      }
    } else {
      userLogger.error("El codigo de recuperacion está vencido");
      return res
        .status(400)
        .render("error", {
          status: "error",
          title: "fecha expirada",
          cause:
            "Se expiró el tiempo para recuperar su contraseña, porfavor, genere otro código",
          message: "Expirado",
        });
    }
  }
}

export const userController = new UserController();
