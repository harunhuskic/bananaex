import React, { useState } from 'react';
import { ShoppingBag, Coffee, Utensils } from 'lucide-react';

export default function BananaIndex({ t, darkMode }) {
    const [selectedItem, setSelectedItem] = useState('banana');

    const ITEMS = {
        banana: {
            icon: <p className="text-4xl">🍌</p>,
            label: "Bananas (1kg)",
            prices: { 'NYC': 1.60, 'Berlin': 1.40, 'Sarajevo': 0.90 } // approximate USD
        },
        coffee: {
            icon: <Coffee className="w-8 h-8 text-amber-700" />,
            label: "Cappuccino",
            prices: { 'NYC': 5.50, 'Berlin': 3.80, 'Sarajevo': 1.50 }
        },
        burger: {
            icon: <Utensils className="w-8 h-8 text-orange-600" />,
            label: "Big Mac Meal",
            prices: { 'NYC': 12.00, 'Berlin': 9.50, 'Sarajevo': 5.00 }
        }
    };

    const current = ITEMS[selectedItem];
    const budget = 50; // $50 budget

    return (
        <div className={`rounded-[2.5rem] p-8 relative overflow-hidden transition-all ${darkMode ? 'bg-gradient-to-br from-[#112240] to-[#0a192f] border border-yellow-500/20' : 'bg-gradient-to-br from-yellow-50 to-orange-50/50 border border-yellow-100 shadow-xl shadow-yellow-100/50'}`}>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className={`text-2xl font-black flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        <span className="text-yellow-500">🍌</span> The Banana Index
                    </h2>
                    <p className={`text-sm font-bold opacity-60 ${darkMode ? 'text-white' : 'text-slate-600'}`}>
                        Purchasing Power Parity (What $50 buys)
                    </p>
                </div>

                <div className="flex gap-2">
                    {Object.keys(ITEMS).map((key) => (
                        <button
                            key={key}
                            onClick={() => setSelectedItem(key)}
                            className={`p-3 rounded-xl transition-all ${selectedItem === key
                                ? (darkMode ? 'bg-yellow-500/20 text-yellow-400 ring-2 ring-yellow-500/50' : 'bg-white shadow-md text-yellow-600 ring-2 ring-yellow-400')
                                : (darkMode ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-white/50 text-slate-400')}`}
                        >
                            {key === 'banana' ? '🍌' : (key === 'coffee' ? '☕' : '🍔')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(current.prices).map(([city, price]) => {
                    const count = Math.floor(budget / price);
                    // generate simple visual bar
                    const barHeight = Math.min(count * 3, 120);

                    return (
                        <div key={city} className={`relative p-5 rounded-3xl border flex flex-col items-center justify-end h-64 group transition-all hover:-translate-y-1
                            ${darkMode ? 'bg-[#0a192f]/50 border-white/5' : 'bg-white/60 border-white shadow-sm'}`}>

                            <div className="absolute top-4 left-4">
                                <span className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {city}
                                </span>
                            </div>

                            <div className="text-center z-10 mb-4">
                                <span className={`text-5xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                    {count}
                                </span>
                                <p className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {current.label.split(' ')[0]}
                                </p>
                            </div>

                            {/* Visual Bar */}
                            <div
                                style={{ height: `${barHeight}px` }}
                                className={`w-full rounded-2xl flex items-end justify-center overflow-hidden relative opacity-80
                                    ${darkMode ? 'bg-yellow-500/20' : 'bg-yellow-400/30'}`}
                            >
                                <div className="absolute bottom-[-10px] text-4xl opacity-20 rotate-12">
                                    {selectedItem === 'banana' ? '🍌' : (selectedItem === 'coffee' ? '☕' : '🍔')}
                                </div>
                            </div>

                            <div className={`mt-3 text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                ${price.toFixed(2)} / unit
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
