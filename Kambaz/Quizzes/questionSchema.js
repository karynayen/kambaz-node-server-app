import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  _id: String,
  quiz: { type: String, ref: "QuizModel" },
  title: String,
  question: String,
  questionType: {
    type: String,
    enum: ["Multiple Choice", "True/False", "Fill in the Blank"],
    default: "Multiple Choice"
  },
  points: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  choices: [{
    text: String,
    isCorrect: { type: Boolean, default: false }
  }],
  correctAnswer: Boolean,
  correctAnswers: [String]
}, { collection: "questions" });

export default questionSchema;

