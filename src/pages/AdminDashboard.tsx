import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Users, Activity, ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen bg-editorial-bg text-editorial-text">
      {/* Header */}
      <header className="border-b border-editorial-border bg-white">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight">Survey4U Admin</h1>
            <p className="text-sm font-sans opacity-50 mt-1">Welcome back, {session?.name}</p>
          </div>
          <Link
            to="/admin/create-event"
            className="btn-editorial bg-editorial-text text-white h-12 px-6 flex items-center gap-2"
          >
            <Plus size={16} />
            Create Event
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8 space-y-12">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-editorial-border border border-editorial-border">
          <div className="bg-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-archival text-[8px]">Total Events</p>
                <p className="text-4xl font-light mt-4">{stats.totalEvents}</p>
              </div>
              <Calendar size={20} className="opacity-20" />
            </div>
          </div>
          <div className="bg-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-archival text-[8px]">Published</p>
                <p className="text-4xl font-light mt-4">{stats.publishedEvents}</p>
              </div>
              <Activity size={20} className="opacity-20" />
            </div>
          </div>
          <div className="bg-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-archival text-[8px]">Drafts</p>
                <p className="text-4xl font-light mt-4">{stats.draftEvents}</p>
              </div>
              <Users size={20} className="opacity-20" />
            </div>
          </div>
        </div>

        {/* Events List */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-editorial-border pb-4">
            <h2 className="text-2xl font-light">Your Events</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <p className="label-archival animate-pulse">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="border border-dashed border-editorial-border bg-white p-16 text-center">
              <p className="text-lg opacity-50 mb-6">No events yet</p>
              <Link
                to="/admin/create-event"
                className="btn-editorial bg-editorial-text text-white inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-editorial-border border border-editorial-border bg-white">
              {events.map((event) => (
                <Link
                  key={event.id}
                  to={`/admin/events/${event.id}`}
                  className="flex items-center justify-between p-6 hover:bg-editorial-bg transition-colors group"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-medium mb-2">{event.title}</h3>
                    <p className="text-sm font-sans opacity-50">
                      {event.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className={`text-xs font-sans uppercase tracking-widest px-3 py-1 ${
                        event.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {event.status}
                      </span>
                      <span className="text-xs font-mono opacity-30">/{event.slug}</span>
                    </div>
                  </div>
                  <ChevronRight className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={20} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
