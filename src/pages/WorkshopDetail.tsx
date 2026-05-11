import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  ExternalLink, 
  Copy, 
  Check, 
  ArrowLeft,
  FileText,
  BarChart3,
  Settings2,
  Lock,
  Globe2,
  Trash2,
  Activity,
  Plus,
  X,
  FileDown,
  BrainCircuit,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { surveyService } from '../lib/surveyService';
import { aiService } from '../lib/ai';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import * as XLSX from 'xlsx';

export default function WorkshopDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState<any>(null);
  const [survey, setSurvey] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'structure' | 'participation' | 'intelligence'>('structure');
  
  // Modals / State
  const [isAddQModalOpen, setIsAddQModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ text: '', type: 'long_text', section: 'General', order_index: 0 });
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzingResponseId, setAnalyzingResponseId] = useState<string | null>(null);
  const [individualAnalyses, setIndividualAnalyses] = useState<Record<string, any>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [id]);

  async function loadAllData() {
    setLoading(true);
    try {
      const foundWorkshop = await surveyService.getWorkshop(id!);

      if (!foundWorkshop) {
        setLoading(false);
        return;
      }

      setWorkshop(foundWorkshop);

      // Load surveys for this workshop
      const surveys = await surveyService.getWorkshopSurveys(id!);
      let activeSurvey: any = surveys?.[0];
      
      if (!activeSurvey) {
        // Create a default survey if none exists
        const surveyId = await surveyService.createWorkshopSurvey(id!, {
          title: 'AI Readiness Ingestion',
          description: 'Standard protocol for evaluating organisational AI maturity.',
          status: 'draft'
        });
        activeSurvey = { id: surveyId, title: 'AI Readiness Ingestion', status: 'draft' };
      }
      setSurvey(activeSurvey);

      // Load questions and responses
      const [qs, resps] = await Promise.all([
        surveyService.getSurveyQuestions(id!, activeSurvey.id),
        surveyService.getResponses(id!, activeSurvey.id)
      ]);

      setQuestions(qs || []);
      setResponses(resps || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    await surveyService.addQuestion(id!, survey.id, {
      ...newQuestion,
      order_index: questions.length
    });
    setIsAddQModalOpen(false);
    loadAllData();
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    const slug = survey.public_slug || surveyService.createSlug(workshop.title);
    await surveyService.publishSurvey(id!, survey.id, slug, survey.access_code);
    setIsPublishing(false);
    loadAllData();
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Delete this question? Existing response answers are kept, but the question will no longer appear publicly.')) return;
    await surveyService.deleteQuestion(id!, survey.id, questionId);
    loadAllData();
  };

  const handleDeleteEvent = async () => {
    if (!confirm('Delete this event, its questions, responses, and analysis records? This cannot be undone.')) return;
    await surveyService.deleteWorkshop(id!);
    navigate('/admin/workshops');
  };

  const handleAnalyzeAll = async () => {
    setIsAnalyzingAll(true);
    try {
      const result = await aiService.generateAnalysis(responses);
      await surveyService.saveAnalysisRun(id!, result, 'summary');
      setAnalysisResult(result);
      setActiveTab('intelligence');
    } catch (err) {
      alert('Analysis failed');
    } finally {
      setIsAnalyzingAll(false);
    }
  };

  const handleAnalyzeIndividual = async (response: any) => {
    setAnalyzingResponseId(response.id);
    try {
      const analysis = await aiService.analyzeSingleResponse(response, questions);
      await surveyService.saveAnalysisRun(id!, analysis, 'individual', response.id);
      setIndividualAnalyses(prev => ({ ...prev, [response.id]: analysis }));
    } catch (err) {
      alert('Individual analysis failed');
    } finally {
      setAnalyzingResponseId(null);
    }
  };

  const exportIndividualMarkdown = (response: any) => {
    const analysis = individualAnalyses[response.id];
    if (!analysis) return;
    const md = aiService.generateIndividualMarkdown(response, analysis);
    const name = response.respondent_name || 'anonymous';
    downloadFile(`response-${name.replace(/\s+/g, '-').toLowerCase()}.md`, md);
  };

  const exportSummaryMarkdown = () => {
    if (!analysisResult) return;
    const md = aiService.generateSummaryMarkdown(analysisResult, responses.length, workshop.customerName);
    downloadFile(`summary-${workshop.title.replace(/\s+/g, '-').toLowerCase()}.md`, md);
  };

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportResponsesExcel = () => {
    const questionById = Object.fromEntries(questions.map((q) => [q.id, q.text]));
    const rows = responses.map((response) => {
      const row: Record<string, any> = {
        Respondent: response.respondent_name || 'Anonymous',
        Email: response.respondent_email || '',
        Submitted: response.submitted_at,
      };

      Object.entries(response.answers || {}).forEach(([questionId, answer]) => {
        row[questionById[questionId] || questionId] = Array.isArray(answer) ? answer.join(', ') : answer;
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');
    XLSX.writeFile(workbook, `responses-${workshop.title.replace(/\s+/g, '-').toLowerCase()}.xlsx`);
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/survey4u/${survey.public_slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const publicUrl = survey?.public_slug ? `${window.location.origin}/survey4u/${survey.public_slug}` : '';

  if (loading) return <div className="p-20 text-center label-archival animate-pulse">Synchronising Node Data...</div>;
  if (!workshop) return <div className="p-20 text-center text-editorial-accent">Node Conflict: Record Not Found.</div>;

  return (
    <div className="p-10 md:p-16 max-w-7xl mx-auto space-y-16 pb-32">
       <header className="space-y-10 border-b border-editorial-border pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className={`text-[10px] uppercase font-sans tracking-widest font-bold px-2 py-0.5 border ${survey?.status === 'published' ? 'border-editorial-accent text-editorial-accent' : 'border-editorial-text opacity-40'}`}>
                {survey?.status || 'Draft'}
              </span>
              <span className="text-xs font-mono opacity-20">ID: {workshop.id.substring(0, 8)}</span>
            </div>
            <h1 className="text-6xl font-light tracking-tighter leading-none">{workshop.title}</h1>
            <p className="text-xl italic font-serif opacity-60">Entity: {workshop.customerName}</p>
          </div>
          <div className="flex gap-4">
             {survey?.status !== 'published' && (
                <button 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="btn-editorial bg-editorial-accent text-white border-editorial-accent h-12 px-8 flex items-center gap-2"
                >
                  {isPublishing ? 'Synchronising...' : 'Publish Event'} <Globe2 size={14} />
                </button>
             )}
             <button
              onClick={handleDeleteEvent}
              className="btn-editorial h-12 px-6 text-editorial-accent border-editorial-accent flex items-center gap-2"
             >
                Delete Event <Trash2 size={14} />
             </button>
          </div>
        </div>

        <nav className="flex gap-12 border-t border-editorial-border pt-8 font-sans text-xs uppercase tracking-widest font-bold">
           <button 
            onClick={() => setActiveTab('structure')}
            className={`pb-4 border-b-2 transition-all ${activeTab === 'structure' ? 'border-editorial-text opacity-100' : 'border-transparent opacity-30 hover:opacity-60'}`}
           >
            01 Structure
           </button>
           <button 
            onClick={() => setActiveTab('participation')}
            className={`pb-4 border-b-2 transition-all ${activeTab === 'participation' ? 'border-editorial-text opacity-100' : 'border-transparent opacity-30 hover:opacity-60'}`}
           >
            02 Participation
           </button>
           <button 
            onClick={() => setActiveTab('intelligence')}
            className={`pb-4 border-b-2 transition-all ${activeTab === 'intelligence' ? 'border-editorial-text opacity-100' : 'border-transparent opacity-30 hover:opacity-60'}`}
           >
            03 Intelligence
           </button>
        </nav>
      </header>

      <div className="min-h-[50vh]">
        {activeTab === 'structure' && (
          <div className="space-y-12">
            <section className="bg-editorial-text/[0.02] border border-editorial-border p-10 flex flex-col md:flex-row items-center justify-between gap-12">
               <div className="space-y-4 max-w-xl">
                  <h4 className="label-archival">Public Endpoint</h4>
                  <p className="text-sm font-sans italic opacity-60">Initialise the collection protocol by distributing the secure access link to participants.</p>
               </div>
               <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  {survey?.status === 'published' ? (
                    <div className="flex items-center gap-5">
                      <div className="bg-white p-2 border border-editorial-border">
                        <QRCodeSVG value={publicUrl} size={92} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-px bg-editorial-border h-12 border border-editorial-border">
                          <div className="bg-editorial-bg px-6 h-full flex items-center font-mono text-xs opacity-60">
                            /survey4u/{survey.public_slug}
                          </div>
                          <button onClick={copyToClipboard} className="bg-editorial-bg h-full px-4 hover:bg-editorial-text/[0.02] flex items-center justify-center">
                            {copied ? <Check size={14} className="text-editorial-accent" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="text-[10px] font-sans uppercase tracking-widest opacity-30">Scan or copy this QR link to share the survey.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-12 px-6 border border-dashed border-editorial-border flex items-center gap-3 label-archival opacity-40">
                      <Lock size={12} /> Endpoint Restricted
                    </div>
                  )}
                  {survey?.status === 'published' && (
                    <a href={`/survey4u/${survey.public_slug}`} target="_blank" rel="noreferrer" className="btn-editorial h-12 px-8 flex items-center gap-2">
                       Verify Access <ExternalLink size={12} />
                    </a>
                  )}
               </div>
            </section>

            <section className="space-y-8">
               <div className="flex items-end justify-between border-b border-editorial-border pb-6">
                  <div className="space-y-2">
                    <h4 className="label-archival">Logical Queries</h4>
                    <p className="text-xs font-sans opacity-40 uppercase tracking-widest font-bold">Constituent Data Definitions</p>
                  </div>
                  <button 
                    onClick={() => setIsAddQModalOpen(true)}
                    className="btn-editorial h-10 px-6 flex items-center gap-2 bg-editorial-text text-white text-[10px]"
                  >
                    <Plus size={14} /> Append Question
                  </button>
               </div>

               <div className="space-y-4">
                  {questions.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-editorial-border">
                      <p className="label-archival italic opacity-30">No queries defined. Append questions to begin ingestion.</p>
                    </div>
                  ) : (
                    questions.map((q, idx) => (
                      <div key={q.id} className="p-8 border border-editorial-border flex items-start justify-between group hover:border-editorial-text transition-all">
                        <div className="flex gap-8">
                          <span className="text-[10px] font-mono opacity-20 pt-1">0{idx + 1}</span>
                          <div className="space-y-3">
                            <span className="text-[9px] font-sans uppercase tracking-widest font-bold opacity-30 px-2 py-0.5 border border-editorial-border">
                              {q.type.replace('_', ' ')}
                            </span>
                            <h3 className="text-xl font-light tracking-tight">{q.text}</h3>
                            <p className="text-[10px] font-sans uppercase opacity-30 font-bold tracking-[0.2em]">{q.section || 'General'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity hover:text-editorial-accent"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
               </div>
            </section>
          </div>
        )}

        {activeTab === 'participation' && (
          <div className="space-y-12">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-editorial-border border border-editorial-border">
               <div className="bg-editorial-bg p-8 flex flex-col justify-between h-40">
                  <h5 className="label-archival text-[8px]">Ingestion Volume</h5>
                  <p className="text-5xl font-light tracking-tighter">{responses.length}</p>
               </div>
               <div className="bg-editorial-bg p-8 flex flex-col justify-between h-40">
                  <h5 className="label-archival text-[8px]">Last Commit</h5>
                  <p className="text-lg font-light italic">{responses.length > 0 ? new Date(responses[0].submitted_at).toLocaleDateString() : '---'}</p>
               </div>
               <div className="bg-editorial-bg p-8 flex flex-col justify-between h-40">
                  <h5 className="label-archival text-[8px]">Service Load</h5>
                  <p className="text-lg font-light font-sans uppercase tracking-widest flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" /> Optimal
                  </p>
               </div>
            </section>

            <section className="space-y-8">
               <div className="flex items-center justify-between border-b border-editorial-border pb-4">
                <h4 className="label-archival">Participant Inventory</h4>
                <button
                  onClick={exportResponsesExcel}
                  disabled={responses.length === 0}
                  className="btn-editorial h-10 px-5 flex items-center gap-2 disabled:opacity-30"
                >
                  Export Excel <FileDown size={14} />
                </button>
               </div>
               <div className="divide-y divide-editorial-border">
                  {responses.map((resp, idx) => (
                    <div key={resp.id} className="py-10 flex flex-col md:flex-row md:items-center justify-between gap-8 group">
                      <div className="flex items-start gap-12">
                        <span className="text-[10px] font-mono opacity-20 pt-1">0{idx + 1}</span>
                        <div className="space-y-2">
                           <h3 className="text-2xl font-light tracking-tight group-hover:text-editorial-accent transition-colors">
                            {resp.respondent_name}
                           </h3>
                           <p className="text-xs font-sans uppercase tracking-widest opacity-40 italic">{resp.respondent_email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8 pl-20 md:pl-0">
                        {individualAnalyses[resp.id] ? (
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold opacity-40">Literacy: {individualAnalyses[resp.id].literacyLevel}/5</span>
                            <button 
                              onClick={() => exportIndividualMarkdown(resp)}
                              className="text-[10px] font-sans uppercase tracking-widest font-bold border border-editorial-text/20 px-3 py-2 flex items-center gap-2 hover:bg-editorial-text hover:text-white transition-all"
                            >
                              Export .MD <FileDown size={14} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleAnalyzeIndividual(resp)}
                            disabled={analyzingResponseId === resp.id}
                            className="text-[10px] font-sans uppercase tracking-widest font-bold opacity-40 hover:opacity-100 flex items-center gap-2 transition-all"
                          >
                            {analyzingResponseId === resp.id ? (
                              <Activity size={14} className="animate-spin" />
                            ) : (
                              <BrainCircuit size={14} />
                            )}
                            Run Analysis
                          </button>
                        )}
                        <span className="text-[10px] font-mono opacity-20 uppercase">{new Date(resp.submitted_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
               </div>
            </section>
          </div>
        )}

        {activeTab === 'intelligence' && (
          <div className="space-y-16">
            {!analysisResult ? (
              <div className="py-32 text-center border border-dashed border-editorial-border space-y-8">
                <div className="flex flex-col items-center gap-6">
                   <div className="h-16 w-16 rounded-full border border-editorial-text/20 flex items-center justify-center italic text-4xl opacity-20">&dagger;</div>
                   <div className="space-y-2">
                    <p className="label-archival italic opacity-40 text-xl">Intelligence Cache Empty</p>
                    <p className="text-sm font-sans uppercase tracking-widest opacity-30 font-bold">Process Ingested Data To Generate Strategic Logic</p>
                   </div>
                </div>
                <button 
                  onClick={handleAnalyzeAll}
                  disabled={isAnalyzingAll}
                  className="btn-editorial bg-editorial-text text-white h-12 px-12 flex items-center gap-4 mx-auto"
                >
                  {isAnalyzingAll ? (
                    <Activity size={16} className="animate-spin" />
                  ) : (
                    <BrainCircuit size={16} />
                  )}
                  Synchronise Intelligence
                </button>
              </div>
            ) : (
              <section className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <header className="flex justify-between items-end border-b border-editorial-border pb-12">
                  <div className="space-y-4">
                    <h4 className="label-archival">Heuristic Deployment Plan</h4>
                    <h2 className="text-5xl font-light tracking-tighter">Strategic Narrative</h2>
                  </div>
                  <button 
                    onClick={exportSummaryMarkdown}
                    className="btn-editorial h-12 px-8 bg-editorial-text text-white flex items-center gap-3"
                  >
                    Export Dossier <FileDown size={16} />
                  </button>
                </header>

                <div className="bg-editorial-text text-white p-16 space-y-10 relative overflow-hidden">
                  <Activity size={120} className="absolute -right-10 -bottom-10 text-white/[0.03] rotate-12" />
                  <div className="flex items-center gap-4 text-white/30">
                    <MessageSquare size={16} />
                    <span className="label-archival text-white/40">Executive Summary</span>
                  </div>
                  <p className="text-4xl md:text-5xl font-light italic leading-tight tracking-tight max-w-5xl relative z-10">
                    &ldquo;{analysisResult.executiveSummary}&rdquo;
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                  <div className="space-y-12">
                     <div className="space-y-4">
                        <h4 className="label-archival border-b border-editorial-border pb-4">Structural Themes</h4>
                        <p className="text-xs font-sans opacity-40 uppercase tracking-widest font-bold">Recurrent Patterns in Qualitative Ingestion</p>
                     </div>
                     <div className="space-y-10">
                        {analysisResult.themes.map((theme: any, i: number) => (
                           <div key={i} className="space-y-4 group">
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] font-mono opacity-20 underline decoration-editorial-accent/40 decoration-2 underline-offset-4">THEME_{i+1}</span>
                                <h3 className="text-2xl font-light tracking-tight italic underline decoration-editorial-border group-hover:decoration-editorial-text transition-all underline-offset-8 decoration-px">{theme.name}</h3>
                              </div>
                              <p className="text-sm font-sans leading-relaxed opacity-60 ml-14 font-serif">{theme.description}</p>
                              <div className="ml-14 pt-2 flex items-center gap-4 opacity-30 scale-90 origin-left">
                                 <div className="h-px w-8 bg-editorial-text" />
                                 <span className="text-[8px] font-sans uppercase tracking-[0.3em]">Evidence Count: {theme.evidenceCount}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-12">
                     <div className="space-y-4">
                        <h4 className="label-archival border-b border-editorial-border pb-4">Deployment Use Cases</h4>
                        <p className="text-xs font-sans opacity-40 uppercase tracking-widest font-bold">Identified Vectors for Applied Intelligence</p>
                     </div>
                     <div className="space-y-6">
                        {analysisResult.useCases.map((useCase: any, i: number) => (
                          <div key={i} className="p-8 border border-editorial-border space-y-6 hover:bg-editorial-text/[0.02] transition-colors relative overflow-hidden group">
                             <div className="absolute top-0 right-0 h-1 w-0 bg-editorial-accent group-hover:w-full transition-all duration-500" />
                             <div className="flex justify-between items-start">
                                <span className="text-[9px] font-sans uppercase tracking-[0.2em] font-bold opacity-30 italic">Priority: {useCase.priority}</span>
                                <span className="text-[8px] font-mono opacity-20">REF_CASE_{i}</span>
                             </div>
                             <h3 className="text-2xl font-light tracking-tight italic border-b border-editorial-border pb-4">{useCase.title}</h3>
                             <p className="text-sm font-serif opacity-60 leading-relaxed font-light">{useCase.description}</p>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>

                <div className="pt-24 space-y-12">
                   <div className="space-y-2">
                      <h4 className="label-archival">Strategic Directives</h4>
                      <div className="h-px w-32 bg-editorial-accent" />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-editorial-border border border-editorial-border">
                      {analysisResult.recommendations.map((rec: string, i: number) => (
                        <div key={i} className="bg-editorial-bg p-12 space-y-6 group hover:bg-editorial-text/[0.02] transition-colors">
                           <div className="h-10 w-10 border border-editorial-border flex items-center justify-center text-xs opacity-20 group-hover:opacity-100 group-hover:border-editorial-text transition-all font-mono italic">{i+1}</div>
                           <p className="text-xl font-light font-serif leading-relaxed italic opacity-80">{rec}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      {isAddQModalOpen && (
        <div className="fixed inset-0 bg-editorial-text/20 backdrop-blur-sm z-[100] flex items-center justify-center p-6 font-serif">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-editorial-bg border border-editorial-text max-w-xl w-full p-12 space-y-10 relative shadow-2xl"
          >
            <button 
              onClick={() => setIsAddQModalOpen(false)}
              className="absolute top-8 right-8 opacity-40 hover:opacity-100 transition-opacity"
            >
              <X size={20} />
            </button>
            <div className="space-y-2">
              <h4 className="label-archival">Query Configuration</h4>
              <h2 className="text-4xl font-light tracking-tighter italic font-serif">Append Objective</h2>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-8">
              <div className="space-y-1 border-b border-editorial-text/10 pb-2">
                <label className="label-archival text-[8px]">Inquiry Narrative</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-transparent text-xl font-light outline-none italic placeholder:opacity-20"
                  placeholder="e.g. Describe your current interface with AI tools."
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1 border-b border-editorial-text/10 pb-2">
                  <label className="label-archival text-[8px]">Logical Map (Section)</label>
                  <input 
                    type="text" 
                    className="w-full bg-transparent text-lg font-light outline-none"
                    placeholder="e.g. Technical Literacy"
                    value={newQuestion.section}
                    onChange={(e) => setNewQuestion({...newQuestion, section: e.target.value})}
                  />
                </div>
                <div className="space-y-1 border-b border-editorial-text/10 pb-2">
                  <label className="label-archival text-[8px]">Ingestion Format</label>
                  <select 
                    className="w-full bg-transparent text-lg font-light outline-none appearance-none font-serif cursor-pointer"
                    value={newQuestion.type}
                    onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value})}
                  >
                    <option value="long_text">Narrative (Long Text)</option>
                    <option value="short_text">Definition (Short Text)</option>
                    <option value="single_select">Variable (Single Select)</option>
                  </select>
                </div>
              </div>
              <div className="pt-6">
                <button 
                  type="submit"
                  className="btn-editorial bg-editorial-text text-white w-full py-4 text-xs tracking-[0.3em]"
                >
                  Append to Protocol
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
