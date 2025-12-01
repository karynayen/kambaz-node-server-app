import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  _id: String,
  title: String,
  description: String,
  course: { type: String, ref: "CourseModel" },
  quizType: {
    type: String,
    enum: ["Graded Quiz", "Practice Quiz", "Graded Survey", "Ungraded Survey"],
    default: "Graded Quiz"
  },
  points: { type: Number, default: 0 },
  assignmentGroup: {
    type: String,
    enum: ["Quizzes", "Exams", "Assignments", "Project"],
    default: "Quizzes"
  },
  shuffleAnswers: { type: Boolean, default: true },
  timeLimit: { type: Number, default: 20 },
  multipleAttempts: { type: Boolean, default: false },
  attemptsAllowed: { type: Number, default: 1 },
  showCorrectAnswers: {
    type: String,
    enum: ["Never", "After Due Date", "After Submission", "Always"],
    default: "Never"
  },
  accessCode: { type: String, default: "" },
  oneQuestionAtATime: { type: Boolean, default: true },
  webcamRequired: { type: Boolean, default: false },
  lockQuestionsAfterAnswering: { type: Boolean, default: false },
  dueDate: Date,
  availableDate: Date,
  availableUntilDate: Date,
  published: { type: Boolean, default: false },
  questionCount: { type: Number, default: 0 }
}, { collection: "quizzes" });

export default quizSchema;

