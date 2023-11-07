import { userModel } from "../DAO/models/user.model.js";
import { userLogger } from "../utils/log4js.js";

class UserService{
    async get(){
        const get = await userModel.find();
        return get;
    }

    async getById(uid){
        const getById = await userModel.findById(uid);
        return getById;
    }

    async put(uid, data){
        const user = await userService.getById(uid);
        if(!user){
            userLogger.error("Hubo un error a la hora de traer el usuario con el ID: ", uid);
            return false
        }
        
        user.books.push(data);
        const put = await userModel.findByIdAndUpdate(uid, user)
        return put;
    }
}

export const userService = new UserService();