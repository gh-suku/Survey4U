import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, ExternalLink, Download, 
  Sparkles, QrCode, Loader2, Eye, CheckSquare, Square
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  getEvent, getQuestions, addQuestion, deleteQuestion,
  publishEvent, getGroupedResponses, updateEvent, updateQuestion
} from '../lib/api';
import { exportToExcel, exportToMarkdown } from '../lib/exports';
import type { Event, Question, AnalysisResult, GroupedResponse } from '../types';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [groupedResponses, setGroupedResponses] = useState<GroupedResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'text' as 'text' | 'voice' | 'multiple-choice',
    options: [] as string[],
    is_required: true
  });
  const [optionInput, setOptionInput] = useState('');

  useEffect(() => {
    if (id) loadEventData();
  }, [id]);

  async function loadEventData() {
    if (!id) return;
    
    try {
      const [eventData, questionsData, responsesData] = await Promise.all([
        getEvent(id),
        getQuestions(id),
        getGroupedResponses(id)
      ]);
      
      setEvent(eventData);
      setQuestions(questionsData);
      setGroupedResponses(responsesData);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !newQuestion.question_text) return;

    try {
      // Get the highest order number from non-default questions
      const maxOrder = Math.max(...questions.map(q => q.order_number), 2);
      
      await addQuestion(id, {
        ...newQuestion,
        order_number: maxOrder + 1
      });
      setNewQuestion({ question_text: '', question_type: 'text', options: [], is_required: true });
      setOptionInput('');
      await loadEventData();
    } catch (error) {
      console.error('Failed to add question:', error);
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!confirm('Delete this question?')) return;
    
    try {
      await deleteQuestion(questionId);
      await loadEventData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete question');
      console.error('Failed to delete question:', error);
    }
  }

  async function toggleRequired(questionId: string, currentValue: boolean) {
    try {
      await updateQuestion(questionId, { is_required: !currentValue });
      await loadEventData();
    } catch (error) {
      console.error('Failed to update question:', error);
    }
  }

  async function handlePublish() {
    if (!id || !event) return;
    if (!confirm('Publish this event? It will be accessible via the public URL.')) return;

    try {
      await publishEvent(id);
      await loadEventData();
    } catch (error) {
      console.error('Failed to publish event:', error);
    }
  }

  async function handleExportExcel() {
    if (!event) return;
    // Convert grouped responses back to flat format for Excel
    const flatResponses = groupedResponses.flatMap(group =>
      group.answers.map(answer => ({
        questions: { question_text: answer.question_text },
        answer_text: answer.answer_text,
        answer_audio_url: answer.answer_audio_url,
        response_type: answer.response_type,
        responder_name: group.responder_name,
        responder_email: group.responder_email,
        created_at: group.created_at
      }))
    );
    exportToExcel(event, flatResponses);
  }

  async function handleAnalyzeAndExport() {
    if (!event || !id) return;
    setIsAnalyzing(true);

    try {
      // Format grouped responses for AI
      const formattedResponses = groupedResponses.map(group => ({
        responder: group.responder_name || 'Anonymous',
        email: group.responder_email || 'N/A',
        answers: group.answers.map(a => ({
          question: a.question_text,
          answer: a.answer_text || a.answer_audio_url || 'No answer'
        }))
      }));

      const response = await fetch('/api/ai/analyze-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTitle: event.title,
          responses: formattedResponses
        })
      });

      const analysis: AnalysisResult = await response.json();
      exportToMarkdown(event, analysis);
    } catch (error) {
      console.error('Failed to analyze:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  function addOption() {
    if (!optionInput.trim()) return;
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, optionInput.trim()]
    });
    setOptionInput('');
  }

  function removeOption(index: number) {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.filter((_, i) => i !== index)
    });
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
      <div className="min-h-screen bg-editorial-bg flex items-center justify-center">
        <p>Event not found</p>
      </div>
    );
  }

  const publicURL = `${window.location.origin}/${event.slug}`;

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text">
      {/* Header */}
      <header className="border-b border-editorial-border bg-white">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <Link
            to="/admin/dashboard"
            className="text-[10px] font-sans uppercase tracking-widest opacity-50 hover:opacity-100 flex items-center gap-2 mb-6"
          >
            <ArrowLeft size={12} /> Back to Dashboard
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-light tracking-tight">{event.title}</h1>
                <span className={`text-xs font-sans uppercase tracking-widest px-3 py-1 ${
                  event.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {event.status}
                </span>
              </div>
              {event.description && (
                <p className="text-sm font-sans opacity-50">{event.description}</p>
              )}
            </div>

            <div className="flex gap-3">
              {event.status === 'draft' && (
                <button
                  onClick={handlePublish}
                  className="btn-editorial bg-green-600 text-white h-10 px-4 flex items-center gap-2"
                >
                  <Eye size={14} />
                  Publish
                </button>
              )}
              {event.status === 'published' && (
                <>
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="btn-editorial bg-editorial-text text-white h-10 px-4 flex items-center gap-2"
                  >
                    <QrCode size={14} />
                    QR Code
                  </button>
                  <a
                    href={publicURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-editorial bg-editorial-accent text-white h-10 px-4 flex items-center gap-2"
                  >
                    <ExternalLink size={14} />
                    View Public
                  </a>
                </>
              )}
            </div>
          </div>

          {event.status === 'published' && (
            <div className="mt-4 p-4 bg-editorial-bg border border-editorial-border">
              <p className="text-xs font-sans uppercase tracking-widest opacity-50 mb-2">Public URL</p>
              <p className="font-mono text-sm">{publicURL}</p>
            </div>
          )}
        </div>
      </header>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowQR(false)}>
          <div className="bg-white p-10 border border-editorial-text" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-light mb-6 text-center">Scan to Access Survey</h3>
            <QRCodeSVG value={publicURL} size={300} />
            <p className="text-xs font-mono text-center mt-4 opacity-50">{event.slug}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Questions */}
        <section className="space-y-6">
          <h2 className="text-2xl font-light border-b border-editorial-border pb-4">
            Questions ({questions.length})
          </h2>

          {/* Add Question Form */}
          <form onSubmit={handleAddQuestion} className="bg-white border border-editorial-border p-6 space-y-4">
            <h3 className="label-archival">Add Question</h3>
            
            <input
              required
              type="text"
              className="w-full bg-transparent border-b border-editorial-text/20 py-2 outline-none"
              value={newQuestion.question_text}
              onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
              placeholder="Enter your question..."
            />

            <select
              className="w-full border border-editorial-border bg-transparent px-3 py-2 text-sm"
              value={newQuestion.question_type}
              onChange={(e) => setNewQuestion({ 
                ...newQuestion, 
                question_type: e.target.value as any,
                options: e.target.value === 'multiple-choice' ? newQuestion.options : []
              })}
            >
              <option value="text">Text Response</option>
              <option value="voice">Voice Response</option>
              <option value="multiple-choice">Multiple Choice</option>
            </select>

            {newQuestion.question_type === 'multiple-choice' && (
              <div className="space-y-2">
                <p className="text-xs font-sans opacity-50">Options:</p>
                {newQuestion.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="flex-1 text-sm">{opt}</span>
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 border border-editorial-border px-3 py-2 text-sm"
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    placeholder="Add option..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                  />
                  <button
                    type="button"
                    onClick={addOption}
                    className="btn-editorial bg-editorial-text text-white px-4"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_required"
                checked={newQuestion.is_required}
                onChange={(e) => setNewQuestion({ ...newQuestion, is_required: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_required" className="text-sm font-sans cursor-pointer">
                Make this question required
              </label>
            </div>

            <button
              type="submit"
              className="btn-editorial bg-editorial-text text-white w-full h-10 flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              Add Question
            </button>
          </form>

          {/* Questions List */}
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white border border-editorial-border p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-xs font-mono opacity-30">Q{idx + 1}</span>
                      <p className="font-medium">{q.question_text}</p>
                      {q.is_default && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-sans uppercase tracking-widest opacity-50">
                        {q.question_type}
                      </span>
                      {q.options && q.options.length > 0 && (
                        <span className="text-xs opacity-30">
                          {q.options.length} options
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRequired(q.id, q.is_required)}
                      className="flex items-center gap-1 text-xs hover:text-editorial-accent transition-colors"
                      title={q.is_required ? 'Required' : 'Optional'}
                    >
                      {q.is_required ? (
                        <CheckSquare size={16} className="text-green-600" />
                      ) : (
                        <Square size={16} className="opacity-30" />
                      )}
                      <span className="text-xs">{q.is_required ? 'Required' : 'Optional'}</span>
                    </button>
                    {!q.is_default && (
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column - Responses */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-editorial-border pb-4">
            <h2 className="text-2xl font-light">
              Responses ({groupedResponses.length})
            </h2>
            {groupedResponses.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleExportExcel}
                  className="btn-editorial bg-green-600 text-white h-8 px-3 flex items-center gap-2 text-xs"
                >
                  <Download size={12} />
                  Excel
                </button>
                <button
                  onClick={handleAnalyzeAndExport}
                  disabled={isAnalyzing}
                  className="btn-editorial bg-editorial-accent text-white h-8 px-3 flex items-center gap-2 text-xs"
                >
                  {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Analyze
                </button>
              </div>
            )}
          </div>

          {groupedResponses.length === 0 ? (
            <div className="border border-dashed border-editorial-border bg-white p-12 text-center">
              <p className="opacity-50">No responses yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedResponses.map((group, idx) => (
                <div key={group.session_id} className="bg-white border border-editorial-border p-6 space-y-4">
                  {/* Responder Header */}
                  <div className="flex items-center justify-between border-b border-editorial-border pb-3">
                    <div>
                      <h3 className="font-medium text-lg">
                        {group.responder_name || 'Anonymous Responder'}
                      </h3>
                      {group.responder_email && (
                        <p className="text-xs font-mono opacity-50 mt-1">{group.responder_email}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-sans uppercase tracking-widest opacity-30">
                        Response #{idx + 1}
                      </p>
                      <p className="text-xs opacity-50 mt-1">
                        {new Date(group.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Answers */}
                  <div className="space-y-3">
                    {group.answers.map((answer, ansIdx) => (
                      <div key={ansIdx} className="pl-4 border-l-2 border-editorial-border">
                        <p className="text-xs font-sans uppercase tracking-widest opacity-50 mb-1">
                          {answer.question_text}
                        </p>
                        <p className="font-medium">
                          {answer.answer_text || answer.answer_audio_url || 'No answer'}
                        </p>
                        {answer.response_type === 'voice' && (
                          <span className="text-xs text-editorial-accent mt-1 inline-block">
                            🎤 Voice Response
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
