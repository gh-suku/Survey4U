import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LockKeyhole, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { adminLogin } from '../lib/api';

export default function AdminLogin() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await adminLogin(form.email, form.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text font-serif relative overflow-hidden">
      <div className="absolute -top-32 -left-24 text-[32rem] leading-none font-bold opacity-[0.03] select-none">
        S4U
      </div>
      
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side - Info */}
        <section className="hidden lg:flex flex-col justify-between p-16 border-r border-editorial-border relative z-10">
          <Link to="/" className="text-[10px] font-sans uppercase tracking-widest opacity-50 hover:opacity-100 flex items-center gap-2">
            <ArrowLeft size={12} /> Return to home
          </Link>

          <div className="space-y-10 max-w-2xl">
            <div className="space-y-5">
              <h1 className="text-7xl xl:text-8xl font-light tracking-tighter leading-none">
                Survey4U <br />
                <span className="italic">Admin Portal</span>
              </h1>
              <p className="text-lg font-sans opacity-50 leading-relaxed max-w-xl">
                Create events, manage questions, analyze responses with AI, and export data to Excel or Markdown.
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

        {/* Right Side - Login Form */}
        <section className="flex items-center justify-center p-8 md:p-14 relative z-10">
          <div className="max-w-md w-full border border-editorial-text bg-white p-10 md:p-12 space-y-10 shadow-2xl">
            <div className="space-y-5">
              <div className="h-14 w-14 bg-editorial-text text-white flex items-center justify-center">
                <LockKeyhole size={22} />
              </div>
              <div>
                <h4 className="label-archival text-editorial-accent">Admin Access</h4>
                <h2 className="text-5xl font-light tracking-tighter mt-2">Welcome back</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2 border-b border-editorial-text/20 pb-2">
                <label className="label-archival text-[8px]">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full bg-transparent text-xl outline-none font-sans"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-2 border-b border-editorial-text/20 pb-2">
                <label className="label-archival text-[8px]">Password</label>
                <input
                  required
                  type="password"
                  className="w-full bg-transparent text-xl outline-none font-sans"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-xs font-sans text-editorial-accent leading-relaxed">{error}</p>
              )}

              <button
                disabled={isLoading}
                className="btn-editorial bg-editorial-text text-white w-full h-14 flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <LockKeyhole size={14} />}
                Login to Dashboard <ArrowRight size={14} />
              </button>
            </form>

            <div className="pt-6 border-t border-editorial-border text-center">
              <p className="text-sm font-sans opacity-50">
                Don't have an account?{' '}
                <Link to="/admin/signup" className="text-editorial-accent underline">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
