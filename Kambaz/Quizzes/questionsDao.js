import { v4 as uuidv4 } from "uuid";
import model from "./questionModel.js";

export default function QuestionsDao(db) {
  function findQuestionsForQuiz(quizId) {
    return model.find({ quiz: quizId }).sort({ order: 1 });
  }

  function findQuestionById(questionId) {
    return model.findById(questionId);
  }

  async function createQuestion(question) {
    const existingQuestions = await model.find({ quiz: question.quiz });
    const newQuestion = {
      ...question,
      _id: uuidv4(),
      order: existingQuestions.length
    };
    return model.create(newQuestion);
  }

  function updateQuestion(questionId, questionUpdates) {
    return model.findByIdAndUpdate(questionId, questionUpdates, { new: true });
  }

  function deleteQuestion(questionId) {
    return model.findByIdAndDelete(questionId);
  }

  function deleteQuestionsForQuiz(quizId) {
    return model.deleteMany({ quiz: quizId });
  }

  async function calculateQuizPoints(quizId) {
    const questions = await model.find({ quiz: quizId });
    return questions.reduce((sum, q) => sum + (q.points || 0), 0);
  }

  return {
    findQuestionsForQuiz,
    findQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    deleteQuestionsForQuiz,
    calculateQuizPoints
  };
}

