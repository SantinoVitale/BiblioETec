import { userModel } from "../DAO/models/user.model.js";
import { userLogger } from "../utils/log4js.js";

class UserService{
    async get(){
        const get = await userModel.find();
        return get;
    }

    async getById(uid){
        try {
            const user = await userModel.findOne({_id: uid}).populate('booksCard');
            return user;
        } catch (error) {
            console.error("Error en getById:", error);
            throw error; // Puedes manejar el error según tus necesidades
        }
    }

    async put(uid, data){
        const user = await userService.getById(uid);
        if(!user){
            userLogger.error("Hubo un error a la hora de traer el usuario con el ID: ", uid);
            return false
        }
        
        const put = await userModel.findByIdAndUpdate(uid, {booksCard: data})
        return put;
    }

    async postBook(uid, bmid){
        const user = await userService.getById(uid);
        if(!user){
            userLogger.error("Hubo un error a la hora de traer el usuario con el ID: ", uid);
            return false
        }
        user.booksCard.push(bmid)
        const put = await userModel.findByIdAndUpdate(uid, user)
        return put;
    }
}

export const userService = new UserService();