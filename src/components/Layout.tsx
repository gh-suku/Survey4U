import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Settings, 
  Menu, 
  X,
  Database,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Entities', icon: Building2, path: '/customers' },
    { name: 'Workshops', icon: ClipboardList, path: '/workshops' },
  ];

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text font-serif flex">
      {/* Sidebar - Desktop */}
      <aside 
        className={`bg-editorial-bg border-r border-editorial-border transition-all duration-500 overflow-hidden hidden md:flex flex-col
          ${isSidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        <div className="h-20 flex items-center px-6 border-b border-editorial-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-editorial-text text-white flex items-center justify-center font-bold tracking-tighter">
              T&C
            </div>
            {isSidebarOpen && <span className="text-xs uppercase tracking-[0.3em] font-bold">Thorne</span>}
          </div>
        </div>

        <nav className="flex-1 py-10 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name}
                to={item.path}
                className={`
                  flex items-center gap-4 px-4 py-4 transition-all group
                  ${isActive ? 'bg-editorial-text text-white shadow-xl' : 'hover:bg-editorial-text/[0.03] opacity-60 hover:opacity-100'}
                `}
              >
                <item.icon size={18} className={isActive ? 'text-white' : 'opacity-40 group-hover:opacity-100'} />
                {isSidebarOpen && <span className="text-[10px] uppercase tracking-widest font-bold">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-editorial-border space-y-4">
          <div className="flex items-center gap-3 opacity-40">
             <Database size={14} />
             {isSidebarOpen && <span className="text-[8px] uppercase tracking-widest font-mono">Archive v2.4</span>}
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full py-2 border border-editorial-border hover:border-editorial-text transition-colors flex items-center justify-center"
          >
             {isSidebarOpen ? <X size={12} /> : <Menu size={12} />}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="h-20 border-b border-editorial-border flex items-center justify-between px-10 bg-editorial-bg sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <h4 className="label-archival text-[8px] opacity-40 hidden sm:block">Intelligent Archive Management System</h4>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden sm:flex items-center gap-4">
               <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest font-bold">Administrator</p>
                  <p className="text-[9px] font-mono opacity-40">node-alpha-7</p>
               </div>
               <div className="h-10 w-10 border border-editorial-border bg-editorial-text/[0.02] flex items-center justify-center italic text-xl">
                 &dagger;
               </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 relative">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-editorial-border py-12 px-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-editorial-text/[0.02] mt-auto">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold">Thorne & Co. Enterprise</p>
            <p className="text-[9px] font-sans opacity-40 uppercase tracking-widest italic">&copy; 2024 Archival Data Systems. All Rights Reserved.</p>
          </div>
          <div className="flex gap-12 text-[9px] uppercase tracking-widest font-bold opacity-40">
             <a href="#" className="hover:opacity-100 transition-opacity">Protocol</a>
             <a href="#" className="hover:opacity-100 transition-opacity">Compliance</a>
             <a href="#" className="hover:opacity-100 transition-opacity">Support</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
