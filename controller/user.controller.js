import { userModel } from "../DAO/models/user.model.js";
import { userLogger } from "../utils/log4js.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import jwt from "jsonwebtoken";
import config from "../config/dotenv.config.js";
import { sendMailTransport } from "../utils/mailTransport.js";
import crypto, { createHash } from "crypto";
import { RecoverCodesMongoose } from "../DAO/models/recover-code.model.js";
import { compare } from "bcrypt";
import { emailTokenModel } from "../DAO/models/email-token.model.js";

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

    const emailToken = await emailTokenModel.create({
      userId: newUser._id,
      token: crypto.randomBytes(32).toString("hex")
    })
    
    const mail = await sendMailTransport.sendMail({
      from: config.googleUser,
      to: newUser.email,
      subject: "Verificacion de Mail",
      html: `
          <div>
              <a href="${config.apiUrl}/users/${newUser._id}/verify/${emailToken.token}">Click aquí para verificar la dirección de correo electrónico</a>
          </div>
      `,
    });
    return res.status(200).json({
      status: "success",
      message: "Se envió un correo de verificación de Email",
      payload: mail,
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
        message: `El ususuario con el Email: ${email} no existe`,
        valid: false,
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      userLogger.error(`Wrong password, please try again`);
      return res.status(400).json({
        status: "error",
        message: `Contraseña incorrecta, por favor intente de nuevo`,
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
        userLogger.info(`El Usuario con el ID: ${user._id} Inició sesión correctamente`);
        return res.status(200).cookie("token", token).json({
          status: "success",
          message: "Usuario inició sesión",
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
        userLogger.info("Sesión todavia abierta, puede continuar");
        return res.status(200).json({
          status: "success",
          message: "Sesión todavia abierta, puede continuar",
          payload: user,
          valid: true,
        });
      });
    } else {
      userLogger.warn("El Usuario no ha iniciado sesión, por favor inicie sesión");
      return res.json({
        status: "error",
        message: "El Usuario no ha iniciado sesión, por favor inicie sesión",
        valid: false,
      });
    }
  }

  async logout(req, res) {
    const { token } = req.cookies;

    if (!token) {
      userLogger.error("El Usuario intentó cerrar sesión sin un Token de sesión");
      return res.status(400).json({
        status: "error",
        message: "El Usuario intentó cerrar sesión sin un Token de sesión",
        valid: false,
      });
    }
    userLogger.info("El Token del Usuario fue elminado con éxito");
    return res.status(200).cookie("token", "", { maxAge: 1 }).json({
      status: "success",
      message: "El Token del Usuario fue elminado con éxito",
      valid: true,
    });
  }

  async notifyUser(req, res) {
    const { user } = req.body;
    if (!user) {
      userLogger.error(`El Usuario no existe`);
      return res.json({
        status: "error",
        message: "El Usuario no existe",
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
        userLogger.info(`Se ha enviado un Email a: ${user.email} correctamente`);
        return res.status(200).json({
          status: "success",
          message: `Se ha enviado un Email a: ${user.email} correctamente`,
          valid: true,
          payload: { response },
        });
      })
      .catch((err) => {
        userLogger.error(
          `Ha ocurrido un error al intentar mandar un Email a ${user.email}. ERROR: ${err}`
        );
        return res.status(500).json({
          status: "error",
          message: `Ha ocurrido un error al intentar mandar un Email a ${user.email}. ERROR: ${err}`,
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
                <a href="${config.clientUrl}/recover-pass?code=${code}&email=${email}">Codigo para recuperar tu contraseña: </a>${code}
            </div>
        `,
      });
      userLogger.debug(result);
      return res.status(200).json({
        status: "success",
        message: `Email mandado a: ${email} con éxito`,
        valid: true,
        payload: { result },
      })
    }
    catch(err){
      return res.status(500).json({
        status: "error",
        message: `Ha ocurrido un error al intentar mandar un Email a ${user.email}: ${err}`,
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
        message: `El Usuario puede recuperar su contraseña`,
        valid: true,
      })
    } else {
      userLogger.error("El codigo de recuperacion está vencido");
      return res
        .status(400)
        .render("error", {
          status: "error",
          title: "fecha expirada",
          message:
            "Se expiró el tiempo para recuperar su contraseña, porfavor, genere otro código",
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
            message:
              "La contraseña es la misma que la anterior, porfavor, cambiela"
          });
      } else {
        const updatePassword = await userModel.updateOne(
          { email: email },
          { password: await hashPassword(password) }
        );
        userLogger.debug(updatePassword);

        return res.status(200).json({
          status: "success",
          message: `Se cambió la contraseña del usuario ${email} con éxito`,
          valid: true
        })
      }
    } else {
      userLogger.error("El codigo de recuperacion está vencido");
      return res
        .status(400)
        .render("error", {
          status: "error",
          title: "fecha expirada",
          message:
            "Se expiró el tiempo para recuperar su contraseña, porfavor, genere otro código"
        });
    }
  }

  async verifyEmail(req, res) {
    try {
      const user = await userModel.findOne({_id: req.params.id})
      if(!user) return res.status(400).send({message: "Error al encontrar el Email"})

      const token = await emailTokenModel.findOne({
        userId: user._id,
        token: req.params.token
      })

      if(!token) return res.status(400).send({message: "Error al encontrar el Token"})

      await userModel.updateOne({_id: user._id, verified: true})
      
      
      userLogger.debug(`Usuario con id: ${user._id} verificado`)

      setTimeout(async () => {
        await token.deleteOne({
          userId: user._id,
          token: req.params.token
        })
      }, 1000)

      return res.status(200).json({
        status: "success",
        message: "Email verificado con éxito",
        valid: true
      })

      
    } catch (error){
      userLogger.error(`Hubo un error a la hora de verificar el usuario con el id: ${req.params.id}`)
      return res.status(500).send({message: "Internal Server Error"})
    }
  }
}

export const userController = new UserController();
