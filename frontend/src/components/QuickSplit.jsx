import React, { useState, useEffect } from 'react';
import { Calculator, Users, ArrowRight } from 'lucide-react';
import { convertCurrency } from '../services/api';

// Komponenta za brzo dijeljenje troškova među prijateljima
export default function QuickSplit({ t, darkMode }) {
    const [total, setTotal] = useState('');
    const [people, setPeople] = useState(2);
    const [billCurrency, setBillCurrency] = useState('BAM');
    const [myCurrency, setMyCurrency] = useState('EUR');
    const [share, setShare] = useState(null);
    const [loading, setLoading] = useState(false);

    const currencies = ['BAM', 'EUR', 'USD', 'GBP', 'CHF'];

    // Izračunava koliko svaka osoba treba da plati u odabranoj valuti
    const calculate = async () => {
        if (!total || !people) return;
        setLoading(true);
        try {
            // 1. Calculate Per Person in Bill Currency
            const perPerson = parseFloat(total) / parseInt(people);

            // 2. Convert to My Currency
            const data = await convertCurrency(perPerson, billCurrency, myCurrency);
            if (data && data.rates && data.rates[myCurrency]) {
                setShare(data.rates[myCurrency]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Automatski ponovo računa kada se promijene podaci
        if (total && people) {
            const delay = setTimeout(calculate, 500);
            return () => clearTimeout(delay);
        }
    }, [total, people, billCurrency, myCurrency]);

    return (
        <div className={`p-6 rounded-[2.5rem] border transition-all ${darkMode ? 'bg-[#112240]/50 border-white/5' : 'bg-white border-white shadow-xl shadow-blue-100/50'}`}>
            <div className="flex items-center gap-2 mb-6">
                <Calculator className="w-5 h-5 text-green-400" />
                <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>Quick Split</h3>
            </div>

            <div className="space-y-4">
                {/* Total Bill Input */}
                <div>
                    <label className={`text-xs font-bold uppercase mb-1 block ${darkMode ? 'text-white/40' : 'text-slate-400'}`}>Total Bill</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={total}
                            onChange={(e) => setTotal(e.target.value)}
                            placeholder="0.00"
                            className={`w-full p-3 rounded-2xl font-bold outline-none font-mono ${darkMode ? 'bg-black/20 text-white' : 'bg-slate-50 text-slate-800'}`}
                        />
                        <select
                            value={billCurrency}
                            onChange={(e) => setBillCurrency(e.target.value)}
                            className={`rounded-2xl font-bold px-3 outline-none cursor-pointer ${darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600'}`}
                        >
                            {currencies.map(c => <option key={c} value={c} className={darkMode ? 'bg-[#112240] text-white' : 'bg-white text-slate-800'}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* People & Target Currency */}
                <div className="flex gap-3">
                    <div className="w-1/2">
                        <label className={`text-xs font-bold uppercase mb-1 block ${darkMode ? 'text-white/40' : 'text-slate-400'}`}>Split By</label>
                        <div className={`p-3 rounded-2xl flex items-center justify-between ${darkMode ? 'bg-black/20' : 'bg-slate-50'}`}>
                            <Users className="w-4 h-4 opacity-50" />
                            <input
                                type="number"
                                value={people}
                                onChange={(e) => setPeople(e.target.value)}
                                className="w-12 bg-transparent text-right font-bold outline-none"
                                min="1"
                            />
                        </div>
                    </div>
                    <div className="w-1/2">
                        <label className={`text-xs font-bold uppercase mb-1 block ${darkMode ? 'text-white/40' : 'text-slate-400'}`}>Pay In</label>
                        <select
                            value={myCurrency}
                            onChange={(e) => setMyCurrency(e.target.value)}
                            className={`w-full h-[46px] rounded-2xl font-bold px-3 outline-none cursor-pointer ${darkMode ? 'bg-black/20 text-white' : 'bg-slate-50 text-slate-800'}`}
                        >
                            {currencies.map(c => <option key={c} value={c} className={darkMode ? 'bg-[#112240] text-white' : 'bg-white text-slate-800'}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Result */}
                <div className={`mt-4 p-4 rounded-3xl text-center transition-all ${darkMode ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/20' : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800'}`}>
                    <div className={`text-xs font-bold uppercase opacity-60 mb-1 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>You Each Owe</div>
                    <div className="text-3xl font-black flex items-center justify-center gap-2">
                        {loading ? <span className="animate-pulse">...</span> : (
                            <>
                                <span>{share ? share.toFixed(2) : '0.00'}</span>
                                <span className="text-sm opacity-50 self-end mb-1">{myCurrency}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
