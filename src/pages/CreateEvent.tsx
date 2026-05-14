import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Upload, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { createEvent, createSlug } from '../lib/api';
import * as XLSX from 'xlsx';

export default function CreateEvent() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    slug: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsFile, setQuestionsFile] = useState<File | null>(null);
  const [uploadedQuestions, setUploadedQuestions] = useState<any[]>([]);
  const navigate = useNavigate();

  // Auto-generate slug from title
  React.useEffect(() => {
    if (form.title && !form.slug) {
      setForm(prev => ({ ...prev, slug: createSlug(form.title) }));
    }
  }, [form.title]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setQuestionsFile(file);
    setError('');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Expected format: { question: "...", type: "text|voice|multiple-choice", options: "opt1,opt2,opt3", required: "yes|no" }
      const questions = jsonData.map((row: any, index: number) => ({
        question_text: row.question || row.Question || '',
        question_type: (row.type || row.Type || 'text').toLowerCase(),
        options: row.options || row.Options ? String(row.options || row.Options).split(',').map((s: string) => s.trim()) : [],
        is_required: (row.required || row.Required || 'yes').toLowerCase() === 'yes',
        order_number: index + 3 // Start after default questions
      }));

      setUploadedQuestions(questions);
    } catch (err) {
      setError('Failed to parse Excel file. Please ensure it\'s a valid .xlsx or .xls file with the correct format.');
      console.error(err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let eventId: string;
      
      if (uploadedQuestions.length > 0) {
        // Import from createEventWithQuestions
        const { createEventWithQuestions } = await import('../lib/api');
        eventId = await createEventWithQuestions({
          ...form,
          questions: uploadedQuestions
        });
      } else {
        eventId = await createEvent(form);
      }
      
      navigate(`/admin/events/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6366f1]/5 to-[#ec4899]/5">
      <header className="bg-white/80 backdrop-blur-lg border-b border-[#e2e8f0] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748b] hover:text-[#6366f1] transition-colors mb-4"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6366f1] to-[#ec4899] rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">Create New Event</h1>
              <p className="text-sm text-[#64748b]">Set up a new survey event with custom questions</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit} 
          className="space-y-6"
        >
          <div className="card p-6 md:p-8 space-y-6">
            <div className="space-y-3">
              <label className="label-text">Event Title *</label>
              <input
                required
                type="text"
                className="input-field text-xl font-display font-semibold"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., AI Workshop Feedback Survey"
              />
            </div>

            <div className="space-y-3">
              <label className="label-text">Description (Optional)</label>
              <textarea
                className="input-field h-32 resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the purpose of this survey..."
              />
            </div>

            <div className="space-y-3">
              <label className="label-text">URL Slug *</label>
              <input
                required
                type="text"
                className="input-field font-mono"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: createSlug(e.target.value) })}
                placeholder="ai-workshop-survey"
              />
              <p className="text-xs text-[#64748b] flex items-center gap-2">
                <span>🔗</span>
                <span>Public URL: <span className="font-mono font-semibold">{window.location.origin}/{form.slug || 'your-slug'}</span></span>
              </p>
            </div>
          </div>

          <div className="card p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#6366f1]/10 rounded-xl flex items-center justify-center">
                <Upload size={20} className="text-[#6366f1]" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Bulk Upload Questions</h3>
                <p className="text-sm text-[#64748b]">Upload an Excel file with your questions (optional)</p>
              </div>
            </div>
            
            <div className="bg-[#f8fafc] rounded-xl p-4 border-2 border-dashed border-[#e2e8f0]">
              <p className="text-xs text-[#64748b] mb-3">
                📋 Expected columns: <span className="font-mono font-semibold">question</span>, <span className="font-mono font-semibold">type</span> (text/voice/multiple-choice), <span className="font-mono font-semibold">options</span> (comma-separated), <span className="font-mono font-semibold">required</span> (yes/no)
              </p>
              
              <label className="btn-secondary h-10 px-4 inline-flex items-center gap-2 cursor-pointer">
                <Upload size={16} />
                <span>Choose Excel File</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              
              {questionsFile && (
                <p className="text-sm font-mono text-[#64748b] mt-3">📄 {questionsFile.name}</p>
              )}
            </div>

            {uploadedQuestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#10b981]/5 border-2 border-[#10b981]/20 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-[#10b981] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <p className="font-semibold text-[#10b981]">
                    {uploadedQuestions.length} questions loaded successfully!
                  </p>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uploadedQuestions.map((q, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span className="font-bold text-[#64748b] min-w-[24px]">{idx + 1}.</span>
                      <span className="text-[#1e293b]">{q.question_text}</span>
                      <span className="badge bg-[#6366f1]/10 text-[#6366f1] ml-auto">{q.question_type}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-4 bg-[#ef4444]/5 border-2 border-[#ef4444]/20"
            >
              <p className="text-sm text-[#ef4444] font-semibold">⚠️ {error}</p>
            </motion.div>
          )}

          <button
            disabled={isLoading}
            className="btn-primary w-full h-14 text-lg flex items-center justify-center gap-3 shadow-xl shadow-[#6366f1]/30"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Creating event...</span>
              </>
            ) : (
              <>
                <Plus size={20} />
                <span>Create Event</span>
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
