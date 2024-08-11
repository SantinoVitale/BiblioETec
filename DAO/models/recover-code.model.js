import { Schema, model } from "mongoose";

export const RecoverCodesMongoose = model("recover-codes", new Schema({
  email: {type: String, required: true, max: 100},
  code: {type: String, required: true},
  expire: {type: Number, required: true}
})
);