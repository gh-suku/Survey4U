import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  ClipboardCheck, 
  Home,
  Users, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  Settings,
  X,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

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
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Workshops', path: '/admin/workshops', icon: ClipboardCheck },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  if (location.pathname.startsWith('/s/')) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-[#e2e8f0] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg">Survey4U</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#e2e8f0] transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-[#e2e8f0]">
            <Link to="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-[#6366f1]/30 group-hover:scale-110 transition-transform">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl">Survey4U</h1>
                <p className="text-xs text-[#64748b]">Admin Portal</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                              (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all relative
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-[#6366f1]/30' 
                      : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]'}
                  `}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-[#e2e8f0]">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[#f9fafb] rounded-lg">
                  <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                    {user.email?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">Admin</p>
                    <p className="text-xs text-[#64748b] truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#ef4444] hover:bg-[#fef2f2] rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/admin/login" 
                className="btn-primary w-full text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 sticky top-0 z-40 hidden md:flex">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-sm font-medium text-[#64748b] hover:text-[#6366f1] transition-colors"
            >
              <Home size={16} />
              <span>Back to Home</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#10b981]/10 text-[#10b981] rounded-full text-xs font-semibold">
              <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
              <span>Online</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-[#e2e8f0] py-6 px-6 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#64748b]">
            <p>&copy; 2024 Survey4U. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#6366f1] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#6366f1] transition-colors">Terms</a>
              <a href="#" className="hover:text-[#6366f1] transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
