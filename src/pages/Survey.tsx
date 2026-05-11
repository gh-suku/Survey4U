import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, CheckCircle, Mic, MicOff } from 'lucide-react';
import { getEventBySlug, submitResponse } from '../lib/api';
import type { EventWithQuestions } from '../types';

// Generate a unique session ID for this survey submission (UUID v4 format)
function generateSessionId(): string {
  // Generate a proper UUID v4
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
  const [isRecording, setIsRecording] = useState(false);

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

  async function handleSubmit() {
    if (!event) return;
    
    // Validate required questions
    const requiredQuestions = event.questions.filter(q => q.is_required);
    const missingAnswers = requiredQuestions.filter(q => !answers[q.id] || answers[q.id].trim() === '');
    
    if (missingAnswers.length > 0) {
      alert(`Please answer all required questions: ${missingAnswers.map(q => q.question_text).join(', ')}`);
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Get name and email from default questions
      const nameQuestion = event.questions.find(q => q.question_text === 'Your Name');
      const emailQuestion = event.questions.find(q => q.question_text === 'Your Email');
      
      const responderName = nameQuestion ? answers[nameQuestion.id] : undefined;
      const responderEmail = emailQuestion ? answers[emailQuestion.id] : undefined;
      
      // Submit each answer as a separate response with the same session_id
      for (const question of event.questions) {
        const answer = answers[question.id];
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

  function handleVoiceRecord() {
    // Placeholder for voice recording
    alert('Voice recording feature coming soon!');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-editorial-bg flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-editorial-bg flex items-center justify-center text-editorial-text">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-light">Survey Not Found</h1>
          <p className="text-sm opacity-50">This survey may not be published yet.</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-editorial-bg flex items-center justify-center text-editorial-text">
        <div className="max-w-md text-center space-y-6 bg-white border border-editorial-text p-12">
          <CheckCircle size={64} className="mx-auto text-green-600" />
          <h1 className="text-4xl font-light">Thank You!</h1>
          <p className="text-sm font-sans opacity-50 leading-relaxed">
            Your responses have been submitted successfully. We appreciate your participation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text">
      {/* Header */}
      <header className="border-b border-editorial-border bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <h1 className="text-4xl font-light tracking-tight mb-2">{event.title}</h1>
          {event.description && (
            <p className="text-sm font-sans opacity-50">{event.description}</p>
          )}
          <div className="mt-4 flex items-center gap-2 text-xs font-sans opacity-30">
            <span>{event.questions.length} questions</span>
            <span>•</span>
            <span>{event.questions.filter(q => q.is_required).length} required</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-8">
          {/* All Questions */}
          {event.questions.map((question, index) => (
            <div key={question.id} className="bg-white border border-editorial-border p-8 space-y-6">
              {/* Question Header */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-editorial-text text-white flex items-center justify-center font-mono text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-light leading-snug">
                    {question.question_text}
                    {question.is_required && <span className="text-editorial-accent ml-2">*</span>}
                  </h2>
                  {question.is_required && (
                    <p className="text-xs font-sans opacity-30 mt-2">Required</p>
                  )}
                </div>
              </div>

              {/* Answer Input */}
              <div className="pl-14">
                {/* Text Input */}
                {question.question_type === 'text' && (
                  <textarea
                    required={question.is_required}
                    className="w-full border border-editorial-border p-4 h-32 font-sans text-sm outline-none resize-none focus:border-editorial-text transition-colors"
                    value={answers[question.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                    placeholder="Type your answer here..."
                  />
                )}

                {/* Voice Input */}
                {question.question_type === 'voice' && (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={handleVoiceRecord}
                      className={`w-full h-32 border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors ${
                        isRecording 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-editorial-border hover:border-editorial-text'
                      }`}
                    >
                      {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
                      <span className="text-sm font-sans">
                        {isRecording ? 'Recording... Click to stop' : 'Click to record voice answer'}
                      </span>
                    </button>
                    <textarea
                      required={question.is_required}
                      className="w-full border border-editorial-border p-4 h-24 font-sans text-sm outline-none resize-none focus:border-editorial-text transition-colors"
                      value={answers[question.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                      placeholder="Or type your answer here..."
                    />
                  </div>
                )}

                {/* Multiple Choice */}
                {question.question_type === 'multiple-choice' && question.options && (
                  <div className="space-y-3">
                    {question.options.map((option, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-4 p-4 border border-editorial-border cursor-pointer hover:bg-editorial-bg transition-colors"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          required={question.is_required}
                          checked={answers[question.id] === option}
                          onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                          className="w-4 h-4"
                        />
                        <span className="font-sans text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="sticky bottom-8 bg-white border border-editorial-text p-6 shadow-2xl">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-editorial bg-editorial-text text-white w-full h-14 flex items-center justify-center gap-3 text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Survey
                  <CheckCircle size={20} />
                </>
              )}
            </button>
            <p className="text-xs font-sans text-center opacity-30 mt-3">
              Please review your answers before submitting
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
