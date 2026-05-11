import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { surveyService } from '../lib/surveyService';

export default function WorkshopNew() {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState(searchParams.get('customer') || '');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [form, setForm] = useState({
    title: '',
    workshop_date: '',
    objective: '',
    public_slug: '',
    access_code: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCustomers() {
      const data = await surveyService.getCustomers();
      setCustomers(data || []);
      setIsBooting(false);
    }
    loadCustomers().catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to load customers.');
      setIsBooting(false);
    });
  }, []);

  const suggestedSlug = useMemo(() => surveyService.createSlug(form.title), [form.title]);

  useEffect(() => {
    if (!form.public_slug && suggestedSlug) {
      setForm((current) => ({ ...current, public_slug: suggestedSlug }));
    }
  }, [suggestedSlug, form.public_slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let selectedCustomerId = customerId;
      if (!selectedCustomerId) {
        if (!newCustomerName.trim()) {
          throw new Error('Select an entity or create a new one.');
        }
        selectedCustomerId = await surveyService.createCustomer({ name: newCustomerName.trim() });
      }

      const eventId = await surveyService.createWorkshop(selectedCustomerId, form);
      navigate(`/admin/workshops/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isBooting) {
    return <div className="p-20 text-center label-archival animate-pulse">Loading event form...</div>;
  }

  return (
    <div className="p-10 md:p-16 max-w-4xl mx-auto space-y-12">
      <button
        onClick={() => navigate('/admin/workshops')}
        className="text-[10px] font-sans uppercase tracking-widest opacity-50 hover:opacity-100 flex items-center gap-2"
      >
        <ArrowLeft size={12} /> Back to Events
      </button>

      <header className="space-y-4 border-b border-editorial-border pb-10">
        <h4 className="label-archival">Create Event</h4>
        <h1 className="text-6xl font-light tracking-tighter">New Survey Event</h1>
        <p className="text-sm font-sans opacity-50 max-w-xl">
          Create an event, copy the baseline AI workshop questions, then publish it when you are ready to share the QR link.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="label-archival text-[8px]">Existing Entity</label>
            <select
              className="w-full border border-editorial-border bg-transparent px-4 py-3 font-sans text-sm outline-none"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Create new entity below</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="label-archival text-[8px]">New Entity Name</label>
            <input
              disabled={Boolean(customerId)}
              className="w-full border border-editorial-border bg-transparent px-4 py-3 font-sans text-sm outline-none disabled:opacity-30"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              placeholder="Acme Corp"
            />
          </div>
        </section>

        <section className="space-y-8 border border-editorial-border p-8 bg-white">
          <div className="space-y-2">
            <label className="label-archival text-[8px]">Event Title</label>
            <input
              required
              className="w-full bg-transparent border-b border-editorial-text/20 py-3 text-3xl font-serif outline-none"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="AI Readiness Workshop"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="label-archival text-[8px]">Event Date</label>
              <input
                type="date"
                className="w-full bg-transparent border-b border-editorial-text/20 py-3 font-sans outline-none"
                value={form.workshop_date}
                onChange={(e) => setForm({ ...form, workshop_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="label-archival text-[8px]">Public Slug</label>
              <input
                required
                className="w-full bg-transparent border-b border-editorial-text/20 py-3 font-mono text-sm outline-none"
                value={form.public_slug}
                onChange={(e) => setForm({ ...form, public_slug: surveyService.createSlug(e.target.value) })}
                placeholder="ai-readiness-workshop"
              />
              <p className="text-[10px] font-sans opacity-30">Public URL: /survey4u/{form.public_slug || suggestedSlug}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="label-archival text-[8px]">Objective</label>
            <textarea
              className="w-full bg-transparent border border-editorial-border p-4 h-28 font-sans text-sm outline-none"
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              placeholder="What should this survey and event help analyse?"
            />
          </div>

          <div className="space-y-2">
            <label className="label-archival text-[8px]">Optional Access Code</label>
            <input
              className="w-full bg-transparent border-b border-editorial-text/20 py-3 font-mono text-sm outline-none"
              value={form.access_code}
              onChange={(e) => setForm({ ...form, access_code: e.target.value })}
              placeholder="Leave empty for open access"
            />
          </div>
        </section>

        {error && <p className="text-sm font-sans text-editorial-accent">{error}</p>}

        <button
          disabled={isLoading}
          className="btn-editorial bg-editorial-text text-white h-14 px-10 flex items-center justify-center gap-3"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
          Create Event
        </button>
      </form>
    </div>
  );
}
