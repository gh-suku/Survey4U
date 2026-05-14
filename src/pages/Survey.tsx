import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, CheckCircle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getEventBySlug, submitResponse } from '../lib/api';
import type { EventWithQuestions } from '../types';

// Generate a unique session ID for this survey submission (UUID v4 format)
function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function Survey() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [sessionId] = useState(generateSessionId());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');

  useEffect(() => {
    if (slug) loadEvent();
  }, [slug]);

  async function loadEvent() {
    if (!slug) return;
    
    try {
      const data = await getEventBySlug(slug);
      setEvent(data);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const currentQuestion = event?.questions[currentQuestionIndex];
  const progress = event ? ((currentQuestionIndex / event.questions.length) * 100) : 0;
  const isLastQuestion = event && currentQuestionIndex === event.questions.length - 1;

  const handleNext = () => {
    if (!currentQuestion) return;
    
    // Validate required questions
    if (currentQuestion.is_required && !currentAnswer.trim()) {
      alert('This question is required');
      return;
    }

    // Save answer
    if (currentAnswer.trim()) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: currentAnswer }));
    }

    // Move to next question or submit
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      // Load saved answer for next question
      const nextQuestion = event?.questions[currentQuestionIndex + 1];
      setCurrentAnswer(nextQuestion ? (answers[nextQuestion.id] || '') : '');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      // Save current answer before going back
      if (currentQuestion && currentAnswer.trim()) {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: currentAnswer }));
      }
      
      setCurrentQuestionIndex(prev => prev - 1);
      // Load saved answer for previous question
      const prevQuestion = event?.questions[currentQuestionIndex - 1];
      setCurrentAnswer(prevQuestion ? (answers[prevQuestion.id] || '') : '');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && currentQuestion?.question_type !== 'text') {
      e.preventDefault();
      handleNext();
    }
  };

  async function handleSubmit() {
    if (!event || !currentQuestion) return;
    
    // Save last answer
    const finalAnswers = { ...answers };
    if (currentAnswer.trim()) {
      finalAnswers[currentQuestion.id] = currentAnswer;
    }
    
    setIsSubmitting(true);

    try {
      // Get name and email from default questions
      const nameQuestion = event.questions.find(q => q.question_text === 'Your Name');
      const emailQuestion = event.questions.find(q => q.question_text === 'Your Email');
      
      const responderName = nameQuestion ? finalAnswers[nameQuestion.id] : undefined;
      const responderEmail = emailQuestion ? finalAnswers[emailQuestion.id] : undefined;
      
      // Submit each answer as a separate response with the same session_id
      for (const question of event.questions) {
        const answer = finalAnswers[question.id];
        if (answer) {
          await submitResponse({
            event_id: event.id,
            question_id: question.id,
            session_id: sessionId,
            responder_name: responderName,
            responder_email: responderEmail,
            answer_text: answer,
            response_type: 'text'
          });
        }
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin mx-auto text-[#6366f1]" size={48} />
          <p className="text-[#64748b] font-semibold">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-12 text-center space-y-4 max-w-md"
        >
          <div className="text-6xl">🔍</div>
          <h1 className="text-3xl font-display font-bold">Survey Not Found</h1>
          <p className="text-[#64748b]">This survey may not be published yet or the code is incorrect.</p>
        </motion.div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="card p-12 text-center space-y-6 max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="w-24 h-24 mx-auto gradient-primary rounded-full flex items-center justify-center shadow-2xl shadow-[#6366f1]/30">
              <CheckCircle size={48} className="text-white" strokeWidth={3} />
            </div>
          </motion.div>
          <div className="space-y-3">
            <h1 className="text-4xl font-display font-bold">Thank You! 🎉</h1>
            <p className="text-lg text-[#64748b]">
              Your responses have been submitted successfully. We appreciate your time and feedback!
            </p>
          </div>
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#10b981]/10 text-[#10b981] rounded-full text-sm font-semibold">
              <Sparkles size={16} />
              <span>Survey Complete</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="progress-bar">
          <motion.div 
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Question Number */}
                <div className="flex items-center gap-3 text-[#64748b]">
                  <span className="text-sm font-semibold">
                    {currentQuestionIndex + 1} → {event.questions.length}
                  </span>
                  {currentQuestion.is_required && (
                    <span className="badge badge-danger text-xs">Required</span>
                  )}
                </div>

                {/* Question Text */}
                <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                  {currentQuestion.question_text}
                </h1>

                {/* Answer Input */}
                <div className="space-y-4">
                  {/* Text Input */}
                  {currentQuestion.question_type === 'text' && (
                    <textarea
                      autoFocus
                      className="w-full px-6 py-4 text-xl bg-white border-2 border-[#e2e8f0] rounded-2xl outline-none transition-all focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/10 resize-none"
                      rows={4}
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your answer here..."
                    />
                  )}

                  {/* Multiple Choice */}
                  {currentQuestion.question_type === 'multiple-choice' && currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, idx) => (
                        <motion.button
                          key={idx}
                          type="button"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          onClick={() => setCurrentAnswer(option)}
                          className={`w-full text-left p-6 rounded-2xl border-2 transition-all text-lg font-medium ${
                            currentAnswer === option
                              ? 'border-[#6366f1] bg-[#6366f1]/5 shadow-lg shadow-[#6366f1]/20'
                              : 'border-[#e2e8f0] bg-white hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              currentAnswer === option
                                ? 'border-[#6366f1] bg-[#6366f1]'
                                : 'border-[#e2e8f0]'
                            }`}>
                              {currentAnswer === option && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-3 h-3 bg-white rounded-full"
                                />
                              )}
                            </div>
                            <span>{option}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Voice Input */}
                  {currentQuestion.question_type === 'voice' && (
                    <div className="space-y-4">
                      <div className="p-8 border-2 border-dashed border-[#e2e8f0] rounded-2xl text-center bg-white">
                        <p className="text-[#64748b] mb-4">Voice recording coming soon!</p>
                        <p className="text-sm text-[#94a3b8]">For now, please type your answer below</p>
                      </div>
                      <textarea
                        autoFocus
                        className="w-full px-6 py-4 text-xl bg-white border-2 border-[#e2e8f0] rounded-2xl outline-none transition-all focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/10 resize-none"
                        rows={4}
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your answer here..."
                      />
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-4 pt-4">
                  {currentQuestionIndex > 0 && (
                    <button
                      onClick={handlePrevious}
                      className="btn-ghost flex items-center gap-2"
                    >
                      <ArrowLeft size={20} />
                      <span>Previous</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="btn-primary ml-auto flex items-center gap-2 shadow-xl shadow-[#6366f1]/30"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>{isLastQuestion ? 'Submit' : 'Next'}</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>

                {/* Hint */}
                <p className="text-sm text-[#94a3b8] flex items-center gap-2">
                  <span>💡</span>
                  <span>Press Enter to continue</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-sm text-[#94a3b8]">
          Powered by <span className="font-semibold gradient-text">Survey4U</span>
        </p>
      </div>
    </div>
  );
}
