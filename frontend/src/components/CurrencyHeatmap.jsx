import React from 'react';
import { TrendingUp, TrendingDown, GripHorizontal } from 'lucide-react';

const HEATMAP_DATA = [
    { code: 'USD', change: 0.15, name: 'Dollar' },
    { code: 'EUR', change: -0.23, name: 'Euro' },
    { code: 'GBP', change: 0.45, name: 'Pound' },
    { code: 'BAM', change: 0.12, name: 'Mark' },
    { code: 'JPY', change: -0.89, name: 'Yen' },
    { code: 'CHF', change: 0.32, name: 'Franc' },
    { code: 'CAD', change: -0.15, name: 'Loonie' },
    { code: 'AUD', change: 0.67, name: 'Aussie' },
];

export default function CurrencyHeatmap({ t, darkMode }) {
    return (
        <div className={`p-8 rounded-[2.5rem] border transition-all ${darkMode ? 'bg-[#112240]/50 border-white/5' : 'bg-white shadow-xl shadow-blue-100/50 border-white'}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                    <GripHorizontal className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>Market Heatmap</h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {HEATMAP_DATA.map((item) => {
                    const isPositive = item.change >= 0;

                    return (
                        <div
                            key={item.code}
                            className={`relative group overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer 
                            ${isPositive
                                    ? (darkMode ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100')
                                    : (darkMode ? 'bg-gradient-to-br from-rose-500/20 to-pink-500/20 border-rose-500/30' : 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100')}
                            border`}
                        >
                            {/* Glow Effect */}
                            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-40 transition-opacity group-hover:opacity-60 
                             ${isPositive ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>

                            <div className="relative z-10 flex flex-col justify-between h-20">
                                <div className="flex justify-between items-start">
                                    <span className={`text-sm font-bold opacity-70 ${darkMode ? 'text-white' : 'text-slate-600'}`}>{item.name}</span>
                                    {isPositive
                                        ? <TrendingUp className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                        : <TrendingDown className={`w-4 h-4 ${darkMode ? 'text-rose-400' : 'text-rose-600'}`} />
                                    }
                                </div>

                                <div>
                                    <h4 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.code}</h4>
                                    <span className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {isPositive ? '+' : ''}{item.change}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
