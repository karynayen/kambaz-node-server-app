import { v4 as uuidv4 } from "uuid";
import model from "./attemptsModel.js";

export default function AttemptsDao(db) {
  function createAttempt(attempt) {
    const newAttempt = {
      ...attempt,
      _id: uuidv4(),
      startedAt: new Date()
    };
    return model.create(newAttempt);
  }

  function findAttemptsForQuiz(quizId, studentId) {
    return model.find({ quiz: quizId, student: studentId }).sort({ startedAt: -1 });
  }

  function findLatestAttempt(quizId, studentId) {
    return model.findOne({ quiz: quizId, student: studentId }).sort({ startedAt: -1 });
  }

  function findAttemptById(attemptId) {
    return model.findById(attemptId);
  }

  function updateAttempt(attemptId, attemptUpdates) {
    return model.findByIdAndUpdate(attemptId, attemptUpdates, { new: true });
  }

  function submitAttempt(attemptId, answers, score) {
    return model.findByIdAndUpdate(
      attemptId,
      {
        submittedAt: new Date(),
        answers,
        score
      },
      { new: true }
    );
  }

  async function countSubmittedAttempts(quizId, studentId) {
    return model.countDocuments({
      quiz: quizId,
      student: studentId,
      submittedAt: { $exists: true, $ne: null }
    });
  }

  async function canTakeQuiz(quizId, studentId, quiz) {
    if (!quiz.published) {
      return { canTake: false, reason: "Quiz is not published" };
    }

    const now = new Date();
    if (quiz.availableDate && now < new Date(quiz.availableDate)) {
      return { canTake: false, reason: "Quiz is not available yet" };
    }
    if (quiz.availableUntilDate && now > new Date(quiz.availableUntilDate)) {
      return { canTake: false, reason: "Quiz is no longer available" };
    }

    const submittedCount = await countSubmittedAttempts(quizId, studentId);

    if (!quiz.multipleAttempts && submittedCount > 0) {
      return { canTake: false, reason: "You have already taken this quiz" };
    }

    if (quiz.multipleAttempts && submittedCount >= quiz.attemptsAllowed) {
      return { canTake: false, reason: "You have used all your attempts" };
    }

    return { canTake: true, attemptNumber: submittedCount + 1 };
  }

  function deleteAttemptsForQuiz(quizId) {
    return model.deleteMany({ quiz: quizId });
  }

  return {
    createAttempt,
    findAttemptsForQuiz,
    findLatestAttempt,
    findAttemptById,
    updateAttempt,
    submitAttempt,
    countSubmittedAttempts,
    canTakeQuiz,
    deleteAttemptsForQuiz
  };
}

