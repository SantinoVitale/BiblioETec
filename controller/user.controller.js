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
import { userService } from "../service/user.service.js";
import { booksManagerService } from "../service/booksManager.service.js";
import { booksManagerModel } from "../DAO/models/booksManager.model.js";

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
      return res.status(406).json({
        status: "error",
        message: "missing values",
        valid: false,
      });
    }

    const existEmail = await userModel.findOne({ email: email });
    if (existEmail) {
      userLogger.warn(`Usuario con el mail: ${email}, intentó registrarse pero ya existe una cuenta asociada`);
      return res.status(412).json({
        status: "error",
        message: "Ya existe un usuario con este mail",
        valid: false,
      });
    }

    const role = email.includes("alumno") ? "alumno" : "profesor";
    
    const hashedPassword = await hashPassword(password);
    const newUser = await userModel.create({
      firstName,
      lastName,
      course,
      phone,
      password: hashedPassword,
      email,
      role,
      verificationExpires: Date.now() + 3600000 // 1 hora
    });
    if (!newUser) {
      userLogger.error(newUser);
      return res.status(502).json({
        status: "error",
        message: "Ocurrió algo al crear el usuario",
        valid: false,
      });
    }

    userLogger.info(`Se creó un usuario con el ID: ${newUser._id}`);

    const emailToken = await emailTokenModel.create({
      userId: newUser._id,
      token: crypto.randomBytes(32).toString("hex"),
      expiry: new Date(Date.now() + 3600000) // 1 hora 
    });
    
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
      message: `Se envió un correo a ${newUser.email} de verificación de Email`,
      payload: mail,
      valid: true,
    });
  }

  async login(req, res) {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: `El ususuario con el Email: ${email} no existe`,
        valid: false,
      });
    }

    if(!user.verified) return res.status(401).send({message: "El Usuario no está verificado."});

    const match = await comparePassword(password, user.password);
    if (!match) {
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
        firstName: user.firstName,
        lastName: user.lastName,
        course: user.course,
        phone: user.phone,
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
        return res.status(200).json({
          status: "success",
          message: "Sesión todavia abierta, puede continuar",
          payload: user,
          valid: true,
        });
      });
    } else {
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
      return res.status(401).json({
        status: "error",
        message: "El Usuario intentó cerrar sesión sin un Token de sesión",
        valid: false,
      });
    }
    return res.status(200).cookie("token", "", { maxAge: 1 }).json({
      status: "success",
      message: "El Token del Usuario fue elminado con éxito",
      valid: true,
    });
  }

  async notifyUser(req, res) {
    const { user } = req.body;
    if (!user) {
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
        userLogger.info(`Se ha enviado un Email a: ${user.email} para notificarlo`);
        return res.status(200).json({
          status: "success",
          message: `Se ha enviado un Email a: ${user.email} para notificarlo`,
          valid: true,
          payload: { response },
        });
      })
      .catch((err) => {
        userLogger.error(`Ha ocurrido un error al intentar mandar un Email a ${user.email}. ERROR: ${err}`);
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
    await userModel.findOne({email: email})
    .then((data) => {
      if(data== null){
        return res.status(400).json({
          status: "error",
          message: "El mail no tiene una cuenta asociada"
        })
      }
      else {
        RecoverCodesMongoose.create({
          email,
          code,
          expire: Date.now() + 10 * 60 * 1000,
        })
        .then(() => {
          const result = sendMailTransport.sendMail({
            from: config.googleUser,
            to: email,
            subject: "Recuperar tu contraseña",
            html: `
                <div>
                    <a href="${config.apiUrl}/recover-pass?code=${code}&email=${email}">Codigo para recuperar tu contraseña: </a>${code}
                </div>
            `,
          });
          return res.status(200).json({
            status: "success",
            message: `Email mandado a: ${email} con éxito`,
            valid: true,
            payload: { result },
          });
        })
        .catch((err) => {
          userLogger.error(err)
          return res.status(502).json({
            status: "error",
            message: `Ha ocurrido un error al intentar mandar un Email a ${user.email}: ${err}`,
            valid: false,
          });
        })
      }
    })
    .catch((err) => {
      userLogger.error(err);
      return res.status(500).json({
        status: "error",
        message: `Hubo un error con el servidor al buscar el usuario con el mail: ${email}`,
        error: err
      })
    })
  }

  async getMail(req, res) {
    const { code, email } = req.body;
    
    const foundRecoverCode = await RecoverCodesMongoose.findOne({email, code});
    
    if (Date.now() < foundRecoverCode.expire) {
      return res.status(200).json({
        status: "success",
        message: `El Usuario puede recuperar su contraseña`,
        valid: true,
      })
    } else {
      userLogger.warn(`El codigo de recuperacion del usuario: ${email} está vencido`);
      return res
        .status(401)
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
    const foundRecoverCode = await RecoverCodesMongoose.findOne({email, code });

    if(!foundRecoverCode) return res.status(404).send({message: "El Email ingresado no coincide con el registrado"});

    if (Date.now() < foundRecoverCode.expire) {
      const checkUser = await userModel.findOne({ email: email });
      
      if (await compare(password, checkUser.password)) {
        return res
          .status(401)
          .json({
            status: "error",
            title: "Misma contraseña",
            message:
              "La contraseña es la misma que la anterior, porfavor, cambiela"
          });
      } else {
        await userModel.updateOne(
          { email: email },
          { password: await hashPassword(password) }
        );
        setTimeout(async () => {
          await foundRecoverCode.deleteOne({
            email,
            code
          });
        },1000);
        return res.status(200).json({
          status: "success",
          message: `Se cambió la contraseña del usuario ${email} con éxito`,
          valid: true
        });
      }
    } else {
      return res
        .status(401)
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
      const user = await userModel.findOne({_id: req.params.id});
      if(!user) return res.status(502).send({message: "Error al encontrar el Email"});

      const token = await emailTokenModel.findOne({
        userId: user._id,
        token: req.params.token
      });

      if(!token) return res.status(502).send({message: "Error al encontrar el Token"});
      if (token.expiry < Date.now()) { // Token expirado, borra el usuario y el token
        await userModel.findByIdAndDelete(token.userId);
        await emailTokenModel.findByIdAndDelete(token._id);
        return res.status(400).send('El token ha expirado. El usuario ha sido eliminado.');
      }

      await userModel.updateOne({_id: user._id}, {verified: true});
      userLogger.debug(`Usuario con id: ${user._id} verificado`);

      setTimeout(async () => {
        await token.deleteOne({
          userId: user._id,
          token: req.params.token
        });
      }, 1000);

      return res.status(200).json({
        status: "success",
        message: "Email verificado con éxito",
        valid: true
      });

      
    } catch (error){
      userLogger.error(`Hubo un error a la hora de verificar el usuario con el id: ${req.params.id}`);
      userLogger.error(error)
      return res.status(500).send({message: "Internal Server Error"});
    }
  }

  async getUserById (req, res) {
    const { uid } = req.params;

    if(!uid) return res.status(404).send("Usuario inexistente");

    userService.getById(uid)
    .then((data) => {
      userLogger.debug(`Se trajo el usuario con el ID: ${data._id}`);
      return res.status(200).json({
        status: "success",
        valid: true,
        payload: data
      });
    })
    .catch((err) => {
      userLogger.error(`Error al traer el usuario con el ID: ${uid}`);
      userLogger.error(err);
      return res.status(500).send("Error con el servidor para traer el usuario");
    });
  }

  async put (req, res) {
    const { uid } = req.params;

    userService.putUser(uid, req.body)
    .then((data) => {
      return res.status(200).json({
        status: "success",
        message: "Usuario actualizado con éxito",
        valid: true,
        payload: data
      });
    })
    .catch((err) => {
      userLogger.error(`Error en petición put para usuario con el ID: ${uid}`)
      userLogger.error(err)
      return res.status(500).json({
        status: "error",
        message: "Hubo un problema a la hora de actualizar el usuario",
        error: err,
        valid: false
      });
    })
  }

  async delete(req, res){
    const {uid} = req.params;
    booksManagerModel.deleteMany({owner: uid})
    .then((res) => {
      userLogger.info()
      userService.delete(uid)
      .then((data) => {
        userLogger.debug(`Se eleminó el usuario con el ID: ${data._id}`)
        return res.status(201).json({
          status: "success",
          message: "Usuario eliminado con exito",
          valid: true,
          payload: data
        });
      })
      .catch((err) => {
        userLogger.error(`Error en la petición delete del usuario con el ID: ${uid}`);
        userLogger.error(err);
        return res.status(500).json({
          status: "error",
          message: "Hubo un problema a la hora de actualizar el usuario",
          error: err,
          valid: false
        });
      });
    })
    
  }
}

export const userController = new UserController();
