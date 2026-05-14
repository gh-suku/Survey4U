import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export default function Landing() {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsVerifying(true);
    
    setTimeout(() => {
      navigate(`/${code.trim().toLowerCase()}`);
      setIsVerifying(false);
    }, 800);
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-20 -left-20 w-64 h-64 bg-[#6366f1]/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            rotate: -360,
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#ec4899]/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8b5cf6]/5 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full space-y-10"
        >
          {/* Brand/Hero */}
          <div className="text-center space-y-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="h-24 w-24 gradient-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-[#6366f1]/40 rotate-3 animate-float">
                  <MessageSquare size={48} className="text-white" strokeWidth={2.5} />
                </div>
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles size={28} className="text-[#f59e0b]" fill="#f59e0b" />
                </motion.div>
              </div>
            </motion.div>
            
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span className="inline-block px-5 py-2 bg-[#6366f1]/10 text-[#6366f1] rounded-full text-sm font-bold">
                  ✨ Survey Access Portal
                </span>
              </motion.div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-tight">
                Welcome to<br/>
                <span className="gradient-text">
                  Survey4U
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-[#64748b] font-medium max-w-lg mx-auto">
                Share your thoughts and help us improve! 🚀
              </p>
            </div>
          </div>

          {/* Input Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-8 md:p-12 shadow-2xl"
          >
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-3">
                <label className="label-text text-lg flex items-center gap-2">
                  <span>Enter your survey code</span>
                  <span className="text-[#ec4899]">✦</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., workshop-2024"
                  autoFocus
                  className="input-field text-xl font-semibold h-16"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <p className="text-sm text-[#64748b] flex items-center gap-2">
                  <span>💡</span>
                  <span>You should have received this code via email</span>
                </p>
              </div>

              <button 
                type="submit" 
                disabled={isVerifying || !code.trim()}
                className="btn-primary w-full h-16 text-lg flex items-center justify-center gap-3 shadow-xl shadow-[#6366f1]/40"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    <span>Opening survey...</span>
                  </>
                ) : (
                  <>
                    <span>Start Survey</span>
                    <ArrowRight size={24} />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-3 gap-6 text-center"
          >
            {[
              { emoji: '⚡', label: 'Quick & Easy' },
              { emoji: '🔒', label: 'Secure' },
              { emoji: '🎯', label: 'Anonymous' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="space-y-3 p-4 rounded-xl hover:bg-white/50 transition-colors"
              >
                <div className="text-3xl">{feature.emoji}</div>
                <p className="text-sm font-semibold text-[#64748b]">{feature.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Admin Link */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 right-6"
      >
        <button 
          onClick={() => navigate('/admin/login')}
          className="px-5 py-2.5 text-sm font-semibold text-[#64748b] hover:text-[#6366f1] transition-all rounded-xl hover:bg-white/70 backdrop-blur-sm"
        >
          Admin Login →
        </button>
      </motion.div>
    </div>
  );
}
