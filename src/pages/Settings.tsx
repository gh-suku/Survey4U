import React, { useEffect, useState } from 'react';
import { Loader2, Plus, ShieldCheck } from 'lucide-react';
import { surveyService } from '../lib/surveyService';

export default function Settings() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  async function loadAdmins() {
    setIsLoading(true);
    try {
      const profiles = await surveyService.getAdminProfiles();
      setAdmins(profiles);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load admin settings.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsCreating(true);
    setMessage('');
    try {
      await surveyService.createAdminUser(email, password);
      setEmail('');
      setPassword('');
      setMessage('Admin email added. Share the password with them; their first login will create the Supabase account.');
      await loadAdmins();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create admin account.');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="p-10 md:p-16 max-w-5xl mx-auto space-y-14">
      <header className="space-y-4 border-b border-editorial-border pb-10">
        <h4 className="label-archival">Admin Settings</h4>
        <h1 className="text-6xl font-light tracking-tighter">Access Control</h1>
        <p className="text-sm font-sans opacity-50 max-w-xl">
          Add another admin email and choose a password to share with them. Their first login will create the Supabase account and activate admin access.
        </p>
      </header>

      <form onSubmit={handleCreateAdmin} className="border border-editorial-border bg-white p-8 space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck size={18} className="text-editorial-accent" />
          <h2 className="text-2xl font-light tracking-tight">Create Admin</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4">
          <input
            required
            type="email"
            className="bg-transparent border border-editorial-border px-4 py-3 font-sans text-sm outline-none focus:border-editorial-text"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            required
            minLength={6}
            type="password"
            className="bg-transparent border border-editorial-border px-4 py-3 font-sans text-sm outline-none focus:border-editorial-text"
            placeholder="Set password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            disabled={isCreating}
            className="btn-editorial bg-editorial-text text-white flex items-center justify-center gap-3"
          >
            {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Create
          </button>
        </div>
        {message && <p className="text-xs font-sans text-editorial-accent">{message}</p>}
      </form>

      {isLoading ? (
        <div className="label-archival animate-pulse">Loading admin state...</div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          <section className="space-y-6">
            <h3 className="label-archival border-b border-editorial-border pb-3">Active Admins</h3>
            <div className="divide-y divide-editorial-border">
              {admins.map((admin) => (
                <div key={admin.user_id} className="py-4">
                  <p className="font-sans text-sm">{admin.email}</p>
                  <p className="text-[10px] font-sans uppercase tracking-widest opacity-30">
                    Since {new Date(admin.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
