import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { surveyService } from '../lib/surveyService';
import { 
  Send, 
  Mic, 
  MicOff, 
  Loader2, 
  ArrowRight, 
  CheckCircle2,
  Lock,
  User,
  Zap,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Speech Recognition Type (for TS)
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function PublicSurvey() {
  const { slug } = useParams<{ slug: string }>();
  const [survey, setSurvey] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Access Code Flow
  const [accessCode, setAccessCode] = useState('');
  const [verifiedAccessCode, setVerifiedAccessCode] = useState('');
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Chat Flow
  const [messages, setMessages] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [userInput, setUserInput] = useState('');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Voice
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      if (!slug) return;
      const data = await surveyService.getSurveyBySlug(slug);
      if (!data) {
        setError('Endpoint not found or session terminated.');
      } else {
        setSurvey(data);
        setQuestions(data.questions || []);
        if (!data.accessCodeRequired) {
          setIsAuthorised(true);
          setTimeout(() => startConversationWithSurvey(data, data.questions || []), 500);
        }
      }
      setLoading(false);
    }
    init();
  }, [slug]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Voice Interaction Logic
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-GB';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setUserInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    if (!survey.accessCodeRequired || accessCode.trim()) {
      const code = accessCode.trim();
      setVerifiedAccessCode(code);
      setIsAuthorised(true);
      startConversation();
    } else {
      alert('Please enter the event access code.');
    }
    setIsVerifying(false);
  };

  const startConversation = () => {
    startConversationWithSurvey(survey, questions);
  };

  const startConversationWithSurvey = (targetSurvey: any, targetQuestions: any[]) => {
    setMessages([
      { 
        role: 'system', 
        text: `Commencing structural ingestion for ${targetSurvey.workshopTitle}. I am the Archivist. I will guide you through a series of logical queries to assess AI readiness.` 
      }
    ]);
    setTimeout(() => {
      if (targetQuestions.length > 0) {
        const q = targetQuestions[0];
        setMessages(prev => [...prev, { role: 'archivist', text: q.text, qId: q.id }]);
        setCurrentQuestionIndex(0);
      } else {
        setMessages(prev => [...prev, { role: 'archivist', text: "No questions are configured for this event yet." }]);
      }
    }, 1000);
  };

  const askNextQuestion = (index: number) => {
    if (index < questions.length) {
      const q = questions[index];
      setMessages(prev => [...prev, { role: 'archivist', text: q.text, qId: q.id }]);
      setCurrentQuestionIndex(index);
    } else {
      setMessages(prev => [...prev, { role: 'archivist', text: "All queries processed. Committing logic to the archive. Would you like to provide an identity ref or submit anonymously?" }]);
      setCurrentQuestionIndex(questions.length);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const messageText = userInput;
    setUserInput('');
    setMessages(prev => [...prev, { role: 'user', text: messageText }]);

    if (currentQuestionIndex < questions.length) {
      const q = questions[currentQuestionIndex];
      setAnswers(prev => ({ ...prev, [q.id]: messageText }));
      
      setTimeout(() => {
        askNextQuestion(currentQuestionIndex + 1);
      }, 800);
    } else {
      // Final step: Identity or submit
      handleSubmit(messageText);
    }
  };

  const handleSubmit = async (identity: string) => {
    setIsSubmitting(true);
    try {
      await surveyService.submitResponse(survey.workshopId, survey.id, {
        answers,
        respondent_name: identity,
        respondent_email: '', // Could ask for email too but keeping it simple
        public_slug: survey.public_slug,
        access_code: verifiedAccessCode,
      });
      setIsSubmitted(true);
    } catch (err) {
      alert('Submission failure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-editorial-bg flex items-center justify-center label-archival animate-pulse">Initialising Endpoint...</div>;
  if (error) return <div className="min-h-screen bg-editorial-bg flex items-center justify-center text-editorial-accent p-10 text-center font-serif">
    <div className="space-y-6 max-w-md">
       <div className="text-6xl italic border border-editorial-accent h-24 w-24 flex items-center justify-center rounded-full mx-auto opacity-40">&dagger;</div>
       <h1 className="text-4xl font-light tracking-tighter">{error}</h1>
    </div>
  </div>;

  if (isSubmitted) return (
    <div className="min-h-screen bg-editorial-bg flex items-center justify-center p-10 font-serif">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl text-center space-y-8">
        <div className="text-5xl border border-editorial-text/20 h-24 w-24 flex items-center justify-center rounded-full mx-auto italic">&dagger;</div>
        <h1 className="text-6xl font-light tracking-tighter italic">Logic Archived.</h1>
        <p className="text-xl opacity-60">The ingestion session is now terminated. Your perspectives have been integrated into the readiness node for {survey.workshopTitle}.</p>
        <div className="pt-12 border-t border-editorial-border">
           <span className="label-archival">Session Concluded &mdash; Node Status: Optimised</span>
        </div>
      </motion.div>
    </div>
  );

  if (!isAuthorised) {
    return (
      <div className="min-h-screen bg-editorial-bg flex items-center justify-center p-10 font-serif">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl w-full space-y-12 bg-editorial-bg border border-editorial-text p-12 shadow-2xl relative">
          <div className="space-y-4">
             <h4 className="label-archival text-editorial-accent">Access Protocol</h4>
             <h1 className="text-5xl font-light tracking-tighter">{survey.accessCodeRequired ? 'Enter Security Key' : 'Start Event'}</h1>
             <p className="text-sm opacity-60 font-sans italic">
              {survey.accessCodeRequired
                ? `A valid logical access code is required to initiate structural ingestion for "${survey.workshopTitle}".`
                : `No access code is required for "${survey.workshopTitle}".`}
             </p>
          </div>
          
          <form onSubmit={handleVerify} className="space-y-8">
             <div className="border-b border-editorial-text pt-4 pb-2">
                <input 
                  type="text" 
                  autoFocus
                  disabled={!survey.accessCodeRequired}
                  placeholder="CODE_INDEX"
                  className="w-full bg-transparent text-3xl font-mono tracking-widest outline-none placeholder:opacity-10"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                />
             </div>
             <button disabled={isVerifying} className="btn-editorial bg-editorial-text text-white w-full py-4 text-xs tracking-[0.4em] flex items-center justify-center gap-4">
                {isVerifying ? <Loader2 className="animate-spin" size={14} /> : 'INITIALISE'} <ArrowRight size={14} />
             </button>
          </form>
          <div className="h-24 w-px bg-editorial-text absolute -bottom-12 right-12 opacity-10" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-editorial-layout flex flex-col font-serif">
      {/* Editorial Header */}
      <header className="h-20 bg-editorial-bg border-b border-editorial-border flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <span className="text-xs tracking-[0.3em] font-sans font-bold uppercase border border-editorial-text px-2 py-0.5">Archivist</span>
          <div className="h-4 w-px bg-editorial-border" />
          <span className="text-[10px] font-sans uppercase tracking-widest opacity-40 font-bold hidden sm:block">Session Active: Ingestion Protocol V2.4</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-[10px] font-mono opacity-30 italic">{survey.workshopTitle}</span>
        </div>
      </header>

      {/* Chat Interface */}
      <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col pt-12">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-10 space-y-12 pb-32">
           <AnimatePresence initial={false}>
             {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                   <div className={`
                    max-w-[85%] space-y-3 p-8 border
                    ${msg.role === 'user' 
                      ? 'bg-editorial-text text-white border-editorial-text font-serif italic' 
                      : 'bg-white border-editorial-border font-serif'}
                  `}>
                    <div className="flex items-center gap-3 mb-2 opacity-30">
                       {msg.role === 'archivist' ? <Zap size={10} /> : <User size={10} />}
                       <span className="text-[9px] uppercase tracking-widest font-bold">
                        {msg.role === 'user' ? 'PARTICIPANT' : 'ARCHIVIST'}
                       </span>
                    </div>
                    <p className="text-xl md:text-2xl font-light leading-relaxed tracking-tight">{msg.text}</p>
                   </div>
                </motion.div>
             ))}
           </AnimatePresence>
        </div>

        {/* Input Dock */}
        <div className="p-8 md:p-12 sticky bottom-0 bg-gradient-to-t from-editorial-bg via-editorial-bg to-transparent">
           <div className="max-w-3xl mx-auto space-y-6">
             <div className="flex items-end gap-6 bg-white border border-editorial-text p-6 shadow-2xl relative">
                <AnimatePresence>
                  {isListening && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-editorial-accent text-white px-4 py-1 rounded-full text-[10px] tracking-widest font-bold font-sans animate-pulse"
                    >
                       <Volume2 size={12} /> LISTENING...
                    </motion.div>
                  )}
                </AnimatePresence>

                <textarea 
                  rows={2}
                  placeholder="Type or record response..."
                  className="flex-1 bg-transparent border-none outline-none text-lg font-serif italic resize-none pt-2"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                
                <div className="flex gap-4">
                  <button 
                    onClick={toggleListening}
                    className={`h-12 w-12 flex items-center justify-center transition-all ${isListening ? 'bg-editorial-accent text-white border-editorial-accent animate-pulse' : 'hover:scale-110 opacity-30 hover:opacity-100'}`}
                  >
                    {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                  </button>
                  <button 
                    onClick={handleSendMessage}
                    disabled={!userInput.trim()}
                    className="h-12 w-12 bg-editorial-text text-white flex items-center justify-center hover:bg-black transition-colors disabled:opacity-20"
                  >
                    <ArrowRight size={24} />
                  </button>
                </div>
             </div>
             
             <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-3 opacity-30 text-[9px] font-sans uppercase tracking-[0.2em] font-bold">
                   <div className="h-1 w-1 bg-editorial-text rounded-full animate-ping" />
                   {currentQuestionIndex < questions.length ? `Logical Step ${currentQuestionIndex + 1} of ${questions.length}` : 'Process Complete'}
                </div>
                <p className="text-[8px] font-mono opacity-20 uppercase">Encryption: AES-256 Enabled</p>
             </div>
           </div>
        </div>
      </main>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-editorial-accent transition-all duration-700" style={{ width: `${Math.max(0, (currentQuestionIndex / questions.length) * 100)}%` }} />
    </div>
  );
}
