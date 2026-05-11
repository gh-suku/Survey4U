import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { createEvent, createSlug } from '../lib/api';

export default function CreateEvent() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    slug: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-generate slug from title
  React.useEffect(() => {
    if (form.title && !form.slug) {
      setForm(prev => ({ ...prev, slug: createSlug(form.title) }));
    }
  }, [form.title]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const eventId = await createEvent(form);
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
