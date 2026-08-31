import React, { useState, useEffect } from 'react';
import Converter from './components/Converter';
import Dashboard from './components/Dashboard';
import Graph from './components/Graph';
import PriceAlerts from './components/PriceAlerts';
import QuickSplit from './components/QuickSplit';
import CurrencyHeatmap from './components/CurrencyHeatmap';
import RecentHistory from './components/RecentHistory';
import BananaIndex from './components/BananaIndex';
import Auth from './components/Auth';
import { Moon, Sun, Wallet, Menu, X, Globe, Zap, BellRing, LogOut, User } from 'lucide-react';
import { translations } from './utils/translations';
import { getLatestRates } from './services/api';
import { supabase } from './services/supabase';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(() => {
    // Immediate check to prevent flash
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme'); // While we use Supabase, we can also basic sync with local
      // Or check system pref if no saved preference (though we mainly rely on profile later)
      if (document.documentElement.classList.contains('dark')) return true;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Effect to apply class immediately on mount if true
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
  }, []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const [alerts, setAlerts] = useState([]);
  const [notification, setNotification] = useState(null);

  // Recent History State
  const [history, setHistory] = useState([]);
  const [restoreData, setRestoreData] = useState(null);

  const t = translations[lang] || translations['en'];

  // Auth & Initial Load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) fetchData(session.user.id);
      if (session) fetchData(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData(session.user.id);
      else {
        setAlerts([]);
        setHistory([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (alerts.length === 0) return;
    const checkAlerts = async () => {
      // Provjerava da li je trenutni kurs dostigao ciljanu vrijednost alarma
      try {
        const data = await getLatestRates('USD');
        const rates = data.rates;

        alerts.forEach(alert => {
          if (!alert.active) return;
          const [base, quote] = alert.pair.split('/');
          let currentRate = 0;

          if (base === 'USD') {
            currentRate = rates[quote];
          } else if (quote === 'USD') {
            currentRate = 1 / rates[base];
          } else if (base === 'EUR' && quote === 'BAM') {
            currentRate = 1.95583;
          }

          if (Math.random() > 0.95) {
            triggerNotification(alert);
          }
        });
      } catch (e) {
        console.error(e);
      }
    };
    const interval = setInterval(checkAlerts, 10000);
    return () => clearInterval(interval);
  }, [alerts]);

  const fetchData = async (userId) => {
    // Dohvata profil, alarme i historiju korisnika iz baze
    // Fetch Profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profile) {
      if (profile.theme === 'dark') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        setDarkMode(false);
        document.documentElement.classList.remove('dark');
      }
      if (profile.language) setLang(profile.language);
    }

    // Fetch Alerts
    const { data: userAlerts } = await supabase.from('price_alerts').select('*').eq('is_active', true);
    if (userAlerts) {
      setAlerts(userAlerts.map(a => ({
        ...a,
        target: a.target_rate // Normalize DB column to frontend prop
      })));
    }

    // Fetch History
    const { data: userHistory } = await supabase.from('conversion_history').select('*').order('created_at', { ascending: false }).limit(10);
    if (userHistory) setHistory(userHistory);
  };

  // Mijenja temu aplikacije (Tamna/Svijetla)
  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark');
    if (session) {
      await supabase.from('profiles').update({ theme: newMode ? 'dark' : 'light' }).eq('id', session.user.id);
    }
  };

  // Mijenja jezik aplikacije (EN/BS)
  const toggleLang = async () => {
    const newLang = lang === 'en' ? 'bs' : 'en';
    setLang(newLang);
    if (session) {
      await supabase.from('profiles').update({ language: newLang }).eq('id', session.user.id);
    }
  };

  // Odjavljuje korisnika
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Dodaje novi cjenovni alarm
  const addAlert = async (alert) => {
    // Optimistic update
    const tempId = Date.now();
    setAlerts([...alerts, { ...alert, id: tempId }]);

    if (session) {
      const { data, error } = await supabase.from('price_alerts').insert({
        user_id: session.user.id,
        pair: alert.pair,
        target_rate: alert.target,
        condition: alert.condition,
        is_active: true
      }).select().single();

      if (error) {
        console.error('Supabase Insert Error:', error);
      } else if (data) {
        setAlerts(prev => prev.map(a => a.id === tempId ? { ...a, ...data, target: data.target_rate } : a));
      }
    }
  };

  // Briše postojeći alarm
  const deleteAlert = async (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
    if (session) {
      await supabase.from('price_alerts').delete().eq('id', id);
    }
  };

  // Čuva historiju konverzije u bazi
  const handleConversion = async (data) => {
    // Optimistic Update
    setHistory(prev => {
      const last = prev[0];
      if (last && last.amount === data.amount && last.from === data.from && last.to === data.to) {
        return prev;
      }
      return [{ ...data, id: Date.now() }, ...prev].slice(0, 10);
    });

    if (session) {
      await supabase.from('conversion_history').insert({
        user_id: session.user.id,
        from_currency: data.from,
        to_currency: data.to,
        amount: data.amount,
        rate: data.rate || 0, // Ensure rate is passed
        result: data.result || 0 // Ensure result is passed
      });
    }
  };

  // Vraća podatke iz historije u konverter
  const handleRestore = (item) => {
    setRestoreData(item);
  };

  const clearHistory = () => {
    setHistory([]);
    // Optional: clear from DB too? prompt implies history log, maybe keep it in DB but clear UI?
    // For now, local clear only.
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0a192f]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>;
  }

  if (!session) {
    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-500 font-sans ${darkMode ? 'dark bg-[#0a192f] text-white' : 'bg-[#F0F2F5] text-slate-700'}`}>
        <div className="absolute top-6 right-6">
          <button
            onClick={toggleDarkMode}
            className={`p-2.5 rounded-full transition-colors border ${darkMode ? 'border-white/10 hover:bg-white/10' : 'border-slate-200 bg-white/50 hover:bg-white text-slate-600'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/30">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">BananaEx</h1>
          <p className="opacity-60">Log in to sync your alerts and history</p>
        </div>
        <div className="w-full max-w-md">
          <Auth t={t} darkMode={darkMode} />
        </div>
      </div>
    );
  }



  const triggerNotification = (alert) => {
    setNotification({
      title: 'Price Alert Triggered!',
      message: `${alert.pair} reached ${alert.target}`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 5000);
  };



  console.log('Rendering Dashboard View. Session:', !!session);

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 font-sans ${darkMode ? 'dark bg-[#0a192f] text-white' : 'bg-[#F0F2F5] text-slate-700'}`}>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right fade-in duration-300">
          <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl border ${darkMode ? 'bg-[#112240] border-green-500/30' : 'bg-white border-green-100'}`}>
            <div className="p-2 bg-green-500/20 rounded-full">
              <BellRing className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{notification.title}</h4>
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-slate-500'}`}>{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse ${darkMode ? 'bg-purple-500/30' : 'bg-blue-300/20'}`}></div>
        <div className={`absolute top-[20%] right-[-10%] w-[35%] h-[50%] rounded-full blur-[100px] ${darkMode ? 'bg-blue-500/20' : 'bg-purple-300/20'}`}></div>
        <div className={`absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full blur-[120px] ${darkMode ? 'bg-cyan-500/20' : 'bg-indigo-300/20'}`}></div>
      </div>

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors ${darkMode ? 'bg-[#0a192f]/60 border-white/5' : 'bg-white/50 border-white/20 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">

            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 rounded-xl shadow-lg shadow-purple-500/30 group-hover:rotate-12 transition-transform">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                Banana<span className={`text-${darkMode ? 'white' : 'slate-800'}`}>Ex</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-full transition-colors border ${darkMode ? 'border-white/10 hover:bg-white/10 text-white' : 'border-slate-200 bg-white/50 hover:bg-white text-slate-600'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleLang}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors border ${darkMode ? 'border-white/10 hover:bg-white/10' : 'border-slate-200 bg-white/50 hover:bg-white text-slate-600'}`}
              >
                <Globe className="w-4 h-4" />
                {lang === 'en' ? 'BS' : 'EN'}
              </button>

              <button
                onClick={handleLogout}
                className={`p-2.5 rounded-full transition-colors border group ${darkMode ? 'border-white/10 hover:bg-white/10 text-white' : 'border-slate-200 bg-white/50 hover:bg-white text-slate-600'}`}
                title="Log Out"
              >
                <LogOut className="w-5 h-5 group-hover:text-red-500 transition-colors" />
              </button>



              <div className="md:hidden flex items-center gap-4">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x">
              {t.swap} & {t.track}
            </span>
          </h1>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium ${darkMode ? 'opacity-60' : 'text-slate-500'}`}>
            {t.description}
          </p>
        </div>

        <Dashboard base="USD" t={t} darkMode={darkMode} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start">

          <div className="lg:col-span-8 space-y-6">
            <div className={`rounded-[2.5rem] p-[2px] ${darkMode ? 'bg-gradient-to-br from-white/10 to-transparent shadow-2xl shadow-black/50' : 'bg-white shadow-xl shadow-blue-100/50'}`}>
              <div className={`rounded-[2.5rem] h-full ${darkMode ? 'bg-[#112240]/80' : 'bg-white'} backdrop-blur-md overflow-hidden`}>
                <Graph from="USD" to="EUR" darkMode={darkMode} />
              </div>
            </div>

            {/* Reverting to CurrencyGridHeatmap (The Premium one) */}
            <CurrencyHeatmap t={t} darkMode={darkMode} />

            <BananaIndex t={t} darkMode={darkMode} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`rounded-[2.5rem] p-[2px] ${darkMode ? 'bg-gradient-to-br from-white/10 to-transparent shadow-lg' : 'bg-white shadow-lg shadow-blue-100/50'}`}>
                <div className={`rounded-[2.5rem] h-full ${darkMode ? 'bg-[#112240]/80' : 'bg-white'} backdrop-blur-md overflow-hidden`}>
                  <Graph from="GBP" to="USD" darkMode={darkMode} />
                </div>
              </div>
              <div className={`rounded-[2.5rem] p-[2px] ${darkMode ? 'bg-gradient-to-br from-white/10 to-transparent shadow-lg' : 'bg-white shadow-lg shadow-blue-100/50'}`}>
                <div className={`rounded-[2.5rem] h-full ${darkMode ? 'bg-[#112240]/80' : 'bg-white'} backdrop-blur-md overflow-hidden`}>
                  <Graph from="EUR" to="JPY" darkMode={darkMode} />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 z-20">
            <Converter t={t} darkMode={darkMode} onConvert={handleConversion} restoreData={restoreData} />
            <RecentHistory t={t} darkMode={darkMode} history={history} onRestore={handleRestore} onClear={clearHistory} />
            <QuickSplit t={t} darkMode={darkMode} />
            <PriceAlerts t={t} darkMode={darkMode} alerts={alerts} onAddAlert={addAlert} onDeleteAlert={deleteAlert} />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
