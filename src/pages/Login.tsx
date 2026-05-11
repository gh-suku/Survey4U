import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LockKeyhole, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { surveyService } from '../lib/surveyService';

export default function Login() {
  const initialAdminEmail = import.meta.env.VITE_INITIAL_ADMIN_EMAIL || 'sudhaanshuu@gmail.com';
  const initialAdminPassword = import.meta.env.VITE_INITIAL_ADMIN_PASSWORD || '418667';
  const [email, setEmail] = useState(initialAdminEmail);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const destination = (location.state as any)?.from || '/admin/dashboard';

  async function finishAuth() {
    try {
      await surveyService.claimAdminInvite();
    } catch {
      // The first admin is created directly by SQL and will not have an invite.
    }

    const isAdmin = await surveyService.isCurrentUserAdmin();
    if (!isAdmin) {
      setMessage('This email is not registered as an admin. Ask an existing admin to invite it.');
      return;
    }

    navigate(destination, { replace: true });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        const signup = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        });

        if (signup.error) throw error;

        if (!signup.data.session) {
          setMessage('Account created. If Supabase email confirmation is enabled, confirm the email and log in again.');
          return;
        }
      }

      await finishAuth();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text font-serif relative overflow-hidden">
      <div className="absolute -top-32 -left-24 text-[32rem] leading-none font-bold opacity-[0.03] select-none">
        S4U
      </div>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden lg:flex flex-col justify-between p-16 border-r border-editorial-border relative z-10">
          <Link to="/" className="text-[10px] font-sans uppercase tracking-widest opacity-50 hover:opacity-100 flex items-center gap-2">
            <ArrowLeft size={12} /> Return to public survey
          </Link>

          <div className="space-y-10 max-w-2xl">
            <div className="inline-flex items-center gap-3 border border-editorial-text px-4 py-2 bg-white">
              <ShieldCheck size={16} className="text-editorial-accent" />
              <span className="text-[10px] font-sans uppercase tracking-[0.25em] font-bold">Admin Console</span>
            </div>
            <div className="space-y-5">
              <h1 className="text-7xl xl:text-8xl font-light tracking-tighter leading-none">
                Survey4U <br />
                <span className="italic">Control Room</span>
              </h1>
              <p className="text-lg font-sans opacity-50 leading-relaxed max-w-xl">
                Create events, add questions, share QR survey links, analyse Gemini insights, and export Excel or Markdown reports.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-px bg-editorial-border border border-editorial-border">
            {['Events', 'Responses', 'Analysis'].map((item) => (
              <div key={item} className="bg-editorial-bg p-6">
                <p className="label-archival text-[8px]">{item}</p>
                <p className="text-2xl mt-6 font-light">Ready</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-8 md:p-14 relative z-10">
          <div className="max-w-md w-full border border-editorial-text bg-white p-10 md:p-12 space-y-10 shadow-2xl">
            <div className="space-y-5">
              <div className="h-14 w-14 bg-editorial-text text-white flex items-center justify-center">
                <LockKeyhole size={22} />
              </div>
              <div>
                <h4 className="label-archival text-editorial-accent">Secure Admin Login</h4>
                <h2 className="text-5xl font-light tracking-tighter mt-2">Welcome back.</h2>
              </div>
              <p className="text-sm font-sans opacity-50 leading-relaxed">
                First login uses the email from your app env. After login, go to Settings to add any admin email and share the password you set for them.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2 border-b border-editorial-text/20 pb-2">
                <label className="label-archival text-[8px]">Admin Email</label>
                <input
                  required
                  type="email"
                  className="w-full bg-transparent text-xl outline-none font-sans"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={initialAdminEmail}
                />
              </div>

              <div className="space-y-2 border-b border-editorial-text/20 pb-2">
                <label className="label-archival text-[8px]">Password</label>
                <input
                  required
                  minLength={6}
                  type="password"
                  className="w-full bg-transparent text-xl outline-none font-sans"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={initialAdminPassword}
                />
              </div>

              {message && (
                <p className="text-xs font-sans text-editorial-accent leading-relaxed">{message}</p>
              )}

              <button
                disabled={isLoading}
                className="btn-editorial bg-editorial-text text-white w-full h-14 flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Enter Admin Console <ArrowRight size={14} />
              </button>
            </form>

            <div className="pt-6 border-t border-editorial-border flex items-center justify-between">
              <span className="text-[9px] font-sans uppercase tracking-widest opacity-30">Supabase Auth</span>
              <span className="text-[9px] font-sans uppercase tracking-widest text-editorial-accent">Protected</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
