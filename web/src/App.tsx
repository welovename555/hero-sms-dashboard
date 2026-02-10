import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Tag, Hash, MessageSquare, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Pages
import Dashboard from './pages/Dashboard';
import Prices from './pages/Prices';
import Numbers from './pages/Numbers';
import Messages from './pages/Messages';
import SettingsPage from './pages/Settings';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
      active ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Sidebar = ({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) => {
  const location = useLocation();
  
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={toggle}
        />
      )}
      
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 w-64 bg-gray-900 text-white z-50 transition-transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-400">Hero-SMS</h1>
          <button onClick={toggle} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="px-4 space-y-2">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <SidebarItem to="/prices" icon={Tag} label="Prices" active={location.pathname === '/prices'} />
          <SidebarItem to="/numbers" icon={Hash} label="Numbers" active={location.pathname === '/numbers'} />
          <SidebarItem to="/messages" icon={MessageSquare} label="Messages" active={location.pathname === '/messages'} />
          <SidebarItem to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} />
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            © 2026 Hero-SMS Dashboard
          </p>
        </div>
      </aside>
    </>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="lg:ml-64 min-h-screen">
          <header className="h-16 border-b bg-white dark:bg-gray-900 dark:border-gray-800 flex items-center px-6 lg:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500">
              <Menu size={24} />
            </button>
            <span className="ml-4 font-bold text-blue-500">Hero-SMS</span>
          </header>
          
          <div className="p-6 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/prices" element={<Prices />} />
              <Route path="/numbers" element={<Numbers />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </main>
        
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
