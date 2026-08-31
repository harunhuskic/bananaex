import React, { useState, useEffect } from 'react';
import { ArrowUpDown, DollarSign, RefreshCw, ChevronDown } from 'lucide-react';
import { convertCurrency } from '../services/api';

export default function Converter({ t, darkMode, onConvert, restoreData }) {
    const [amount, setAmount] = useState(1);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [result, setResult] = useState(null);
    const [rate, setRate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const currencies = ['USD', 'EUR', 'GBP', 'BAM', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'NZD', 'SGD', 'HKD'];

    // Izvršava konverziju valuta pozivom API-ja
    const handleConvert = async () => {
        if (!amount) return;
        setLoading(true);
        setError(null);
        try {
            const data = await convertCurrency(amount, fromCurrency, toCurrency);
            if (data && data.rates && data.rates[toCurrency]) {
                const res = data.rates[toCurrency];
                setResult(res);
                setRate(res / amount);

                // Trigger History Save
                if (onConvert) {
                    onConvert({
                        amount,
                        from: fromCurrency,
                        to: toCurrency,
                        result: res,
                        timestamp: Date.now()
                    });
                }
            } else {
                if (!data) setError(t.networkError);
            }
        } catch (error) {
            console.error(error);
            setError(t.failedConvert);
        } finally {
            setLoading(false);
        }
    };

    // Restore Data Effect
    useEffect(() => {
        if (restoreData) {
            setAmount(restoreData.amount);
            setFromCurrency(restoreData.from);
            setToCurrency(restoreData.to);
            // Auto convert ensures result is updated too, but we can relies on the effect below to trigger it
        }
    }, [restoreData]);

    useEffect(() => {
        // Automatski pokreće konverziju nakon prestanka kucanja
        const delayDebounceFn = setTimeout(() => {
            handleConvert();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [amount, fromCurrency, toCurrency]);

    // Zamjenjuje polaznu i ciljnu valutu
    const swapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    // Ažurira iznos za konverziju
    const handleAmountChange = (e) => {
        const val = e.target.value;
        if (val === '') {
            setAmount('');
        } else {
            setAmount(val);
        }
    };

    return (
        <div className={`rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden transition-all ${darkMode ? 'bg-[#112240] border border-blue-800/30' : 'bg-white shadow-xl shadow-blue-100/60 border border-white'}`}>

            {/* Background Decor */}
            <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none ${darkMode ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10' : 'bg-gradient-to-br from-blue-500/5 to-purple-500/5'}`}></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{t.exchange}</h2>
                    <p className={`text-sm font-medium ${darkMode ? 'text-blue-300/80' : 'text-slate-400'}`}>{t.bestRates}</p>
                </div>
                <div className={`p-3 rounded-2xl ${darkMode ? 'bg-blue-500/10' : 'bg-slate-50'}`}>
                    <DollarSign className={`w-6 h-6 ${darkMode ? 'text-cyan-400' : 'text-blue-500'}`} />
                </div>
            </div>

            <div className="space-y-4 relative z-10">

                {/* From Section */}
                <div className={`p-4 rounded-3xl border transition-all ${darkMode ? 'bg-[#0a192f] border-blue-900/50 focus-within:ring-cyan-500/50' : 'bg-slate-50 border-slate-100 focus-within:ring-blue-100'} focus-within:ring-2`}>
                    <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${darkMode ? 'text-blue-400' : 'text-slate-400'}`}>{t.youPay}</label>
                    <div className="flex items-center justify-between gap-4">
                        <input
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            className={`w-full bg-transparent border-none p-0 text-3xl font-black focus:ring-0 placeholder-blue-700/20 ${darkMode ? 'text-white' : 'text-slate-800'}`}
                            placeholder="0.00"
                        />
                        <div className="relative shrink-0">
                            <select
                                value={fromCurrency}
                                onChange={(e) => setFromCurrency(e.target.value)}
                                className={`appearance-none font-bold py-2 pl-4 pr-10 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-sm ${darkMode ? 'bg-[#1e3a5f] text-white border-blue-800 focus:ring-cyan-400' : 'bg-white text-slate-700 border-slate-200 focus:ring-blue-300'}`}
                            >
                                {currencies.map((c) => <option key={c} value={c} className={darkMode ? 'bg-[#112240] text-white' : 'bg-white text-slate-800'}>{c}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center -my-3 relative z-20">
                    <button
                        onClick={swapCurrencies}
                        className={`p-3 border-4 rounded-full shadow-lg hover:rotate-180 transition-all duration-300 group ${darkMode ? 'bg-[#112240] border-[#0a192f] text-cyan-400 hover:text-white' : 'bg-white border-white text-blue-500 hover:text-blue-600 shadow-blue-100'}`}
                    >
                        <ArrowUpDown className="w-5 h-5" />
                    </button>
                </div>

                {/* To Section */}
                <div className={`p-4 rounded-3xl border transition-all ${darkMode ? 'bg-[#0a192f] border-blue-900/50 focus-within:ring-cyan-500/50' : 'bg-slate-50 border-slate-100 focus-within:ring-blue-100'} focus-within:ring-2`}>
                    <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${darkMode ? 'text-blue-400' : 'text-slate-400'}`}>{t.youReceive}</label>
                    <div className="flex items-center justify-between gap-4">
                        <div className={`w-full bg-transparent text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            {loading ? <span className="opacity-50 animate-pulse">...</span> : (result ? Number(result).toFixed(3) : '0.00')}
                        </div>
                        <div className="relative shrink-0">
                            <select
                                value={toCurrency}
                                onChange={(e) => setToCurrency(e.target.value)}
                                className={`appearance-none font-bold py-2 pl-4 pr-10 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-sm ${darkMode ? 'bg-[#1e3a5f] text-white border-blue-800 focus:ring-cyan-400' : 'bg-white text-slate-700 border-slate-200 focus:ring-blue-300'}`}
                            >
                                {currencies.map((c) => <option key={c} value={c} className={darkMode ? 'bg-[#112240] text-white' : 'bg-white text-slate-800'}>{c}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {error ? (
                    <div className="text-red-400 text-sm font-medium text-center bg-red-900/20 p-2 rounded-lg">
                        {error}
                    </div>
                ) : (
                    <div className={`flex items-center justify-between px-2 pt-2 text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-slate-500'}`}>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${darkMode ? 'bg-cyan-400' : 'bg-green-500'}`}></span>
                            <span>{t.realTime}</span>
                        </div>
                        <span>1 {fromCurrency} = {rate ? Number(rate).toFixed(5) : '...'} {toCurrency}</span>
                    </div>
                )}

                <button
                    onClick={() => handleConvert()}
                    className="w-full mt-4 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-lg rounded-2xl shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
                >
                    {loading && <RefreshCw className="animate-spin w-5 h-5" />}
                    {loading ? t.converting : t.convertNow}
                </button>

            </div>
        </div>
    );
}
