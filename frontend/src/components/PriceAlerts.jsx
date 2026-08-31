import React, { useState } from 'react';
import { Bell, Plus, Trash2, ArrowRight } from 'lucide-react';

// Komponenta za upravljanje cjenovnim alarmima
export default function PriceAlerts({ t, darkMode, alerts, onAddAlert, onDeleteAlert }) {
    const [isAdding, setIsAdding] = useState(false);
    const [pair, setPair] = useState('EUR/USD');
    const [target, setTarget] = useState('');

    // Dodaje novi alarm za praćenje kursa
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!target) return;
        onAddAlert({
            id: Date.now(),
            pair,
            target: parseFloat(target),
            condition: 'above', // Default condition
            active: true
        });
        setTarget('');
        setIsAdding(false);
    };

    return (
        <div className={`p-6 rounded-[2.5rem] border transition-all ${darkMode ? 'bg-[#112240]/50 border-white/5' : 'bg-white border-white shadow-xl shadow-blue-100/50'}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-yellow-500" />
                    <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>Price Alerts</h3>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="mb-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 animate-in fade-in slide-in-from-top-2">
                    <div className="flex gap-2 mb-2">
                        <select
                            value={pair}
                            onChange={(e) => setPair(e.target.value)}
                            className={`w-full p-2 rounded-lg text-sm font-bold outline-none ${darkMode ? 'bg-[#0a192f] text-white' : 'bg-white text-slate-700'}`}
                        >
                            <option value="EUR/USD">EUR/USD</option>
                            <option value="GBP/USD">GBP/USD</option>
                            <option value="USD/JPY">USD/JPY</option>
                            <option value="USD/BAM">USD/BAM</option>
                            <option value="EUR/BAM">EUR/BAM</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Target Rate"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className={`w-full p-2 rounded-lg text-sm font-bold outline-none ${darkMode ? 'bg-[#0a192f] text-white placeholder-white/30' : 'bg-white text-slate-700'}`}
                        />
                        <button type="submit" className="p-2 bg-blue-500 text-white rounded-lg px-4 font-bold text-sm">Set</button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {alerts.length === 0 ? (
                    <div className={`text-center py-4 text-sm font-medium ${darkMode ? 'text-white/40' : 'text-slate-400'}`}>
                        No alerts set.
                    </div>
                ) : (
                    alerts.map((alert) => (
                        <div key={alert.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <div>
                                <div className={`text-xs font-bold uppercase mb-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`}>{alert.pair}</div>
                                <div className={`font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                    Target: {alert.target}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${alert.active ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
                                <button onClick={() => onDeleteAlert(alert.id)} className="text-red-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
