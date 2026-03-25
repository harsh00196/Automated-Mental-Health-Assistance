import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Calendar, BookOpen, Settings, LogOut, HelpCircle, Cloud } from 'lucide-react';
import { useEffect } from 'react';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (location.pathname !== '/auth') navigate('/auth');
    }
  }, [navigate, location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const navItems = [
    { to: '/', icon: <Home size={22} />, label: 'Home' },
    { to: '/chat', icon: <MessageSquare size={22} />, label: 'Chat' },
    { to: '/tracker', icon: <Calendar size={22} />, label: 'Mood Tracker' },
    { to: '/resources', icon: <BookOpen size={22} />, label: 'Resources' },
    { to: '/profile', icon: <Settings size={22} />, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      
      {/* Sidebar Desktop */}
      <nav className="hidden md:flex flex-col w-[260px] bg-white h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 border-r border-gray-100/50">
        <div className="p-7 flex items-center space-x-3 mt-2">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Cloud size={20} fill="currentColor" />
          </div>
          <h1 className="text-[17px] font-bold text-gray-800 leading-tight">
            Automated Mental<br/><span className="text-gray-500 font-medium">Health Assistance</span>
          </h1>
        </div>
        
        <div className="flex-1 px-5 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#f4f7fe] text-primary font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary transition-colors'}`}>
                    {item.icon}
                  </div>
                  <span className="text-[15px]">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="px-5 py-6 space-y-1.5">
          <button onClick={() => navigate('/help')} className="flex items-center space-x-3.5 px-4 py-3.5 w-full rounded-2xl text-gray-500 hover:bg-gray-50 font-medium transition-all cursor-pointer group">
            <HelpCircle size={22} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            <span className="text-[15px]">Help</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3.5 px-4 py-3.5 w-full rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-500 font-medium transition-all cursor-pointer group"
          >
            <LogOut size={22} className="text-gray-400 group-hover:text-red-400 transition-colors" />
            <span className="text-[15px]">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 bg-background relative z-0">
        <div className="w-full h-full max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.05)] border-t border-gray-100 flex justify-around p-2 pb-safe z-50 rounded-t-3xl">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                isActive ? 'text-primary bg-[#f4f7fe]' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {item.icon}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
