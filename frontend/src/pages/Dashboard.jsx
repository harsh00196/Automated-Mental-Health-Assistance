import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { format } from 'date-fns';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot
} from 'recharts';
import { Heart, FileText, Calendar as CalendarIcon, Phone, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moodLogged, setMoodLogged] = useState(false);
  const navigate = useNavigate();

  const moods = [
    { label: 'Stressed', emoji: '😫', color: '#ffadad', score: 0 },
    { label: 'Sad', emoji: '😔', color: '#a0c4ff', score: 33 },
    { label: 'Neutral', emoji: '😐', color: '#fdffb6', score: 66 },
    { label: 'Happy', emoji: '😊', color: '#caffbf', score: 100 },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/mood/analytics/weekly');
      setMoodData(data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = async (moodValue) => {
    try {
      await api.post('/mood/log', { mood: moodValue, note: '' });
      setMoodLogged(true);
      fetchAnalytics();
      setTimeout(() => setMoodLogged(false), 3000);
    } catch (err) {
      console.error('Failed to log mood', err);
    }
  };

  const getEmojiForScore = (score) => {
    if (score === null || score === undefined) return '';
    if (score >= 80) return '😊';
    if (score >= 50) return '😐';
    if (score >= 20) return '😔';
    return '😫';
  };

  // Custom tick for X Axis
  const CustomXAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#9ca3af" fontSize={12} className="font-medium">
          {payload.value}
        </text>
      </g>
    );
  };

  // Custom tick for Y Axis (showing face emojis instead of numbers)
  const CustomYAxisTick = ({ x, y, payload }) => {
    const emoji = getEmojiForScore(payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dx={-15} dy={5} textAnchor="middle" fontSize={16}>
          {emoji}
        </text>
      </g>
    );
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.score === null) return null;
    return (
      <circle cx={cx} cy={cy} r={5} fill="#ffffff" stroke="#5a8bf1" strokeWidth={3} className="drop-shadow-sm" />
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.score === null) return null;
      return (
        <div className="bg-white px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col items-center gap-1">
          <span className="text-3xl">{data.mood ? moods.find(m => m.label === data.mood)?.emoji : getEmojiForScore(data.score)}</span>
          <span className="text-sm font-bold text-gray-800">{data.mood}</span>
          <span className="text-[11px] text-gray-400 font-medium">{format(new Date(data.date), 'MMM d, yyyy')}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 pb-24 md:pb-8 font-sans">
      
      {/* Header & Emotion Toggles */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden">
        {/* Soft decorative blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex items-center gap-6 z-10 w-full">
          <div className="hidden sm:block">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Hi {user?.username?.split('_')[0] || 'there'} <span className="text-2xl">👋</span></h1>
            <p className="text-gray-500 mt-1.5 font-medium text-[15px]">How are you feeling today?</p>
          </div>

          <div className="flex-1">
            {moodLogged ? (
              <div className="flex items-center justify-center p-3 animate-pulse text-[#4ca642] bg-[#CAFFBF]/30 rounded-2xl gap-3">
                <CheckCircle2 size={24} className="animate-bounce" />
                <p className="font-semibold text-[15px]">Mood safely logged!</p>
              </div>
            ) : (
              <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-5 w-full">
                {moods.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => handleMoodSelect(m.label)}
                    className="w-14 h-14 sm:w-[68px] sm:h-[68px] flex items-center justify-center rounded-[20px] bg-gray-50 hover:bg-white transition-all border border-gray-100/50 shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:-translate-y-1 group cursor-pointer relative"
                  >
                    <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300">
                      {m.emoji}
                    </span>
                    <span className="absolute -bottom-6 text-[11px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-50">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-bold text-gray-800">Weekly Mood Tracker</h2>
          <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
          </button>
        </div>
        
        <div className="h-[280px] w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-400 font-medium">Loading timeline...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5a8bf1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#5a8bf1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={{ stroke: '#f1f5f9', strokeWidth: 2 }} tickLine={false} tick={<CustomXAxisTick />} />
                <YAxis dataKey="score" domain={[0, 100]} ticks={[0, 33, 66, 100]} axisLine={false} tickLine={false} tick={<CustomYAxisTick />} width={40} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent', stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }} />
                <Line 
                  type="monotoneX" 
                  dataKey="score" 
                  stroke="#5a8bf1" 
                  strokeWidth={4}
                  dot={<CustomDot />} 
                  activeDot={{ r: 8, fill: "#5a8bf1", stroke: "#ffffff", strokeWidth: 3, className: "drop-shadow-md" }}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Grid Cards Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <button onClick={() => navigate('/resources')} className="flex flex-col p-6 rounded-[32px] bg-white border border-gray-100 hover:border-[#a0c4ff]/50 shadow-[0_2px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_10px_30px_rgba(160,196,255,0.15)] transition-all cursor-pointer group relative overflow-hidden text-left h-48">
          <div className="w-14 h-14 bg-[#a0c4ff]/15 rounded-2xl flex items-center justify-center text-[#5a8bf1] mb-auto">
            <Heart size={26} fill="currentColor" className="opacity-80" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-gray-800 group-hover:text-[#5a8bf1] transition-colors leading-tight">Meditation</h3>
            <p className="text-[13px] font-medium text-gray-400 mt-1 line-clamp-2">Relax the mind. Guided tracks</p>
          </div>
          <div className="absolute right-6 bottom-6 w-8 h-8 bg-gray-50 group-hover:bg-[#5a8bf1] text-gray-400 group-hover:text-white rounded-full flex items-center justify-center transition-colors shadow-sm">
             <ArrowRight size={16} strokeWidth={2.5} />
          </div>
        </button>

        <button onClick={() => navigate('/tracker')} className="flex flex-col p-6 rounded-[32px] bg-white border border-gray-100 hover:border-[#caffbf]/70 shadow-[0_2px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_10px_30px_rgba(202,255,191,0.25)] transition-all cursor-pointer group relative overflow-hidden text-left h-48">
          <div className="w-14 h-14 bg-[#caffbf]/30 rounded-2xl flex items-center justify-center text-[#4ca642] mb-auto">
            <CalendarIcon size={26} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-gray-800 group-hover:text-[#4ca642] transition-colors leading-tight">Mood Tracker</h3>
            <p className="text-[13px] font-medium text-gray-400 mt-1 line-clamp-2">Reflect on your daily journey</p>
          </div>
          <div className="absolute right-6 bottom-6 w-8 h-8 bg-gray-50 group-hover:bg-[#4ca642] text-gray-400 group-hover:text-white rounded-full flex items-center justify-center transition-colors shadow-sm">
             <ArrowRight size={16} strokeWidth={2.5} />
          </div>
        </button>

        <button onClick={() => navigate('/resources')} className="flex flex-col p-6 rounded-[32px] bg-white border border-gray-100 hover:border-[#bdb2ff]/50 shadow-[0_2px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_10px_30px_rgba(189,178,255,0.15)] transition-all cursor-pointer group relative overflow-hidden text-left h-48">
          <div className="w-14 h-14 bg-[#bdb2ff]/15 rounded-2xl flex items-center justify-center text-[#8e7add] mb-auto">
            <FileText size={26} fill="currentColor" className="opacity-80" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-gray-800 group-hover:text-[#8e7add] transition-colors leading-tight">Useful Articles</h3>
            <p className="text-[13px] font-medium text-gray-400 mt-1 line-clamp-2">Learn to overcome mental blocks</p>
          </div>
          <div className="absolute right-6 bottom-6 w-8 h-8 bg-gray-50 group-hover:bg-[#8e7add] text-gray-400 group-hover:text-white rounded-full flex items-center justify-center transition-colors shadow-sm">
             <ArrowRight size={16} strokeWidth={2.5} />
          </div>
        </button>

        <button onClick={() => navigate('/help')} className="flex flex-col p-6 rounded-[32px] bg-white border border-red-50 hover:border-[#ffadad]/80 shadow-[0_2px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_10px_30px_rgba(255,173,173,0.3)] transition-all cursor-pointer group relative overflow-hidden text-left h-48">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 mb-auto">
            <Phone size={26} fill="currentColor" className="opacity-80" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-gray-800 group-hover:text-red-500 transition-colors leading-tight">Emergency Help</h3>
            <p className="text-[13px] font-medium text-gray-400 mt-1 line-clamp-2">Get immediate support if needed</p>
          </div>
          <div className="absolute right-6 bottom-6 w-8 h-8 bg-gray-50 group-hover:bg-red-500 text-gray-400 group-hover:text-white rounded-full flex items-center justify-center transition-colors shadow-sm">
             <ArrowRight size={16} strokeWidth={2.5} />
          </div>
        </button>

      </div>
    </div>
  );
}
