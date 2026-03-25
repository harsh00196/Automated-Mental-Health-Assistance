import { useState, useEffect } from 'react';
import api from '../api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';

export default function MoodTracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const moods = {
    'Happy': { emoji: '😊', bg: 'bg-[#caffbf]/40', border: 'border-[#caffbf]/60', text: 'text-[#4ca642]' },
    'Neutral': { emoji: '😐', bg: 'bg-[#fdffb6]/50', border: 'border-[#fdffb6]/80', text: 'text-[#d4c82b]' },
    'Sad': { emoji: '😔', bg: 'bg-[#a0c4ff]/30', border: 'border-[#a0c4ff]/50', text: 'text-[#5a8bf1]' },
    'Stressed': { emoji: '😫', bg: 'bg-[#ffadad]/30', border: 'border-[#ffadad]/50', text: 'text-[#e85f5f]' },
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/mood/history');
        setMoodHistory(data);
      } catch (err) {
        console.error('Failed to fetch mood history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDay = monthStart.getDay();
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const blanks = Array.from({ length: startDay }, (_, i) => null);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const getMoodForDay = (day) => {
    return moodHistory.find(log => isSameDay(parseISO(log.date), day));
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 pb-24 md:pb-8 font-sans">
      
      {/* Header */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#caffbf]/20 rounded-full filter blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex items-center gap-5 z-10 w-full">
          <div className="w-14 h-14 bg-[#caffbf]/30 rounded-[20px] flex items-center justify-center text-[#4ca642] flex-shrink-0">
            <CalendarIcon size={26} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Mood Calendar</h1>
            <p className="text-gray-500 mt-1 font-medium text-[15px]">Reflect on your emotional journey</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-50">
        
        {/* Calendar Controls */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 transition-colors shadow-sm cursor-pointer border border-gray-100">
              <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <button onClick={nextMonth} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 transition-colors shadow-sm cursor-pointer border border-gray-100">
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-3 sm:gap-4 mb-4 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-[11px] sm:text-[13px] font-bold text-gray-400 uppercase tracking-widest">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="h-[400px] flex items-center justify-center text-gray-400 font-medium">Loading calendar...</div>
        ) : (
          <div className="grid grid-cols-7 gap-3 sm:gap-4">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="aspect-square rounded-[24px] bg-transparent"></div>
            ))}
            {daysInMonth.map((day, i) => {
              const moodLog = getMoodForDay(day);
              const moodStyle = moodLog ? moods[moodLog.mood] : null;
              const isToday = isSameDay(day, new Date());

              return (
                <div 
                  key={i} 
                  className={`relative aspect-square rounded-[20px] sm:rounded-[24px] border ${
                    moodStyle 
                      ? `${moodStyle.bg} ${moodStyle.border} shadow-[0_4px_12px_rgba(0,0,0,0.02)]` 
                      : 'bg-white border-gray-100 hover:border-gray-200'
                  } ${isToday ? 'ring-[3px] ring-offset-2 ring-[#5a8bf1]/60' : ''} 
                  transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer group flex items-center justify-center`}
                >
                  {/* Date Number top right */}
                  <span className={`absolute top-2.5 right-3 text-[11px] sm:text-[13px] font-bold ${moodStyle ? moodStyle.text : 'text-gray-400'}`}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Main Emoji centered */}
                  {moodStyle ? (
                    <span className="text-3xl sm:text-5xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm mt-3">
                      {moodStyle.emoji}
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-100 mt-3 group-hover:bg-gray-200 transition-colors"></span>
                  )}

                  {/* Tooltip on hover */}
                  {moodStyle && (
                    <div className="absolute inset-x-0 -top-12 mx-auto w-max px-3 py-1.5 bg-gray-800 text-white text-[12px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10 flex flex-col items-center">
                      <span className="capitalize">{moodLog.mood}</span>
                      <div className="absolute -bottom-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 bg-blue-50/50 px-4 py-2 rounded-full border border-blue-100/50">
           <Info size={14} className="text-blue-400" />
           <p className="text-[12px] font-medium text-blue-600">Clicking on a day will soon show your detailed journal entries.</p>
        </div>
      </div>
    </div>
  );
}
