import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function Auth({ t, darkMode }) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                // Sign Up
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Check your email for the login link!');
            } else {
                // Sign In
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`p-8 rounded-3xl backdrop-blur-md shadow-2xl border ${darkMode ? 'bg-[#112240]/90 border-white/10' : 'bg-white/90 border-white/20'}`}>
            <h2 className={`text-2xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500`}>
                {isSignUp ? 'Join BananaEx' : 'Welcome Back'}
            </h2>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                    <label className={`text-sm font-semibold ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email</label>
                    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500/50 ${darkMode ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                        <Mail className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                        <input
                            type="email"
                            required
                            className="bg-transparent border-none outline-none w-full font-medium"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className={`text-sm font-semibold ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Password</label>
                    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500/50 ${darkMode ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                        <Lock className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                        <input
                            type="password"
                            required
                            className="bg-transparent border-none outline-none w-full font-medium"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-purple-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className={`text-sm font-medium transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </button>
            </div>
        </div>
    );
}
