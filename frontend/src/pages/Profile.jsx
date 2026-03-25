import { useState, useEffect } from 'react';
import { User, Bell, Shield, LogOut, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [reminders, setReminders] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      setAnonymousMode(parsedUser.is_anonymous || false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const toggleAnonymousMode = () => setAnonymousMode(!anonymousMode);
  const toggleReminders = () => setReminders(!reminders);

  if (!user) return null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 pb-24 md:pb-8 font-sans">
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        {/* Soft decorative blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#A0C4FF]/20 to-[#BDB2FF]/20 rounded-full filter blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="w-24 h-24 bg-gradient-to-br from-[#A0C4FF] to-[#BDB2FF] rounded-[28px] flex items-center justify-center text-white shadow-[0_8px_30px_rgba(160,196,255,0.4)] border-4 border-white relative z-10 flex-shrink-0">
          <User size={38} strokeWidth={2.5} />
        </div>
        <div className="text-center sm:text-left relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">{user.username}</h1>
          <p className="text-gray-500 font-medium mt-1">{anonymousMode ? 'Guest Mode Active' : user.email}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#caffbf]/30 text-[#4ca642] rounded-full text-xs font-bold uppercase tracking-wider">
            <Check size={12} strokeWidth={3} /> Active Account
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="space-y-4 pt-2">
        <h3 className="text-lg font-bold text-gray-800 px-2 tracking-tight">Account Settings</h3>
        
        <div className="bg-white rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-50 overflow-hidden">
          
          <button className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-gray-50/50 transition-colors border-b border-gray-50 cursor-pointer group">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[#BDB2FF]/15 rounded-[18px] flex items-center justify-center text-[#9381ff] group-hover:scale-105 transition-transform">
                <User size={22} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="font-bold text-[16px] text-gray-800">Edit Profile</p>
                <p className="text-[13px] font-medium text-gray-500 mt-0.5">Change your name or email</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center border border-gray-100 group-hover:border-[#BDB2FF]/50 transition-colors shadow-sm">
                <ChevronRight size={18} className="text-gray-400 group-hover:text-[#9381ff]" strokeWidth={2.5} />
            </div>
          </button>
          
          <div className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-gray-50/50 transition-colors border-b border-gray-50 cursor-pointer group" onClick={toggleAnonymousMode}>
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[#CAFFBF]/30 rounded-[18px] flex items-center justify-center text-[#4ca642] group-hover:scale-105 transition-transform">
                <Shield size={22} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="font-bold text-[16px] text-gray-800">Anonymous Mode</p>
                <p className="text-[13px] font-medium text-gray-500 mt-0.5">Hide your identity</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
              <input type="checkbox" className="sr-only peer" checked={anonymousMode} readOnly />
              <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#4ca642]"></div>
            </label>
          </div>

          <div className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={toggleReminders}>
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[#FFADAD]/20 rounded-[18px] flex items-center justify-center text-[#e85f5f] group-hover:scale-105 transition-transform">
                <Bell size={22} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="font-bold text-[16px] text-gray-800">Daily Reminders</p>
                <p className="text-[13px] font-medium text-gray-500 mt-0.5">Get notified to log your mood</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
              <input type="checkbox" className="sr-only peer" checked={reminders} readOnly />
              <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#5a8bf1]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full bg-white border border-red-100 text-red-500 font-bold py-4.5 rounded-[24px] hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2.5 cursor-pointer mt-8 shadow-[0_4px_12px_rgba(232,95,95,0.05)]"
      >
        <LogOut size={20} strokeWidth={2.5} />
        Sign Out Securely
      </button>
      
      <p className="text-center text-[12px] font-medium text-gray-400 mt-8 tracking-wide">
        Automated Mental Health Assistant v2.0
      </p>
    </div>
  );
}
