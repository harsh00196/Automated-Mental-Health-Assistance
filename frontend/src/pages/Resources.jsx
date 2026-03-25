import { useState, useEffect } from 'react';
import api from '../api';
import { BookOpen, Play, FileText, Wind, Search, Star, X } from 'lucide-react';

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resAll, resRec] = await Promise.all([
          api.get('/resources'),
          api.get('/resources/recommendations')
        ]);
        setResources(resAll.data);
        setRecommendations(resRec.data);
      } catch (err) {
        console.error('Failed to fetch resources');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'video': return <Play className="w-5 h-5 text-red-500" />;
      case 'audio': return <Wind className="w-5 h-5 text-teal-500" />;
      case 'article': return <FileText className="w-5 h-5 text-blue-500" />;
      default: return <BookOpen className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 pb-24 md:pb-8 relative min-h-screen">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-[#CAFFBF]/30 rounded-2xl flex items-center justify-center">
          <BookOpen className="text-[#64a355] w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Resource Library</h1>
          <p className="text-gray-500 font-medium">Curated content for your mental wellbeing.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search articles, exercises, meditations..." 
          className="w-full bg-white border border-gray-100 text-gray-800 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#A0C4FF] shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all font-medium"
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-10 font-medium">Loading resources...</div>
      ) : (
        <>
          {recommendations.length > 0 && (
            <div className="space-y-4 animate-fade-in-up">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 tracking-tight">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                Recommended for You
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {recommendations.map(res => (
                  <div key={`rec-${res.id}`} onClick={() => setSelectedResource(res)} className="bg-gradient-to-br from-white to-[#f4f7fe] rounded-[24px] p-5 shadow-sm border border-blue-50 hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all group flex flex-col justify-between cursor-pointer">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-4xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{res.emoji}</span>
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                          {getIcon(res.type)}
                        </div>
                      </div>
                      <h3 className="font-bold text-[17px] text-gray-800 group-hover:text-[#5a8bf1] transition-colors leading-tight">{res.title}</h3>
                      <p className="text-[13px] font-medium text-gray-500 mt-2 line-clamp-2 leading-relaxed">{res.description}</p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-white/50 flex items-center text-[11px] font-bold text-[#5a8bf1] uppercase tracking-wider">
                      {res.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">All Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.map(res => (
                <div key={`res-${res.id}`} onClick={() => setSelectedResource(res)} className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 hover:border-[#A0C4FF] hover:shadow-md transition-all flex items-center gap-4 cursor-pointer group">
                  <div className="w-16 h-16 rounded-[18px] bg-gray-50 group-hover:bg-[#A0C4FF]/15 transition-colors flex items-center justify-center text-3xl flex-shrink-0 drop-shadow-sm group-hover:scale-105 duration-300">
                    {res.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[16px] text-gray-800 group-hover:text-[#5a8bf1] transition-colors leading-tight">{res.title}</h3>
                    <p className="text-[13px] font-medium text-gray-500 mt-0.5 line-clamp-1">{res.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-50 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 rounded uppercase tracking-wider transition-colors">{res.category}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all ml-2">
                    {getIcon(res.type)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Resource Viewing Modal Wrapper */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-800/40 backdrop-blur-sm animate-fade-in text-sans">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
            
            {/* Modal Header */}
            <div className={`p-8 pb-6 bg-gradient-to-br ${
              selectedResource.category === 'stress' ? 'from-[#caffbf]/40 to-white' : 
              selectedResource.category === 'anxiety' ? 'from-[#a0c4ff]/30 to-white' : 
              selectedResource.category === 'sadness' ? 'from-[#ffadad]/20 to-white' :
              selectedResource.category === 'sleep' ? 'from-[#bdb2ff]/30 to-white' :
              'from-yellow-100/40 to-white'
            } relative`}>
              <button 
                onClick={() => setSelectedResource(null)}
                className="absolute top-6 right-6 p-2 bg-white/50 hover:bg-white rounded-full text-gray-500 hover:text-gray-800 transition-colors shadow-sm cursor-pointer"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
              
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-[24px] bg-white flex items-center justify-center text-5xl shadow-sm border border-white/50 flex-shrink-0 drop-shadow-sm">
                  {selectedResource.emoji}
                </div>
                <div className="pt-1 pr-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-white/70 text-gray-600 rounded uppercase tracking-wider">
                      {selectedResource.category}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-white/70 text-[#5a8bf1] rounded uppercase tracking-wider flex items-center gap-1">
                      {selectedResource.type}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 leading-tight tracking-tight">{selectedResource.title}</h2>
                </div>
              </div>
            </div>

            {/* Modal Body / Content */}
            <div className="p-8 pt-4 overflow-y-auto custom-scrollbar">
              <h3 className="text-[15px] font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">
                {selectedResource.description}
              </h3>
              
              <div className="prose prose-sm md:prose-base prose-blue max-w-none text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                {selectedResource.content || "Content is currently being updated for this resource. Please check back later!"}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end rounded-b-[32px]">
               <button 
                  onClick={() => setSelectedResource(null)}
                  className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm cursor-pointer"
               >
                 Close
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
