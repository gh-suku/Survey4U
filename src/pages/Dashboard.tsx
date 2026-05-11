import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  ChevronRight, 
  Users, 
  Activity, 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { surveyService } from '../lib/surveyService';

export default function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    workshops: 0,
    activeSurveys: 0,
    totalResponses: 0
  });
  const [recentWorkshops, setRecentWorkshops] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      const [customers, workshops] = await Promise.all([
        surveyService.getCustomers(),
        surveyService.getAllWorkshops(),
      ]);
      setStats({
        customers: customers?.length || 0,
        workshops: workshops?.length || 0,
        activeSurveys: workshops?.filter((w: any) => w.event_status === 'published').length || 0,
        totalResponses: 0,
      });
      setRecentWorkshops((workshops || []).slice(0, 5));
    }
    loadStats();
  }, []);

  return (
    <div className="p-10 md:p-16 max-w-7xl mx-auto space-y-16">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-editorial-border">
        <div className="space-y-4">
          <h4 className="label-archival">Summary Dashboard</h4>
          <h1 className="text-6xl md:text-7xl font-light tracking-tighter leading-tight">
            Structural <br/>
            <span className="italic font-serif ml-12">Readiness</span>
          </h1>
        </div>
        <div className="flex gap-4">
          <Link to="/admin/workshops/new" className="btn-editorial bg-editorial-text text-white">
            Create Protocol
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-editorial-border border border-editorial-border">
        {[
          { label: 'Active Nodes', value: stats.customers, icon: Building2 },
          { label: 'Total Volume', value: stats.workshops, icon: Calendar },
          { label: 'Active Signals', value: stats.activeSurveys, icon: Activity },
          { label: 'Ingested Data', value: stats.totalResponses, icon: Users },
        ].map((stat, i) => (
          <div key={i} className="bg-editorial-bg p-8 flex flex-col justify-between h-40">
            <h5 className="label-archival text-[8px]">{stat.label}</h5>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-light tabular-nums">{stat.value}</span>
              <stat.icon size={16} className="opacity-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Recent Workshops */}
        <section className="lg:col-span-8 space-y-8">
          <div className="flex items-baseline justify-between border-b border-editorial-border pb-4">
            <h4 className="label-archival">Recent Deployments</h4>
            <Link to="/admin/workshops" className="text-[10px] font-sans uppercase tracking-widest hover:opacity-50 transition-opacity">View All</Link>
          </div>
          
          <div className="divide-y divide-editorial-border">
            {recentWorkshops.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-editorial-border">
                <p className="label-archival italic opacity-30">No events yet.</p>
              </div>
            ) : recentWorkshops.map((workshop, idx) => (
              <Link 
                key={workshop.id} 
                to={`/admin/workshops/${workshop.id}`}
                className="flex items-center justify-between py-6 group"
              >
                <div className="flex items-baseline gap-6">
                  <span className="text-xs font-mono opacity-30">0{idx + 1}</span>
                  <div>
                    <h3 className="text-xl font-medium underline decoration-editorial-text/10 underline-offset-8 group-hover:decoration-editorial-text transition-all">
                      {workshop.title}
                    </h3>
                    <p className="text-xs font-sans uppercase tracking-widest opacity-50 mt-3">
                      {workshop.customerName || 'Entity'} - {workshop.workshop_date || 'No date'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                   <div className="text-right hidden sm:block">
                    <p className="text-lg font-light font-mono leading-none">{workshop.event_status}</p>
                    <p className="label-archival text-[7px] mt-1">Status</p>
                  </div>
                  <ChevronRight className="opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1" size={18} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Task Log */}
        <section className="lg:col-span-4 space-y-8">
          <h4 className="label-archival border-b border-editorial-border pb-4">Protocol Log</h4>
          <div className="space-y-6">
            {[
              { title: 'Publish survey for Globex', meta: 'Protocol: Alpha-7', status: 'Immediate' },
              { title: 'Review Report for Acme', meta: 'Status: Pending Review', status: 'Deferred' },
              { title: 'Update Master Template', meta: 'Version: 2.4.1', status: 'Queued' }
            ].map((task, i) => (
              <div key={i} className="space-y-2 border-l-2 border-editorial-text/10 pl-6 py-1">
                <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-editorial-accent">
                  {task.status}
                </span>
                <h3 className="font-medium text-lg leading-snug">{task.title}</h3>
                <p className="text-[10px] font-sans opacity-50 uppercase tracking-widest">{task.meta}</p>
              </div>
            ))}
          </div>

          <div className="bg-editorial-text text-white p-8 mt-12 space-y-4">
             <h5 className="label-archival text-white/40 border-b border-white/10 pb-2">Archival Note</h5>
             <p className="text-xs italic leading-relaxed opacity-80">
               "System integrity relies on the continuous validation of participant intent across all active nodes."
             </p>
          </div>
        </section>
      </div>
    </div>
  );
}
