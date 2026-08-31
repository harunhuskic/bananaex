import React from 'react';
import { History, ArrowRight, Clock, Trash2 } from 'lucide-react';

// Prikazuje listu nedavnih konverzija korisnika
export default function RecentHistory({ t, darkMode, history, onRestore, onClear }) {
    if (!history || history.length === 0) return null;

    return (
        <div className={`rounded-[2.5rem] p-6 relative overflow-hidden transition-all ${darkMode ? 'bg-[#112240] border border-blue-800/30' : 'bg-white shadow-xl shadow-blue-100/60 border border-white'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${darkMode ? 'bg-blue-500/20' : 'bg-slate-100'}`}>
                        <History className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-slate-600'}`} />
                    </div>
                    <h3 className={`font-black uppercase tracking-wide text-sm ${darkMode ? 'text-white' : 'text-slate-700'}`}>{t.history || "Recent"}</h3>
                </div>
                <button
                    onClick={onClear}
                    className={`p-2 rounded-full hover:bg-red-500/10 transition-colors group`}
                    title="Clear History"
                >
                    <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                </button>
            </div>

            <div className="space-y-3">
                {history.slice(0, 5).map((item, index) => (
                    <div
                        key={item.id || index}
                        onClick={() => onRestore(item)}
                        className={`group p-3 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-between
                            ${darkMode ? 'bg-[#0a192f] border-white/5 hover:border-blue-500/50' : 'bg-slate-50 border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-md'}
                        `}
                    >
                        <div className="flex items-center gap-2">
                            <span className={`font-bold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                                {item.amount} {item.from}
                            </span>
                            <ArrowRight className={`w-3 h-3 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                            <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                {Number(item.result).toFixed(2)} {item.to}
                            </span>
                        </div>
                        <Clock className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    </div>
                ))}
            </div>
        </div>
    );
}
