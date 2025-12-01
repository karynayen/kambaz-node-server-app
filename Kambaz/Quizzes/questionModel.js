import mongoose from "mongoose";
import schema from "./questionSchema.js";
const model = mongoose.model("QuestionModel", schema);
export default model;

