import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  ClipboardCheck, 
  Database,
  Users, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  Settings,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Shell() {
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, [location.pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Entities', path: '/admin/customers', icon: Users },
    { name: 'Workshops', path: '/admin/workshops', icon: ClipboardCheck },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  if (location.pathname.startsWith('/s/')) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text flex flex-col md:flex-row font-serif">
      {/* Mobile Header */}
      <div className="md:hidden bg-editorial-bg border-b border-editorial-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs tracking-[0.2em] font-sans font-bold uppercase border border-editorial-text px-2 py-1">Archivist</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-editorial-bg border-r border-editorial-border transform transition-transform duration-300 ease-in-out px-10 py-12 flex flex-col justify-between
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-12">
          {/* Logo / Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-editorial-text text-white flex items-center justify-center font-bold tracking-tighter text-xl">
                T
              </div>
              <div>
                <span className="text-xs tracking-[0.25em] font-sans font-bold uppercase block leading-none">Thorne</span>
                <span className="text-[9px] uppercase tracking-[0.1em] opacity-40">Archival Systems</span>
              </div>
            </div>
            <div className="h-px w-full bg-editorial-border" />
          </div>

          <nav className="space-y-8">
            <section>
              <h4 className="label-archival mb-6 opacity-30">Management</h4>
              <ul className="space-y-1 font-sans text-xs font-medium uppercase tracking-widest">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-4 py-3 px-2 group transition-all
                        ${location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path)) ? 'bg-editorial-text text-white shadow-lg' : 'opacity-60 hover:opacity-100 hover:bg-editorial-text/[0.03]'}
                      `}
                    >
                      <item.icon size={16} className={location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path)) ? 'text-white' : 'opacity-40 group-hover:opacity-100'} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="label-archival mb-6 opacity-30">Analytical Node</h4>
              <div className="space-y-3 text-[10px] font-sans uppercase tracking-widest opacity-60 bg-editorial-text/[0.02] p-4 border border-editorial-border">
                <p className="flex justify-between"><span>Status:</span> <span className="text-editorial-accent">{user ? 'Online' : 'Restricted'}</span></p>
                <p className="flex justify-between"><span>Region:</span> <span>Node-Alpha</span></p>
              </div>
            </section>
          </nav>
        </div>

        <div className="pt-10 border-t border-editorial-border">
          {user ? (
            <div className="flex items-center justify-between group cursor-pointer" onClick={handleSignOut}>
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 border border-editorial-border flex items-center justify-center text-lg italic bg-editorial-text/[0.02]">
                  &dagger;
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Terminate Session</span>
                  <span className="text-[9px] font-sans opacity-40 uppercase tracking-[0.1em] truncate w-32">{user.email}</span>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-3 group cursor-pointer">
              <div className="h-10 w-10 border border-editorial-border flex items-center justify-center text-lg italic">
                &dagger;
              </div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest underline decoration-transparent hover:decoration-current transition-all underline-offset-4">Initialise Auth</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Superior Navbar */}
        <header className="h-20 border-b border-editorial-border flex items-center justify-between px-10 bg-editorial-bg sticky top-0 z-40 hidden md:flex">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-[10px] uppercase tracking-[0.4em] font-sans opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2">
               <Database size={12} /> Return to Public Node
            </Link>
          </div>
          <div className="flex items-center gap-6">
             <div className="h-2 w-2 rounded-full bg-editorial-accent animate-pulse" />
             <span className="text-[10px] uppercase font-sans tracking-widest opacity-40">{new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-editorial-bg">
          <Outlet />
          
          {/* Universal Footer */}
          <footer className="border-t border-editorial-border py-16 px-10 flex flex-col md:flex-row items-center justify-between gap-12 bg-editorial-text/[0.01] mt-32">
            <div className="space-y-3 flex flex-col items-center md:items-start text-center md:text-left">
              <p className="text-[11px] uppercase tracking-[0.5em] font-bold">Thorne & Co.</p>
              <p className="text-[9px] font-sans opacity-30 uppercase tracking-[0.2em] font-medium">&copy; 2024 Thorne Archival Data Systems. Enterprise Intelligence Node.</p>
            </div>
            <div className="flex gap-12 text-[10px] uppercase tracking-[0.3em] font-bold opacity-30">
               <a href="#" className="hover:opacity-100 transition-opacity">Protocol</a>
               <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
               <a href="#" className="hover:opacity-100 transition-opacity">Endpoint</a>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-editorial-text/10 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
