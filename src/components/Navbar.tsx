import { useAuth } from '../contexts/AuthContext';
import { FiMenu, FiBell, FiUser, FiLogOut } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  openSidebar: () => void;
}

const Navbar = ({ openSidebar }: NavbarProps) => {
  const { user, profile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side - Mobile menu button and Logo */}
        <div className="flex items-center">
          <button
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={openSidebar}
          >
            <FiMenu className="h-6 w-6" />
          </button>
          
          {/* Logo - visible on mobile and desktop */}
          <Link to="/dashboard" className="flex items-center ml-2 lg:ml-0">
            <img src="/logo.svg" alt="MyDigitalShelf" className="h-8" />
          </Link>
        </div>
        
        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 rounded-md text-muted-foreground hover:text-foreground">
            <FiBell className="h-5 w-5" />
          </button>
          
          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center space-x-2"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <FiUser className="h-4 w-4" />
              </div>
              <span className="hidden md:block font-medium">
                {profile?.full_name || user?.email}
              </span>
            </button>
            
            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
                <div className="p-3 border-b border-border">
                  <p className="font-medium">{profile?.full_name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent text-left"
                    onClick={() => signOut()}
                  >
                    <FiLogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
