import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Upload } from 'lucide-react';
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
      const workbook = XLSX.read(data);
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
      setError('Failed to parse Excel file. Please check the format.');
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
    <div className="min-h-screen bg-editorial-bg text-editorial-text">
      <header className="border-b border-editorial-border bg-white">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <Link
            to="/admin/dashboard"
            className="text-[10px] font-sans uppercase tracking-widest opacity-50 hover:opacity-100 flex items-center gap-2 mb-6"
          >
            <ArrowLeft size={12} /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-light tracking-tight">Create New Event</h1>
          <p className="text-sm font-sans opacity-50 mt-2">
            Set up a new survey event with custom questions
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-8">
        <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-editorial-border p-10">
          <div className="space-y-2">
            <label className="label-archival text-[8px]">Event Title</label>
            <input
              required
              type="text"
              className="w-full bg-transparent border-b border-editorial-text/20 py-3 text-3xl font-serif outline-none"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="AI Workshop Survey"
            />
          </div>

          <div className="space-y-2">
            <label className="label-archival text-[8px]">Description (Optional)</label>
            <textarea
              className="w-full bg-transparent border border-editorial-border p-4 h-32 font-sans text-sm outline-none resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the purpose of this survey..."
            />
          </div>

          <div className="space-y-2">
            <label className="label-archival text-[8px]">URL Slug</label>
            <input
              required
              type="text"
              className="w-full bg-transparent border-b border-editorial-text/20 py-3 font-mono text-sm outline-none"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: createSlug(e.target.value) })}
              placeholder="ai-workshop-survey"
            />
            <p className="text-[10px] font-sans opacity-30">
              Public URL: {window.location.origin}/{form.slug || 'your-slug'}
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-editorial-border">
            <label className="label-archival text-[8px]">Bulk Upload Questions (Optional)</label>
            <p className="text-xs font-sans opacity-50 mb-3">
              Upload an Excel file with questions. Expected columns: <span className="font-mono">question</span>, <span className="font-mono">type</span> (text/voice/multiple-choice), <span className="font-mono">options</span> (comma-separated), <span className="font-mono">required</span> (yes/no)
            </p>
            
            <div className="flex items-center gap-3">
              <label className="btn-editorial bg-editorial-text text-white h-10 px-4 flex items-center gap-2 cursor-pointer">
                <Upload size={14} />
                Choose Excel File
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {questionsFile && (
                <span className="text-sm font-mono opacity-50">{questionsFile.name}</span>
              )}
            </div>

            {uploadedQuestions.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200">
                <p className="text-sm font-sans text-green-800">
                  ✓ {uploadedQuestions.length} questions loaded from file
                </p>
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {uploadedQuestions.map((q, idx) => (
                    <p key={idx} className="text-xs font-mono opacity-70">
                      {idx + 1}. {q.question_text} ({q.question_type})
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm font-sans text-editorial-accent">{error}</p>
          )}

          <button
            disabled={isLoading}
            className="btn-editorial bg-editorial-text text-white h-14 px-10 flex items-center justify-center gap-3"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
}
