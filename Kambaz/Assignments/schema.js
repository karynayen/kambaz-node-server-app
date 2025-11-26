import mongoose from "mongoose";
const assignmentSchema = new mongoose.Schema({
  _id: String,
  title: String,
  dueDate: Date,
  course: { type: String, ref: "Course" },
  description: String,
  availableFromDate: Date,
  availableUntilDate: Date,
  dueDate: Date,
  points: Number,
}, { collection: "assignments" });
export default assignmentSchema;
