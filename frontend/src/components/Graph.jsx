import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getHistory } from '../services/api';
import { Calendar, Clock } from 'lucide-react';

// Komponenta za prikaz historijskog grafa valuta
export default function Graph({ from = 'USD', to = 'EUR', darkMode }) {
    const [data, setData] = useState([]);
    const [days, setDays] = useState(30);

    const ranges = [
        { label: '1W', value: 7 },
        { label: '1M', value: 30 },
        { label: '3M', value: 90 },
        { label: '1Y', value: 365 }
    ];

    useEffect(() => {
        // Dohvata historijske podatke sa API-ja kada se promijene parametri
        const fetchHistory = async () => {
            try {
                const historyData = await getHistory(from, to, days);
                if (historyData && historyData.rates) {
                    const formatted = Object.entries(historyData.rates).map(([date, rates]) => ({
                        date: date,
                        displayDate: date.slice(5),
                        value: rates[to]
                    }));
                    setData(formatted);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchHistory();
    }, [from, to, days]);

    // Prilagođeni tooltip za prikaz vrijednosti na grafu
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-3 rounded-xl border shadow-xl ${darkMode ? 'bg-black/80 backdrop-blur-md border-white/10 text-white' : 'bg-white/90 backdrop-blur-md border-slate-100 text-slate-800'}`}>
                    <p className={`text-xs mb-1 ${darkMode ? 'text-white/60' : 'text-slate-500'}`}>{label}</p>
                    <p className="text-lg font-bold">
                        {payload[0].value.toFixed(4)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[400px] flex flex-col p-6 rounded-3xl relative overflow-hidden">
            {/* Decorative gradient behind graph */}
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${darkMode ? 'bg-gradient-to-b from-blue-500/10 to-transparent' : 'bg-gradient-to-b from-blue-100/50 to-transparent'}`}></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-black md:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                        {from} - {to}
                    </h3>
                    <div className={`flex items-center gap-1 text-sm ${darkMode ? 'opacity-60 text-white' : 'text-slate-400'}`}>
                        <Clock className="w-3 h-3" />
                        <span>History Trend</span>
                    </div>
                </div>

                {/* Time Range Selector */}
                <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-black/20' : 'bg-slate-100'}`}>
                    {ranges.map((r) => (
                        <button
                            key={r.label}
                            onClick={() => setDays(r.value)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${days === r.value ? 'bg-blue-500 text-white shadow-lg' : 'hover:bg-white/10 opacity-60 hover:opacity-100 dark:text-white text-slate-600'}`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#ffffff" : "#000000"} opacity={0.05} />
                        <XAxis
                            dataKey="displayDate"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b', opacity: 0.7 }}
                            minTickGap={30}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            hide={true}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
