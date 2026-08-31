import React, { useEffect, useState } from 'react';
import { getLatestRates } from '../services/api';
import Graph from './Graph';
import Globe3D from './Globe3D';
import { TrendingUp, TrendingDown, Activity, Earth, LayoutGrid, X } from 'lucide-react';

// Currency Branding Colors
const CURRENCY_COLORS = {
    EUR: 'from-blue-500 to-indigo-600',
    GBP: 'from-violet-500 to-purple-600',
    BAM: 'from-blue-600 to-yellow-400', // Bosnian Flag
    CAD: 'from-red-500 to-orange-500',
    AUD: 'from-green-400 to-emerald-500',
    CHF: 'from-red-600 to-rose-600',
    CNY: 'from-red-500 to-amber-500',
    INR: 'from-orange-400 to-green-400',
    USD: 'from-green-500 to-emerald-700',
    JPY: 'from-red-400 to-pink-600'
};

// Glavna kontrolna tabla koja prikazuje pregled tržišta
export default function Dashboard({ base = 'USD', t, darkMode }) {
    const [rates, setRates] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'globe' | 'battle'

    // Replaced JPY with BAM as requested
    const targets = ['EUR', 'GBP', 'BAM', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];

    useEffect(() => {
        // Periodično dohvata najnovije kurseve za prikaz na karticama
        const fetchRates = async () => {
            try {
                // Fetch ALL available rates for the globe
                const data = await getLatestRates(base, '');
                setRates(data.rates || {});
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchRates();
        const interval = setInterval(fetchRates, 60000);
        return () => clearInterval(interval);
    }, [base]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Activity className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-slate-900'}`} />
                    <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{t.marketPulse}</h3>
                </div>
                <div className="flex bg-slate-100 dark:bg-white/10 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-[#112240] shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                        <LayoutGrid className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-slate-700'}`} />
                    </button>
                    <button
                        onClick={() => setViewMode('globe')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'globe' ? 'bg-white dark:bg-[#112240] shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                        <Earth className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-slate-700'}`} />
                    </button>
                </div>
            </div>

            {viewMode === 'globe' ? (
                <div className="animate-in fade-in duration-500">
                    <Globe3D
                        darkMode={darkMode}
                        rates={rates}
                        onCountryClick={setSelectedCurrency}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {targets.map((currency) => {
                        const rate = rates[currency];
                        const isUp = Math.random() > 0.4;
                        const colorClass = CURRENCY_COLORS[currency] || 'from-slate-500 to-slate-700';

                        return (
                            <div
                                key={currency}
                                onClick={() => setSelectedCurrency(currency)}
                                className="group relative p-1 rounded-3xl transition-all hover:-translate-y-2 duration-300 cursor-pointer"
                            >
                                {/* Gradient Border/Background Effect */}
                                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${colorClass} opacity-20 group-hover:opacity-100 blur-sm transition-opacity`}></div>

                                <div className={`relative h-full p-5 rounded-[22px] overflow-hidden ${darkMode ? 'bg-[#112240]/90 backdrop-blur-xl' : 'bg-white/90 backdrop-blur-xl'} border border-white/10`}>

                                    {/* Background Blob for internal color */}
                                    <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${colorClass} opacity-20 blur-2xl group-hover:opacity-40 transition-all`}></div>

                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${colorClass}`}></div>
                                            <span className={`font-bold text-lg tracking-wider ${darkMode ? 'text-white' : 'text-slate-800'}`}>{currency}</span>
                                        </div>
                                        <span className={`flex items-center text-xs font-black px-2 py-1 rounded-lg ${isUp ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                            {isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                            {(Math.random() * 2).toFixed(2)}%
                                        </span>
                                    </div>

                                    <div className="flex items-baseline gap-1 relative z-10">
                                        <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                            {rate ? (rate < 1 ? rate.toFixed(5) : rate.toFixed(3)) : <span className="animate-pulse">---</span>}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 mt-3 relative z-10">
                                        <span className={`text-[10px] font-bold uppercase opacity-60 ${darkMode ? 'text-white' : 'text-slate-600'}`}>{t.vs} {base}</span>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {/* Graph Modal */}
            {selectedCurrency && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={`relative w-full max-w-4xl rounded-[2.5rem] p-2 md:p-4 shadow-2xl animate-in zoom-in-95 duration-200 ${darkMode ? 'bg-[#112240] border border-white/10' : 'bg-white'}`}>
                        <button
                            onClick={() => setSelectedCurrency(null)}
                            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
                        >
                            <X className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-slate-800'}`} />
                        </button>

                        <div className="h-[500px] w-full">
                            <Graph from={selectedCurrency} to={base} darkMode={darkMode} />
                        </div>
                    </div>
                    {/* Backdrop click to close */}
                    <div className="absolute inset-0 -z-10" onClick={() => setSelectedCurrency(null)}></div>
                </div>
            )}
        </div>
    );
}
