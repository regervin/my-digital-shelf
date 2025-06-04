import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useState } from 'react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for mobile (off-canvas) */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-black/50" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
        <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border overflow-y-auto">
          <Sidebar closeSidebar={() => setSidebarOpen(false)} />
        </div>
      </div>
      
      {/* Sidebar for desktop (always visible) */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-64 border-r border-border bg-card">
          <Sidebar />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar openSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
