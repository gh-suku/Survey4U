import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2, ArrowRight } from 'lucide-react';
import { adminSignup } from '../lib/api';

export default function AdminSignup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await adminSignup(form.name, form.email, form.password);
      // Auto-login after signup
      const { adminLogin } = await import('../lib/api');
      await adminLogin(form.email, form.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text font-serif flex items-center justify-center p-8">
      <div className="max-w-md w-full border border-editorial-text bg-white p-10 md:p-12 space-y-10 shadow-2xl">
        <div className="space-y-5">
          <div className="h-14 w-14 bg-editorial-text text-white flex items-center justify-center">
            <UserPlus size={22} />
          </div>
          <div>
            <h4 className="label-archival text-editorial-accent">Admin Registration</h4>
            <h2 className="text-5xl font-light tracking-tighter mt-2">Create Account</h2>
          </div>
          <p className="text-sm font-sans opacity-50 leading-relaxed">
            Register as an admin to create and manage survey events.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2 border-b border-editorial-text/20 pb-2">
            <label className="label-archival text-[8px]">Full Name</label>
            <input
              required
              type="text"
              className="w-full bg-transparent text-xl outline-none font-sans"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

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
              minLength={6}
              type="password"
              className="w-full bg-transparent text-xl outline-none font-sans"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2 border-b border-editorial-text/20 pb-2">
            <label className="label-archival text-[8px]">Confirm Password</label>
            <input
              required
              minLength={6}
              type="password"
              className="w-full bg-transparent text-xl outline-none font-sans"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Create Admin Account <ArrowRight size={14} />
          </button>
        </form>

        <div className="pt-6 border-t border-editorial-border text-center">
          <p className="text-sm font-sans opacity-50">
            Already have an account?{' '}
            <Link to="/admin/login" className="text-editorial-accent underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
