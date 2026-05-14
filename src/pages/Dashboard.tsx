import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  ChevronRight, 
  Users, 
  Activity,
  Plus,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { surveyService } from '../lib/surveyService';
import { motion } from 'motion/react';

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

  const statCards = [
    { 
      label: 'Total Customers', 
      value: stats.customers, 
      icon: Building2, 
      color: 'from-[#6366f1] to-[#8b5cf6]',
      bgColor: 'bg-[#6366f1]/10',
      textColor: 'text-[#6366f1]'
    },
    { 
      label: 'Total Workshops', 
      value: stats.workshops, 
      icon: Calendar, 
      color: 'from-[#ec4899] to-[#f43f5e]',
      bgColor: 'bg-[#ec4899]/10',
      textColor: 'text-[#ec4899]'
    },
    { 
      label: 'Active Surveys', 
      value: stats.activeSurveys, 
      icon: Activity, 
      color: 'from-[#10b981] to-[#06b6d4]',
      bgColor: 'bg-[#10b981]/10',
      textColor: 'text-[#10b981]'
    },
    { 
      label: 'Total Responses', 
      value: stats.totalResponses, 
      icon: Users, 
      color: 'from-[#f59e0b] to-[#ef4444]',
      bgColor: 'bg-[#f59e0b]/10',
      textColor: 'text-[#f59e0b]'
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-lg text-[#64748b]">
              Here's what's happening with your surveys today
            </p>
          </div>
          <Link 
            to="/admin/workshops/new" 
            className="btn-primary flex items-center gap-2 shadow-xl shadow-[#6366f1]/30"
          >
            <Plus size={20} />
            <span>Create Workshop</span>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-hover p-6 relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <stat.icon size={24} className={stat.textColor} />
                  </div>
                  <TrendingUp size={16} className="text-[#10b981]" />
                </div>
                
                <div>
                  <p className="text-3xl font-display font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-[#64748b] font-medium">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Workshops */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 md:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#6366f1]/10 rounded-xl flex items-center justify-center">
                <BarChart3 size={20} className="text-[#6366f1]" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">Recent Workshops</h2>
                <p className="text-sm text-[#64748b]">Your latest survey events</p>
              </div>
            </div>
            <Link 
              to="/admin/workshops" 
              className="text-sm font-semibold text-[#6366f1] hover:text-[#4f46e5] transition-colors flex items-center gap-1"
            >
              View All
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentWorkshops.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-[#e2e8f0] rounded-xl">
                <div className="w-16 h-16 bg-[#f1f5f9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={24} className="text-[#94a3b8]" />
                </div>
                <p className="text-[#64748b] font-medium mb-2">No workshops yet</p>
                <p className="text-sm text-[#94a3b8] mb-4">Create your first workshop to get started</p>
                <Link to="/admin/workshops/new" className="btn-primary inline-flex items-center gap-2">
                  <Plus size={16} />
                  <span>Create Workshop</span>
                </Link>
              </div>
            ) : (
              recentWorkshops.map((workshop, idx) => (
                <Link
                  key={workshop.id}
                  to={`/admin/workshops/${workshop.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#f9fafb] transition-all group border border-transparent hover:border-[#e2e8f0]"
                >
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-[#6366f1]/30">
                    {idx + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-[#6366f1] transition-colors">
                      {workshop.title}
                    </h3>
                    <p className="text-sm text-[#64748b]">
                      {workshop.customerName || 'No customer'} • {workshop.workshop_date || 'No date'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`badge ${
                      workshop.event_status === 'published' 
                        ? 'badge-success' 
                        : workshop.event_status === 'draft'
                        ? 'badge-warning'
                        : 'bg-[#64748b]/10 text-[#64748b]'
                    }`}>
                      {workshop.event_status}
                    </span>
                    <ChevronRight size={20} className="text-[#94a3b8] group-hover:text-[#6366f1] group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Link to="/admin/workshops/new" className="card-hover p-6 group">
            <div className="w-12 h-12 bg-[#6366f1]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus size={24} className="text-[#6366f1]" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Create Workshop</h3>
            <p className="text-sm text-[#64748b]">Start a new survey event</p>
          </Link>

          <Link to="/admin/customers" className="card-hover p-6 group">
            <div className="w-12 h-12 bg-[#ec4899]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} className="text-[#ec4899]" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Manage Customers</h3>
            <p className="text-sm text-[#64748b]">View and edit customer list</p>
          </Link>

          <Link to="/admin/settings" className="card-hover p-6 group">
            <div className="w-12 h-12 bg-[#10b981]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity size={24} className="text-[#10b981]" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">View Analytics</h3>
            <p className="text-sm text-[#64748b]">Check survey performance</p>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
