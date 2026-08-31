import React from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';

const MOCK_NEWS = [
    { id: 1, title: "Fed signals interest rate stability", source: "Bloomberg", tag: "Policy", sentiment: "positive" },
    { id: 2, title: "Euro strengthens against USD", source: "ForexLive", tag: "Market", sentiment: "positive" },
    { id: 3, title: "Yen shows volatility amidst uncertainty", source: "Reuters", tag: "Forex", sentiment: "neutral" },
    { id: 4, title: "Global trade volume increases in Q4", source: "Financial Times", tag: "Economy", sentiment: "positive" },
];

export default function NewsFeed({ t, darkMode }) {
    return (
        <div className={`p-6 rounded-[2.5rem] border transition-all ${darkMode ? 'bg-[#112240]/50 border-white/5' : 'bg-white border-white shadow-xl shadow-blue-100/50'}`}>
            <div className="flex items-center gap-2 mb-6">
                <Newspaper className="w-5 h-5 text-purple-500" />
                <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>Global Markets</h3>
            </div>

            <div className="space-y-4">
                {MOCK_NEWS.map((item) => (
                    <div key={item.id} className={`group flex items-start justify-between p-4 rounded-2xl transition-all cursor-pointer ${darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50 border border-transparent hover:border-slate-100'}`}>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
                                <span className={`px-2 py-0.5 rounded-md ${darkMode ? 'bg-white/10 text-white/60' : 'bg-slate-100 text-slate-500'}`}>{item.source}</span>
                                <span className={`text-${item.sentiment === 'positive' ? 'green' : item.sentiment === 'negative' ? 'red' : 'yellow'}-500`}>• {item.tag}</span>
                            </div>
                            <h4 className={`font-bold leading-tight ${darkMode ? 'text-blue-100 group-hover:text-blue-400' : 'text-slate-700 group-hover:text-blue-600'}`}>
                                {item.title}
                            </h4>
                        </div>
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                    </div>
                ))}
            </div>
        </div>
    );
}
