import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Database, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-editorial-bg text-editorial-text font-serif selection:bg-editorial-text selection:text-white flex flex-col">
      {/* Absolute Background Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <div className="absolute top-[-10%] left-[-10%] text-[40rem] font-bold select-none leading-none">&dagger;</div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-10 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl w-full space-y-16"
        >
          {/* Brand/Hero */}
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="h-16 w-16 border border-editorial-text flex items-center justify-center italic text-4xl shadow-2xl bg-white">
                S4U
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="label-archival text-editorial-accent tracking-[0.5em]">Survey Access Portal</h4>
              <h1 className="text-6xl md:text-7xl font-light tracking-tighter leading-none">
                Survey4U <br/>
                <span className="italic font-serif ml-8 md:ml-12">Platform</span>
              </h1>
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white border border-editorial-text p-10 md:p-14 shadow-2xl relative">
            <div className="absolute -top-3 -right-3 h-12 w-12 bg-editorial-accent text-white flex items-center justify-center shadow-lg">
              <Zap size={20} />
            </div>
            
            <form onSubmit={handleVerify} className="space-y-10">
              <div className="space-y-4">
                <label className="label-archival text-[10px] opacity-40">Enter Survey Code</label>
                <div className="border-b-2 border-editorial-text pb-4 pt-2">
                  <input 
                    type="text" 
                    placeholder="SURVEY-CODE"
                    autoFocus
                    className="w-full bg-transparent text-4xl md:text-5xl font-mono tracking-[0.2em] outline-none placeholder:opacity-10 uppercase text-center"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isVerifying || !code.trim()}
                className="w-full h-16 bg-editorial-text text-white text-xs tracking-[0.5em] font-bold uppercase flex items-center justify-center gap-4 hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                {isVerifying ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Access Survey <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Subtext */}
          <div className="flex flex-col items-center gap-6 opacity-30">
            <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-center max-w-sm leading-relaxed">
              AI-powered survey platform for event feedback and analysis
            </p>
            <div className="h-20 w-px bg-editorial-text" />
            <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest">
               <Database size={10} />
               <span>Secure Platform</span>
               <span className="opacity-20">&mdash;</span>
               <span>v.1.0.0</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Subtle Sidebar for Admin Link */}
      <div className="absolute bottom-10 right-10 flex flex-col items-end gap-2 opacity-40 hover:opacity-100 transition-opacity">
         <p className="text-[8px] uppercase tracking-widest font-bold">Admin Portal</p>
         <button 
          onClick={() => navigate('/admin/login')}
          className="text-[10px] font-sans uppercase tracking-[0.2em] underline underline-offset-4 decoration-editorial-text/20 hover:decoration-editorial-text"
         >
           Admin Login
         </button>
      </div>
    </div>
  );
}
