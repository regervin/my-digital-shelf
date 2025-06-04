import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiPackage, 
  FiKey, 
  FiUsers, 
  FiShoppingCart, 
  FiDownload, 
  FiSettings,
  FiX,
  FiShield
} from 'react-icons/fi';

interface SidebarProps {
  closeSidebar?: () => void;
}

const Sidebar = ({ closeSidebar }: SidebarProps) => {
  const navItems = [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/products', icon: <FiPackage />, label: 'Products' },
    { to: '/licenses', icon: <FiKey />, label: 'Licenses' },
    { to: '/customers', icon: <FiUsers />, label: 'Customers' },
    { to: '/purchases', icon: <FiShoppingCart />, label: 'Purchases' },
    { to: '/downloads', icon: <FiDownload />, label: 'Downloads' },
    { to: '/settings', icon: <FiSettings />, label: 'Settings' },
    { to: '/auth-verification', icon: <FiShield />, label: 'Auth Verification' },
  ];
  
  return (
    <div className="h-full flex flex-col">
      {/* Logo and close button (mobile only) */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <div className="flex items-center">
          <img src="/logo.svg" alt="MyDigitalShelf Logo" className="h-8 mr-2" />
        </div>
        {closeSidebar && (
          <button 
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={closeSidebar}
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground hover:bg-accent'
              }`
            }
            onClick={closeSidebar}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <p>© 2023 MyDigitalShelf</p>
          <p>Version 0.1.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
