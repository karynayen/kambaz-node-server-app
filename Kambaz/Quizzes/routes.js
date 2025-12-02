import QuizzesDao from "./dao.js";
import QuestionsDao from "./questionsDao.js";
import AttemptsDao from "./attemptsDao.js";

export default function QuizRoutes(app, db) {
  const quizzesDao = QuizzesDao(db);
  const questionsDao = QuestionsDao(db);
  const attemptsDao = AttemptsDao(db);

  // =====================
  // QUIZ ROUTES
  // =====================

  const findQuizzesForCourse = async (req, res) => {
    const { courseId } = req.params;
    const currentUser = req.session["currentUser"];

    try {
      let quizzes;
      if (currentUser?.role === "STUDENT") {
        quizzes = await quizzesDao.findPublishedQuizzesForCourse(courseId);

        // Add latest score for each quiz
        const quizzesWithScores = await Promise.all(quizzes.map(async (quiz) => {
          const latestAttempt = await attemptsDao.findLatestAttempt(quiz._id, currentUser._id);
          return {
            ...quiz.toObject(),
            latestScore: latestAttempt?.score
          };
        }));
        res.json(quizzesWithScores);
      } else {
        quizzes = await quizzesDao.findQuizzesForCourse(courseId);
        res.json(quizzes);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const findQuizById = async (req, res) => {
    const { quizId } = req.params;
    try {
      const quiz = await quizzesDao.findQuizById(quizId);
      if (quiz) {
        res.json(quiz);
      } else {
        res.status(404).json({ message: "Quiz not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const createQuizForCourse = async (req, res) => {
    const { courseId } = req.params;
    const currentUser = req.session["currentUser"];

    if (!currentUser || currentUser.role !== "FACULTY") {
      res.status(403).json({ message: "Only faculty can create quizzes" });
      return;
    }

    try {
      const quiz = {
        ...req.body,
        course: courseId
      };
      const newQuiz = await quizzesDao.createQuiz(quiz);
      res.json(newQuiz);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const updateQuiz = async (req, res) => {
    const { quizId } = req.params;
    const quizUpdates = req.body;
    const currentUser = req.session["currentUser"];

    if (!currentUser || currentUser.role !== "FACULTY") {
      res.status(403).json({ message: "Only faculty can update quizzes" });
      return;
    }

    try {
      const updatedQuiz = await quizzesDao.updateQuiz(quizId, quizUpdates);
      if (updatedQuiz) {
        res.json(updatedQuiz);
      } else {
        res.status(404).json({ message: "Quiz not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const deleteQuiz = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];

    if (!currentUser || currentUser.role !== "FACULTY") {
      res.status(403).json({ message: "Only faculty can delete quizzes" });
      return;
    }

    try {
      await questionsDao.deleteQuestionsForQuiz(quizId);
      await attemptsDao.deleteAttemptsForQuiz(quizId);
      await quizzesDao.deleteQuiz(quizId);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const publishQuiz = async (req, res) => {
    const { quizId } = req.params;
    const { published } = req.body;
    const currentUser = req.session["currentUser"];

    if (!currentUser || currentUser.role !== "FACULTY") {
      res.status(403).json({ message: "Only faculty can publish quizzes" });
      return;
    }

    try {
      const updatedQuiz = await quizzesDao.publishQuiz(quizId, published);
      if (updatedQuiz) {
        res.json(updatedQuiz);
      } else {
        res.status(404).json({ message: "Quiz not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // =====================
  // QUESTION ROUTES
  // =====================

  const findQuestionsForQuiz = async (req, res) => {
    const { quizId } = req.params;
    try {
      const questions = await questionsDao.findQuestionsForQuiz(quizId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const createQuestionForQuiz = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];

    if (!currentUser || currentUser.role !== "FACULTY") {
      res.status(403).json({ message: "Only faculty can create questions" });
      return;
    }

    try {
      const question = {
        ...req.body,
        quiz: quizId
      };
      const newQuestion = await questionsDao.createQuestion(question);

      await quizzesDao.incrementQuestionCount(quizId);
      const totalPoints = await questionsDao.calculateQuizPoints(quizId);
      await quizzesDao.updateQuizPoints(quizId, totalPoints);

      res.json(newQuestion);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const findQuestionById = async (req, res) => {
    const { questionId } = req.params;
    try {
      const question = await questionsDao.findQuestionById(questionId);
      if (question) {
        res.json(question);
      } else {
        res.status(404).json({ message: "Question not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const updateQuestion = async (req, res) => {
    const { questionId } = req.params;
    const questionUpdates = req.body;
    const currentUser = req.session["currentUser"];

    if (!currentUser || currentUser.role !== "FACULTY") {
      res.status(403).json({ message: "Only faculty can update questions" });
      return;
    }

    try {
      const question = await questionsDao.findQuestionById(questionId);
      if (!question) {
        res.status(404).json({ message: "Question not found" });
        return;
      }

      const updatedQuestion = await questionsDao.updateQuestion(questionId, questionUpdates);

      const totalPoints = await questionsDao.calculateQuizPoints(question.quiz);
      await quizzesDao.updateQuizPoints(question.quiz, totalPoints);

      res.json(updatedQuestion);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const deleteQuestion = async (req, res) => {
    const { questionId } = req.params;
    const currentUser = req.session["currentUser"];

    if (!currentUser || currentUser.role !== "FACULTY") {
      res.status(403).json({ message: "Only faculty can delete questions" });
      return;
    }

    try {
      const question = await questionsDao.findQuestionById(questionId);
      if (!question) {
        res.status(404).json({ message: "Question not found" });
        return;
      }

      await questionsDao.deleteQuestion(questionId);

      await quizzesDao.decrementQuestionCount(question.quiz);
      const totalPoints = await questionsDao.calculateQuizPoints(question.quiz);
      await quizzesDao.updateQuizPoints(question.quiz, totalPoints);

      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // =====================
  // ATTEMPT ROUTES
  // =====================

  const startQuizAttempt = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];

    if (!currentUser) {
      res.status(401).json({ message: "Not logged in" });
      return;
    }

    try {
      const quiz = await quizzesDao.findQuizById(quizId);
      if (!quiz) {
        res.status(404).json({ message: "Quiz not found" });
        return;
      }

      const { canTake, reason, attemptNumber } = await attemptsDao.canTakeQuiz(
        quizId,
        currentUser._id,
        quiz
      );

      if (!canTake) {
        res.status(403).json({ message: reason });
        return;
      }

      const attempt = {
        quiz: quizId,
        student: currentUser._id,
        attemptNumber
      };
      const newAttempt = await attemptsDao.createAttempt(attempt);
      res.json(newAttempt);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const findAttemptsForQuiz = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];

    if (!currentUser) {
      res.status(401).json({ message: "Not logged in" });
      return;
    }

    try {
      const attempts = await attemptsDao.findAttemptsForQuiz(quizId, currentUser._id);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const findAttemptById = async (req, res) => {
    const { attemptId } = req.params;
    try {
      const attempt = await attemptsDao.findAttemptById(attemptId);
      if (attempt) {
        res.json(attempt);
      } else {
        res.status(404).json({ message: "Attempt not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const updateAttempt = async (req, res) => {
    const { attemptId } = req.params;
    const attemptUpdates = req.body;
    try {
      const updatedAttempt = await attemptsDao.updateAttempt(attemptId, attemptUpdates);
      if (updatedAttempt) {
        res.json(updatedAttempt);
      } else {
        res.status(404).json({ message: "Attempt not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const submitAttempt = async (req, res) => {
    const { attemptId } = req.params;
    const { answers } = req.body;

    try {
      const attempt = await attemptsDao.findAttemptById(attemptId);
      if (!attempt) {
        res.status(404).json({ message: "Attempt not found" });
        return;
      }

      if (attempt.submittedAt) {
        res.status(400).json({ message: "Attempt already submitted" });
        return;
      }

      const questions = await questionsDao.findQuestionsForQuiz(attempt.quiz);

      let score = 0;
      const scoredAnswers = answers.map((answer) => {
        const question = questions.find((q) => q._id === answer.questionId);
        if (!question) {
          return { question: answer.questionId, answer: answer.answer, isCorrect: false };
        }

        let isCorrect = false;

        if (question.questionType === "Multiple Choice") {
          const selectedChoice = question.choices[answer.choiceIndex];
          isCorrect = selectedChoice?.isCorrect || false;
        } else if (question.questionType === "True/False") {
          isCorrect = question.correctAnswer === answer.answer;
        } else if (question.questionType === "Fill in the Blank") {
          const studentAnswer = (answer.answer || "").toLowerCase().trim();
          isCorrect = question.correctAnswers.some(
            (ca) => ca.toLowerCase().trim() === studentAnswer
          );
        }

        if (isCorrect) {
          score += question.points || 0;
        }

        return {
          question: answer.questionId,
          answer: answer.choiceIndex !== undefined ? answer.choiceIndex : answer.answer,
          isCorrect
        };
      });

      const submittedAttempt = await attemptsDao.submitAttempt(attemptId, scoredAnswers, score);
      res.json(submittedAttempt);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // =====================
  // REGISTER ROUTES
  // =====================

  // Quiz routes
  app.post("/api/courses/:courseId/quizzes", createQuizForCourse);
  app.get("/api/courses/:courseId/quizzes", findQuizzesForCourse);
  app.get("/api/quizzes/:quizId", findQuizById);
  app.put("/api/quizzes/:quizId", updateQuiz);
  app.delete("/api/quizzes/:quizId", deleteQuiz);
  app.put("/api/quizzes/:quizId/publish", publishQuiz);

  // Question routes
  app.post("/api/quizzes/:quizId/questions", createQuestionForQuiz);
  app.get("/api/quizzes/:quizId/questions", findQuestionsForQuiz);
  app.get("/api/questions/:questionId", findQuestionById);
  app.put("/api/questions/:questionId", updateQuestion);
  app.delete("/api/questions/:questionId", deleteQuestion);

  // Attempt routes
  app.post("/api/quizzes/:quizId/attempts", startQuizAttempt);
  app.get("/api/quizzes/:quizId/attempts", findAttemptsForQuiz);
  app.get("/api/attempts/:attemptId", findAttemptById);
  app.put("/api/attempts/:attemptId", updateAttempt);
  app.post("/api/attempts/:attemptId/submit", submitAttempt);
}

