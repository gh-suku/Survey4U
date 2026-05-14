import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, TrendingUp, FileText, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { getEvents, getAdminSession } from '../lib/api';
import type { Event } from '../types';

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const session = getAdminSession();

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const stats = {
    totalEvents: events.length,
    publishedEvents: events.filter(e => e.status === 'published').length,
    draftEvents: events.filter(e => e.status === 'draft').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6366f1]/5 to-[#ec4899]/5">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-[#e2e8f0] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6366f1] to-[#ec4899] rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles size={20} className="text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold">Survey4U Admin</h1>
              </div>
              <p className="text-[#64748b]">Welcome back, <span className="font-semibold text-[#6366f1]">{session?.name}</span> 👋</p>
            </div>
            <Link
              to="/admin/create-event"
              className="btn-primary h-12 px-6 flex items-center justify-center gap-2 shadow-lg shadow-[#6366f1]/30"
            >
              <Plus size={20} />
              <span>Create Event</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6"
        >
          <div className="card p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#6366f1]/10 rounded-xl flex items-center justify-center">
                <Calendar size={24} className="text-[#6366f1]" />
              </div>
              <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Total</span>
            </div>
            <p className="text-4xl font-display font-bold text-[#1e293b]">{stats.totalEvents}</p>
            <p className="text-sm text-[#64748b] mt-1">Total Events</p>
          </div>
          
          <div className="card p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#10b981]/10 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} className="text-[#10b981]" />
              </div>
              <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Live</span>
            </div>
            <p className="text-4xl font-display font-bold text-[#1e293b]">{stats.publishedEvents}</p>
            <p className="text-sm text-[#64748b] mt-1">Published</p>
          </div>
          
          <div className="card p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#f59e0b]/10 rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-[#f59e0b]" />
              </div>
              <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Pending</span>
            </div>
            <p className="text-4xl font-display font-bold text-[#1e293b]">{stats.draftEvents}</p>
            <p className="text-sm text-[#64748b] mt-1">Drafts</p>
          </div>
        </motion.div>

        {/* Events List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold">Your Events</h2>
          </div>

          {isLoading ? (
            <div className="card p-20 text-center">
              <div className="animate-pulse space-y-3">
                <div className="w-12 h-12 bg-[#6366f1]/20 rounded-xl mx-auto"></div>
                <p className="text-[#64748b] font-semibold">Loading events...</p>
              </div>
            </div>
          ) : events.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-16 text-center space-y-6"
            >
              <div className="text-6xl">📋</div>
              <div className="space-y-2">
                <p className="text-xl font-display font-semibold text-[#64748b]">No events yet</p>
                <p className="text-sm text-[#64748b]">Create your first survey event to get started!</p>
              </div>
              <Link
                to="/admin/create-event"
                className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-[#6366f1]/30"
              >
                <Plus size={20} />
                <span>Create Your First Event</span>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/admin/events/${event.id}`}
                    className="card p-6 flex items-center justify-between hover:shadow-lg hover:scale-[1.02] transition-all group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-display font-semibold group-hover:text-[#6366f1] transition-colors">
                          {event.title}
                        </h3>
                        <span className={`badge ${
                          event.status === 'published' 
                            ? 'bg-[#10b981]/10 text-[#10b981]' 
                            : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                        }`}>
                          {event.status === 'published' ? '✓ Published' : '⏳ Draft'}
                        </span>
                      </div>
                      <p className="text-sm text-[#64748b] mb-3">
                        {event.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[#64748b] bg-[#f8fafc] px-3 py-1 rounded-lg">
                          /{event.slug}
                        </span>
                      </div>
                    </div>
                    <ChevronRight 
                      className="text-[#64748b] group-hover:text-[#6366f1] group-hover:translate-x-1 transition-all" 
                      size={24} 
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
