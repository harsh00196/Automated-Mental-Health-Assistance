import { Phone, Shield, AlertCircle, ExternalLink, HeartPulse } from 'lucide-react';

export default function HelpAndEmergency() {
  const govContacts = [
    {
      name: "Kiran Mental Health Helpline (Govt of India)",
      description: "24/7 National toll-free helpline providing psychological support and crisis management.",
      number: "1800-599-0019",
      available: "24/7",
    },
    {
      name: "National Institute of Mental Health (NIMHANS)",
      description: "Psychosocial support and mental health services provided by the central institute.",
      number: "080-4611-0007",
      available: "24/7",
    },
    {
      name: "Vandrevala Foundation",
      description: "Free psychological counseling and crisis intervention by trained professionals.",
      number: "9999-666-555",
      available: "24/7",
    },
    {
      name: "AASRA Suicide Prevention",
      description: "Confidential and free emotional support to anyone in severe psychological distress.",
      number: "9820466726",
      available: "24/7",
    }
  ];

  const internationalContacts = [
    {
      name: "National Suicide Prevention Lifeline (USA)",
      number: "988",
    },
    {
      name: "Emergency Services (Europe)",
      number: "112",
    },
    {
      name: "Crisis Text Line (Global)",
      number: "Text HOME to 741741",
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 pb-24 md:pb-8 font-sans animate-fade-in-up">
      
      {/* Red Alert Header */}
      <div className="bg-gradient-to-br from-red-50 to-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-red-100 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-400/10 rounded-full filter blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 flex-shrink-0 z-10">
          <AlertCircle size={32} strokeWidth={2.5} />
        </div>
        <div className="z-10 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Emergency Assistance</h1>
          <p className="text-gray-600 font-medium mt-1">If you or someone you know is in immediate danger or experiencing a severe mental health crisis, please reach out immediately. You are not alone.</p>
        </div>
      </div>

      {/* Primary Contacts */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <Shield className="text-blue-500 w-5 h-5" />
          Government & Verified Helplines (India)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {govContacts.map((contact, index) => (
            <div key={index} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:border-blue-200 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-800 text-[17px] leading-tight">{contact.name}</h3>
              </div>
              <p className="text-[13px] text-gray-500 font-medium mb-4 leading-relaxed">{contact.description}</p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto">
                <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100/50">
                  <Phone size={14} className="text-red-500" />
                  <span className="font-bold text-red-600 tracking-wide text-sm">{contact.number}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HeartPulse size={14} className="text-green-500" />
                  <span className="text-[11px] font-bold text-green-600 uppercase tracking-wider">{contact.available}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Contacts */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <ExternalLink className="text-gray-400 w-5 h-5" />
          International Hotlines
        </h2>
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 md:gap-12 justify-center">
          {internationalContacts.map((contact, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="text-[13px] text-gray-400 font-bold uppercase tracking-wider mb-1">{contact.name}</span>
              <span className="text-lg font-bold text-gray-800">{contact.number}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
