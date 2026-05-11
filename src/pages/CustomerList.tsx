import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Building2, 
  Search, 
  MoreVertical, 
  MapPin, 
  Globe2,
  ChevronRight,
  X
} from 'lucide-react';
import { surveyService } from '../lib/surveyService';
import { Link } from 'react-router-dom';

export default function CustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', industry: '', region: '', notes: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    const data = await surveyService.getCustomers();
    setCustomers(data || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await surveyService.createCustomer(newCustomer);
    setIsModalOpen(false);
    setNewCustomer({ name: '', industry: '', region: '', notes: '' });
    loadCustomers();
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-10 md:p-16 max-w-7xl mx-auto space-y-16">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-editorial-border">
        <div className="space-y-4">
          <h4 className="label-archival">Customer Directory</h4>
          <h1 className="text-6xl md:text-7xl font-light tracking-tighter leading-none">
            Entity <br/>
            <span className="italic font-serif ml-12">Registry</span>
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" size={16} />
            <input 
              type="text"
              placeholder="Search Entities..."
              className="pl-12 pr-6 py-3 border border-editorial-border font-sans text-xs uppercase tracking-widest focus:border-editorial-text outline-none w-full sm:w-64 bg-transparent transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-editorial bg-editorial-text text-white h-12 flex items-center justify-center gap-3 px-8"
          >
            <Plus size={14} /> Register Entity
          </button>
        </div>
      </header>

      {loading ? (
        <div className="p-20 text-center animate-pulse">
           <span className="label-archival">Retrieving Records...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredCustomers.map((customer, idx) => (
            <div 
              key={customer.id} 
              className="group border border-editorial-border p-8 hover:border-editorial-text transition-all space-y-8 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono opacity-20">REF: {customer.id.substring(0, 8)}</span>
                  <div className="h-2 w-2 rounded-full bg-editorial-accent opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-3xl font-light tracking-tight leading-snug underline decoration-transparent group-hover:decoration-editorial-text/20 underline-offset-8 transition-all">
                  {customer.name}
                </h3>
                <p className="text-xs font-sans uppercase tracking-[0.15em] opacity-40 italic">{customer.industry || 'General Sector'}</p>
              </div>

              <div className="pt-8 border-t border-editorial-border flex items-center justify-between text-[10px] font-sans uppercase tracking-widest opacity-60">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 ">
                    <Globe2 size={10} />
                    <span>{customer.region || 'GLOBAL'}</span>
                  </div>
                </div>
                <Link to={`/admin/workshops/new?customer=${customer.id}`} className="hover:text-editorial-accent flex items-center gap-2">
                   Create Event <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          ))}
          {filteredCustomers.length === 0 && (
            <div className="col-span-full py-32 text-center border border-dashed border-editorial-border bg-editorial-text/[0.02]">
              <p className="label-archival italic">No matching records found in the archive.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-editorial-text/20 backdrop-blur-sm z-[100] flex items-center justify-center p-6 font-serif">
          <div className="bg-editorial-bg border border-editorial-text max-w-xl w-full p-12 space-y-10 relative shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 opacity-40 hover:opacity-100 transition-opacity"
            >
              <X size={20} />
            </button>
            <div className="space-y-2">
              <h4 className="label-archival">Entity Registration</h4>
              <h2 className="text-4xl font-light tracking-tighter">Initialisation</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-8">
              <div className="space-y-1 border-b border-editorial-text/10 pb-2">
                <label className="label-archival text-[8px]">Legal Entity Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-transparent text-xl font-light outline-none"
                  placeholder="e.g. Acme Corp"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1 border-b border-editorial-text/10 pb-2">
                  <label className="label-archival text-[8px]">Industry Sector</label>
                  <input 
                    type="text" 
                    className="w-full bg-transparent text-lg font-light outline-none"
                    placeholder="e.g. Media"
                    value={newCustomer.industry}
                    onChange={(e) => setNewCustomer({...newCustomer, industry: e.target.value})}
                  />
                </div>
                <div className="space-y-1 border-b border-editorial-text/10 pb-2">
                  <label className="label-archival text-[8px]">Geo Region</label>
                  <input 
                    type="text" 
                    className="w-full bg-transparent text-lg font-light outline-none"
                    placeholder="e.g. EMEA"
                    value={newCustomer.region}
                    onChange={(e) => setNewCustomer({...newCustomer, region: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1 border-b border-editorial-text/10 pb-2">
                <label className="label-archival text-[8px]">Metadata/Notes</label>
                <textarea 
                  className="w-full bg-transparent text-lg font-light outline-none h-24 resize-none"
                  placeholder="Additional context..."
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                />
              </div>
              <div className="pt-6">
                <button 
                  type="submit"
                  className="btn-editorial bg-editorial-text text-white w-full py-4 text-xs tracking-[0.3em]"
                >
                  Commit to Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
