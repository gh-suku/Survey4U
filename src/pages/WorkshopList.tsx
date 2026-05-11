import React, { useState, useEffect } from 'react';
import { 
  Filter, 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { surveyService } from '../lib/surveyService';

export default function WorkshopList() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllWorkshops() {
      const all = await surveyService.getAllWorkshops();
      setWorkshops(all || []);
      setLoading(false);
    }
    loadAllWorkshops();
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
      case 'published': return <span className="text-editorial-accent italic">Published</span>;
      case 'completed':
      case 'closed': return <span className="opacity-40">Closed</span>;
      default: return <span className="opacity-60 italic">Draft Protocol</span>;
    }
  };

  return (
    <div className="p-10 md:p-16 max-w-7xl mx-auto space-y-16">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-editorial-border">
        <div className="space-y-4">
          <h4 className="label-archival">Engagement Log</h4>
          <h1 className="text-6xl md:text-7xl font-light tracking-tighter leading-none">
            Workshop <br/>
            <span className="italic font-serif ml-12">Inventory</span>
          </h1>
        </div>
        <div className="flex gap-4">
          <button className="h-12 px-6 border border-editorial-border text-[10px] uppercase tracking-widest font-sans flex items-center gap-2 hover:border-editorial-text transition-colors bg-transparent">
            <Filter size={14} className="opacity-40" />
            Category Filter
          </button>
          <Link 
            to="/admin/workshops/new"
            className="btn-editorial bg-editorial-text text-white h-12 flex items-center justify-center px-8"
          >
            Create Event
          </Link>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans border-collapse">
          <thead>
            <tr className="border-b border-editorial-text/10">
              <th className="py-8 px-4 label-archival text-[10px] opacity-40">ID NO.</th>
              <th className="py-8 px-4 label-archival text-[10px] font-sans">Title / Objective</th>
              <th className="py-8 px-4 label-archival text-[10px] font-sans">Entity</th>
              <th className="py-8 px-4 label-archival text-[10px] font-sans text-center">Status</th>
              <th className="py-8 px-4 label-archival text-[10px] font-sans text-right">Commit Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-editorial-border">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="py-12 bg-editorial-text/[0.01]"></td>
                </tr>
              ))
            ) : workshops.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-32 text-center">
                  <p className="label-archival italic opacity-30">Archive empty. Initiate protocols to populate.</p>
                </td>
              </tr>
            ) : workshops.map((workshop, idx) => (
              <tr key={workshop.id} className="group hover:bg-editorial-text/[0.02] transition-colors">
                <td className="py-10 px-4 font-mono text-[10px] opacity-20 align-top pt-11">
                  0{idx + 1}
                </td>
                <td className="py-10 px-4 align-top">
                  <Link to={`/admin/workshops/${workshop.id}`} className="space-y-2 block">
                    <h3 className="text-2xl font-light tracking-tight group-hover:underline underline-offset-4 decoration-editorial-accent/20 transition-all">
                      {workshop.title}
                    </h3>
                    <p className="text-xs opacity-50 font-serif italic max-w-md line-clamp-1">
                      {workshop.objective || 'Objective undefined'}
                    </p>
                  </Link>
                </td>
                <td className="py-10 px-4 align-top">
                  <span className="text-[10px] uppercase tracking-widest font-sans opacity-60">
                    {workshop.customerName}
                  </span>
                </td>
                <td className="py-10 px-4 align-top text-center">
                  <div className="text-[10px] uppercase tracking-widest font-sans font-medium">
                    {getStatusLabel(workshop.status)}
                  </div>
                </td>
                <td className="py-10 px-4 align-top text-right">
                  <span className="text-[10px] font-mono opacity-40">
                    {workshop.workshop_date ? new Date(workshop.workshop_date).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }) : '---'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="pt-24 opacity-10 flex flex-col items-center gap-8">
        <div className="h-24 w-px bg-editorial-text" />
        <span className="text-[8px] tracking-[1em] uppercase">End of Records</span>
      </footer>
    </div>
  );
}
