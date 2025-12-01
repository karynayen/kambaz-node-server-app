import mongoose from "mongoose";
import schema from "./attemptsSchema.js";
const model = mongoose.model("AttemptModel", schema);
export default model;

