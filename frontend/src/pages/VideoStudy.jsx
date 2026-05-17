import { useState } from "react";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import api from "../Api.js";

const VideoStudy = () => {
  const [urlInput, setUrlInput] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [inputError, setInputError] = useState("");
  
  const [transcriptStatus, setTranscriptStatus] = useState("default");
  const [transcriptData, setTranscriptData] = useState(null);
  const [transcriptError, setTranscriptError] = useState("");
  const [isWakingUp, setIsWakingUp] = useState(false);

  const [quizState, setQuizState] = useState("not_started");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [wrongTopics, setWrongTopics] = useState([]);
  const [quizError, setQuizError] = useState("");
  const [userAnswers, setUserAnswers] = useState([]);

  const handleLoadVideo = async () => {
    setInputError("");
    setTranscriptStatus("default");
    setTranscriptData(null);
    setTranscriptError("");
    setIsWakingUp(false);
    setQuizState("not_started");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setWrongTopics([]);
    setQuizError("");
    setUserAnswers([]);

    let extractedId = null;

    try {
      const urlObj = new URL(urlInput);
      if (urlObj.hostname.includes("youtube.com")) {
        if (urlObj.pathname === "/watch") {
          extractedId = urlObj.searchParams.get("v");
        } else if (urlObj.pathname.startsWith("/embed/")) {
          extractedId = urlObj.pathname.split("/")[2];
        }
      } else if (urlObj.hostname.includes("youtu.be")) {
        extractedId = urlObj.pathname.slice(1);
      }
    } catch (err) {}

    if (!extractedId) {
      setInputError("Please enter a valid YouTube URL");
      return;
    }

    setVideoId(extractedId);
    setVideoUrl(urlInput);
    setTranscriptStatus("loading");

    const wakeUpTimer = setTimeout(() => setIsWakingUp(true), 5000);

    try {
      const res = await api.post("/transcript", { url: urlInput });
      clearTimeout(wakeUpTimer);
      setIsWakingUp(false);
      const transcriptText = res.data.transcript || "";
      const wordCount = transcriptText.trim() === "" ? 0 : transcriptText.trim().split(/\s+/).length;
      setTranscriptData({ text: transcriptText, wordCount });
      setTranscriptStatus("success");
    } catch (err) {
      clearTimeout(wakeUpTimer);
      setIsWakingUp(false);
      setTranscriptError(err.response?.data?.message || err.message || "Failed to fetch transcript");
      setTranscriptStatus("error");
    }
  };

  const handleGenerateQuiz = async () => {
    if (!transcriptData) return;
    setQuizState("generating");
    setQuizError("");
    try {
      const res = await api.post("/quiz/generate", {
        transcript: transcriptData.text,
        difficulty
      });
      if (res.data.success && res.data.questions && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setScore(0);
        setWrongTopics([]);
        setUserAnswers([]);
        setQuizState("active");
      } else {
        throw new Error("Invalid response format from generator.");
      }
    } catch (err) {
      setQuizError(err.response?.data?.message || err.message || "Failed to generate quiz");
      setQuizState("not_started");
    }
  };

  const handleOptionSelect = (option) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);
    const currentQ = questions[currentQuestionIndex];
    
    const isCorrect = option === currentQ.answer;

    setUserAnswers(prev => [
      ...prev,
      {
        question: currentQ.question,
        options: currentQ.options,
        answer: currentQ.answer,
        userAnswer: option,
        isCorrect: isCorrect,
        explanation: currentQ.explanation,
        topic: currentQ.topic
      }
    ]);

    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      if (currentQ.topic && !wrongTopics.includes(currentQ.topic)) {
        setWrongTopics(prev => [...prev, currentQ.topic]);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    setQuizState("results");
    api.post("/quiz/result", {
      videoId,
      videoUrl,
      quizName: `Video Quiz - ${videoId}`,
      score,
      total: questions.length,
      wrongTopics,
      difficulty,
      detailedResults: userAnswers,
      date: new Date()
    }).catch(err => console.error("Failed to save quiz result", err));
  };

  const handleTryAgain = () => setQuizState("not_started");

  const handleLoadNewVideo = () => {
    setUrlInput("");
    setVideoId(null);
    setVideoUrl("");
    setTranscriptStatus("default");
    setTranscriptData(null);
    setQuizState("not_started");
    setUserAnswers([]);
  };

  const renderQuizContent = () => {
    if (transcriptStatus === "default") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <p className="text-foreground/50 font-bold uppercase tracking-widest text-sm">
            Load a video to get started
          </p>
        </div>
      );
    }

    if (transcriptStatus === "loading") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary font-bold tracking-widest uppercase text-sm">Extracting transcript...</p>
          {isWakingUp && (
            <p className="text-accent font-bold text-xs uppercase tracking-wider animate-pulse mt-2">
              Server is waking up, please wait...
            </p>
          )}
        </div>
      );
    }

    if (transcriptStatus === "error") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-danger/10 p-4 rounded-lg w-full border border-danger/20 text-center">
            <p className="text-error font-bold uppercase tracking-widest text-sm mb-2">Transcript Failed</p>
            <p className="text-foreground/80 font-medium text-sm">{transcriptError}</p>
          </div>
        </div>
      );
    }

    if (quizState === "not_started") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-6 w-full">
          <div className="w-16 h-16 bg-secondary/20 text-secondary rounded-full flex items-center justify-center mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-secondary font-bold tracking-widest uppercase text-lg">Transcript ready!</p>
          <div className="w-full max-w-sm mt-8">
            <p className="text-sm font-bold uppercase tracking-widest text-foreground/50 mb-3">Select Difficulty</p>
            <div className="flex space-x-2 bg-muted p-1 rounded-lg w-full">
              {["Easy", "Medium", "Hard"].map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                    difficulty === level
                      ? "bg-background shadow-sm text-primary"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          {quizError && <p className="text-error text-sm font-medium">{quizError}</p>}
          <Button onClick={handleGenerateQuiz} className="w-full max-w-sm mt-4">Generate Quiz</Button>
        </div>
      );
    }

    if (quizState === "generating") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-4">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-secondary font-bold tracking-widest uppercase text-sm">Generating quiz...</p>
        </div>
      );
    }

    if (quizState === "active") {
      const currentQ = questions[currentQuestionIndex];
      const isLastQuestion = currentQuestionIndex === questions.length - 1;
      return (
        <div className="flex flex-col w-full h-full">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-bold uppercase tracking-widest text-foreground/50">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              {currentQ.topic && (
                <span className="text-xs bg-muted px-2 py-1 rounded-full text-foreground/60 font-bold uppercase">
                  {currentQ.topic}
                </span>
              )}
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <h3 className="text-lg font-bold mb-6 text-foreground">{currentQ.question}</h3>
          <div className="flex flex-col space-y-3 mb-6">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectAnswer = opt === currentQ.answer;
              let btnClass = "text-left px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ";
              if (selectedOption === null) {
                btnClass += "border-border hover:border-primary/50 hover:bg-muted";
              } else {
                if (isCorrectAnswer) {
                  btnClass += "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                } else if (isSelected) {
                  btnClass += "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                } else {
                  btnClass += "border-border opacity-50";
                }
              }
              return (
                <button key={idx} onClick={() => handleOptionSelect(opt)} disabled={selectedOption !== null} className={btnClass}>
                  {opt}
                </button>
              );
            })}
          </div>
          {selectedOption !== null && (
            <div className="mt-auto flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className={`p-4 rounded-lg border-l-4 ${selectedOption === currentQ.answer ? "bg-green-500/10 border-green-500 text-green-800 dark:text-green-300" : "bg-red-500/10 border-red-500 text-red-800 dark:text-red-300"}`}>
                <p className="font-bold text-sm uppercase tracking-wide mb-1">
                  {selectedOption === currentQ.answer ? "Correct!" : "Incorrect"}
                </p>
                <p className="text-sm font-medium opacity-90">{currentQ.explanation}</p>
              </div>
              <Button onClick={handleNextQuestion} className="w-full">
                {isLastQuestion ? "See Results" : "Next Question"}
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (quizState === "results") {
      const percentage = Math.round((score / questions.length) * 100);
      let message = "Keep learning!";
      if (percentage >= 80) message = "Great job!";
      if (percentage === 100) message = "Perfect score!";
      
      const correctAnswers = userAnswers.filter(ans => ans.isCorrect);
      const incorrectAnswers = userAnswers.filter(ans => !ans.isCorrect);

      return (
        <div className="flex-1 flex flex-col items-center justify-start text-center p-4 w-full overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-primary/10 border-4 border-primary text-primary shrink-0 mt-4">
            <h2 className="text-3xl font-extrabold">{score}/{questions.length}</h2>
          </div>
          <h3 className="text-2xl font-extrabold mb-2 text-foreground">{message}</h3>
          <p className="text-foreground/60 font-bold uppercase tracking-widest text-sm mb-8">{percentage}% Correct</p>
          {wrongTopics.length > 0 && (
            <div className="w-full mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3 text-left">Topics to Review</p>
              <div className="flex flex-wrap gap-2">
                {wrongTopics.map((topic, i) => (
                  <span key={i} className="bg-danger/10 text-error px-3 py-1 rounded-full text-xs font-bold uppercase">{topic}</span>
                ))}
              </div>
            </div>
          )}
          
          <div className="w-full text-left mt-2 space-y-6">
            <h4 className="text-xl font-bold border-b border-border pb-2">Detailed Results</h4>
            
            {incorrectAnswers.length > 0 && (
              <div className="space-y-4">
                <h5 className="text-lg font-bold text-red-500 dark:text-red-400">Incorrect ({incorrectAnswers.length})</h5>
                {incorrectAnswers.map((ans, idx) => (
                  <div key={`inc-${idx}`} className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                    <p className="font-bold text-foreground mb-2">Q: {ans.question}</p>
                    <p className="text-sm text-foreground/80 mb-1"><span className="font-semibold text-red-500 dark:text-red-400">Your Answer:</span> {ans.userAnswer}</p>
                    <p className="text-sm text-foreground/80 mb-2"><span className="font-semibold text-green-500 dark:text-green-400">Correct Answer:</span> {ans.answer}</p>
                    <div className="text-xs bg-background p-2 rounded border border-border">
                      <span className="font-bold opacity-70">Explanation:</span> {ans.explanation}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {correctAnswers.length > 0 && (
              <div className="space-y-4">
                <h5 className="text-lg font-bold text-green-500 dark:text-green-400">Correct ({correctAnswers.length})</h5>
                {correctAnswers.map((ans, idx) => (
                  <div key={`cor-${idx}`} className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                    <p className="font-bold text-foreground mb-2">Q: {ans.question}</p>
                    <p className="text-sm text-foreground/80 mb-2"><span className="font-semibold text-green-500 dark:text-green-400">Answer:</span> {ans.answer}</p>
                    <div className="text-xs bg-background p-2 rounded border border-border">
                      <span className="font-bold opacity-70">Explanation:</span> {ans.explanation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-3 w-full mt-8 shrink-0 mb-4">
            <Button onClick={handleTryAgain} variant="primary" className="w-full">Try Again</Button>
            <Button onClick={handleLoadNewVideo} variant="outline" className="w-full bg-transparent border-2 border-border text-foreground hover:bg-muted">
              Load New Video
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-8 h-full min-h-[calc(100vh-8rem)]">
      <div className="bg-primary text-white p-8 rounded-lg">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight mb-2">Video Study</h1>
        <p className="text-white/80 font-medium text-lg">Master any topic directly from a YouTube video.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-[60%] flex flex-col space-y-4">
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-background text-foreground border-2 border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="Paste YouTube URL..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={transcriptStatus === "loading"}
              />
              <Button onClick={handleLoadVideo} disabled={transcriptStatus === "loading"}>Load Video</Button>
            </div>
            {inputError && <p className="text-error font-bold mt-2 text-sm uppercase tracking-wide">{inputError}</p>}
          </div>
          <div className="aspect-video bg-black rounded-xl flex items-center justify-center border-4 border-muted overflow-hidden relative">
            {videoId ? (
              <iframe
                className="absolute top-0 left-0 w-full h-full border-0"
                src={`https://www.youtube.com/embed/${videoId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube Video"
              />
            ) : (
              <p className="text-white/50 font-bold tracking-widest uppercase text-sm">Paste a YouTube URL to begin</p>
            )}
          </div>
        </div>
        <div className="w-full md:w-[40%] flex flex-col">
          <Card bgColor="bg-background" className="flex flex-col h-full min-h-[400px] border-2 border-border p-6">
            <h2 className="text-xl font-extrabold uppercase tracking-tight border-b-2 border-border pb-4 mb-6 shrink-0">Quiz</h2>
            <div className="flex-1 flex flex-col">{renderQuizContent()}</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoStudy;