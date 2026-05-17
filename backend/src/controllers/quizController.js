import { generateAI, parseGeminiJSON } from "../services/gemini.service.js";
import { generateQuizPrompt, weaknessAnalysisPrompt } from "../prompts/quizPrompts.js";
import { QuizResult } from "../models/QuizResult.js";

export const generateQuiz = async (req, res) => {
  try {
    const { transcript, difficulty = "Medium" } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ success: false, message: "Transcript is required" });
    }

    const prompt = generateQuizPrompt(transcript, difficulty);
    const aiResponseText = await generateAI(prompt);
    const questions = parseGeminiJSON(aiResponseText);

    return res.status(200).json({ success: true, questions });
  } catch (error) {
    console.error("Quiz Generation Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to generate quiz", error: error.message });
  }
};

export const saveResult = async (req, res) => {
  try {
    const { videoId, videoUrl, quizName, detailedResults, score, total, wrongTopics, difficulty, date } = req.body;

    const newResult = new QuizResult({
      userId: req.user ? req.user._id : null,
      videoId,
      videoUrl,
      quizName: quizName || "Video Quiz",
      detailedResults: detailedResults || [],
      score,
      total,
      wrongTopics: wrongTopics || [],
      difficulty: difficulty || "Medium",
      date: date || new Date()
    });

    await newResult.save();

    return res.status(201).json({ success: true, result: newResult });
  } catch (error) {
    console.error("Save Quiz Result Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to save quiz result", error: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    // If you add authMiddleware, filter by req.user._id. 
    // Without it, this will safely fetch global quiz history.
    const query = req.user ? { userId: req.user._id } : {};
    const history = await QuizResult.find(query).sort({ createdAt: -1 }).limit(20);
    
    return res.status(200).json({ success: true, history });
  } catch (error) {
    console.error("Get Quiz History Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to get quiz history", error: error.message });
  }
};

export const analyzeWeaknesses = async (req, res) => {
  try {
    const query = req.user ? { userId: req.user._id } : {};
    const lastQuizzes = await QuizResult.find(query).sort({ createdAt: -1 }).limit(10);

    if (!lastQuizzes || lastQuizzes.length === 0) {
      return res.status(200).json({
        success: true,
        analysis: "You haven't taken any quizzes yet. Generate one from a video to get started!",
        weakTopics: [],
        totalQuizzes: 0,
        averageScore: 0
      });
    }

    let totalScore = 0;
    let totalQuestions = 0;
    let allWrongTopics = [];
    let summaryLines = [];

    lastQuizzes.forEach((quiz, index) => {
      totalScore += quiz.score;
      totalQuestions += quiz.total;
      
      if (quiz.wrongTopics && quiz.wrongTopics.length > 0) {
        allWrongTopics.push(...quiz.wrongTopics);
        summaryLines.push(`Quiz ${index + 1}: Scored ${quiz.score}/${quiz.total}. Weak topics: ${quiz.wrongTopics.join(", ")}`);
      } else {
        summaryLines.push(`Quiz ${index + 1}: Perfect score! ${quiz.score}/${quiz.total}.`);
      }
    });

    const averageScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    const weakTopics = [...new Set(allWrongTopics)]; // Flat deduplicated array
    const summaryText = summaryLines.join("\n");

    let analysis = "";
    if (weakTopics.length > 0) {
       const prompt = weaknessAnalysisPrompt(summaryText);
       analysis = await generateAI(prompt);
    } else {
       analysis = "Great job! You've aced your recent quizzes and don't seem to have any persistent weak topics. Keep up the consistent learning!";
    }

    return res.status(200).json({
      success: true,
      analysis,
      weakTopics,
      totalQuizzes: lastQuizzes.length,
      averageScore
    });

  } catch (error) {
    console.error("Analyze Weaknesses Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to analyze weaknesses", error: error.message });
  }
};
