import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LockKeyhole, Loader2, ArrowRight, ArrowLeft, Sparkles, Shield, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
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
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-[#6366f1]/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#ec4899]/10 rounded-full blur-3xl"
        />
      </div>
      
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative z-10">
        {/* Left Side - Info */}
        <section className="hidden lg:flex flex-col justify-between p-16 relative">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748b] hover:text-[#6366f1] transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div className="space-y-12 max-w-xl">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-3"
              >
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-[#6366f1]/40">
                  <Sparkles size={32} className="text-white" />
                </div>
              </motion.div>
              
              <h1 className="text-6xl xl:text-7xl font-display font-bold leading-tight">
                Survey4U <br />
                <span className="gradient-text">Admin Portal</span>
              </h1>
              <p className="text-xl text-[#64748b] leading-relaxed max-w-lg">
                Create events, manage questions, analyze responses with AI, and export data seamlessly.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: BarChart3, label: 'Analytics', color: 'from-[#6366f1] to-[#8b5cf6]' },
                { icon: Shield, label: 'Secure', color: 'from-[#10b981] to-[#06b6d4]' },
                { icon: Sparkles, label: 'AI-Powered', color: 'from-[#ec4899] to-[#f43f5e]' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="card p-6 text-center space-y-3"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto shadow-lg`}>
                    <item.icon size={24} className="text-white" />
                  </div>
                  <p className="text-sm font-semibold text-[#64748b]">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-sm text-[#94a3b8]">
            © 2024 Survey4U. All rights reserved.
          </div>
        </section>

        {/* Right Side - Login Form */}
        <section className="flex items-center justify-center p-8 md:p-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full card p-10 md:p-12 space-y-8 shadow-2xl"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg shadow-[#6366f1]/30">
                <LockKeyhole size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#6366f1] mb-2">Admin Access</p>
                <h2 className="text-4xl font-display font-bold">Welcome back</h2>
                <p className="text-[#64748b] mt-2">Sign in to your admin account</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="label-text">Email Address</label>
                <input
                  required
                  type="email"
                  className="input-field"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="label-text">Password</label>
                <input
                  required
                  type="password"
                  className="input-field"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg"
                >
                  <p className="text-sm text-[#ef4444] font-medium">{error}</p>
                </motion.div>
              )}

              <button
                disabled={isLoading}
                className="btn-primary w-full h-14 flex items-center justify-center gap-3 shadow-xl shadow-[#6366f1]/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-6 border-t border-[#e2e8f0] text-center">
              <p className="text-sm text-[#64748b]">
                Don't have an account?{' '}
                <Link to="/admin/signup" className="text-[#6366f1] font-semibold hover:text-[#4f46e5] transition-colors">
                  Sign up here
                </Link>
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
