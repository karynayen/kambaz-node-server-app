import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema({
  _id: String,
  quiz: { type: String, ref: "QuizModel" },
  student: { type: String, ref: "UserModel" },
  startedAt: Date,
  submittedAt: Date,
  score: Number,
  answers: [{
    question: { type: String, ref: "QuestionModel" },
    answer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean
  }],
  attemptNumber: { type: Number, default: 1 }
}, { collection: "quizAttempts" });

attemptSchema.index({ quiz: 1, student: 1 });

export default attemptSchema;

