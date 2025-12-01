import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

export default function QuizzesDao(db) {
  function findQuizzesForCourse(courseId) {
    return model.find({ course: courseId }).sort({ availableDate: 1 });
  }

  function findPublishedQuizzesForCourse(courseId) {
    return model.find({ course: courseId, published: true }).sort({ availableDate: 1 });
  }

  function findQuizById(quizId) {
    return model.findById(quizId);
  }

  function createQuiz(quiz) {
    const newQuiz = {
      ...quiz,
      _id: uuidv4(),
      title: quiz.title || "New Quiz",
      published: false,
      questionCount: 0
    };
    return model.create(newQuiz);
  }

  function updateQuiz(quizId, quizUpdates) {
    return model.findByIdAndUpdate(quizId, quizUpdates, { new: true });
  }

  function deleteQuiz(quizId) {
    return model.findByIdAndDelete(quizId);
  }

  function publishQuiz(quizId, published) {
    return model.findByIdAndUpdate(quizId, { published }, { new: true });
  }

  function incrementQuestionCount(quizId) {
    return model.findByIdAndUpdate(quizId, { $inc: { questionCount: 1 } }, { new: true });
  }

  function decrementQuestionCount(quizId) {
    return model.findByIdAndUpdate(quizId, { $inc: { questionCount: -1 } }, { new: true });
  }

  function updateQuizPoints(quizId, points) {
    return model.findByIdAndUpdate(quizId, { points }, { new: true });
  }

  return {
    findQuizzesForCourse,
    findPublishedQuizzesForCourse,
    findQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    publishQuiz,
    incrementQuestionCount,
    decrementQuestionCount,
    updateQuizPoints
  };
}

