
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Logo } from './ui/Logo';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Define a persistência com base no "Lembra-me"
            // browserLocalPersistence: Mantém logado mesmo se fechar o navegador
            // browserSessionPersistence: Desloga ao fechar a aba
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('E-mail ou senha incorretos.');
            } else {
                setError('Erro ao entrar. Tente novamente mais tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-sans">
            <div className="w-full max-w-md bg-[#1e293b] rounded-3xl p-8 shadow-2xl border border-slate-700/50 animate-fade-in">
                <div className="flex flex-col items-center mb-10">
                    <Logo size="xl" className="mb-2" />
                    <p className="text-slate-400 text-sm font-medium">Gestão Comercial Inteligente</p>
                </div>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm mb-6 flex items-center gap-3 animate-shake">
                        <i className="fas fa-exclamation-circle text-lg"></i>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail de Acesso</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="marcao@exemplo.com"
                            className="bg-slate-900/50 border-slate-700/50 h-14 !lowercase"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Sua Senha</label>
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="bg-slate-900/50 border-slate-700/50 h-14 pr-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors"
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 border-2 rounded ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600'}`}>
                                    {rememberMe && <i className="fas fa-check text-[10px] text-white absolute inset-0 flex items-center justify-center"></i>}
                                </div>
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter group-hover:text-slate-300 transition-colors">Lembra-me</span>
                        </label>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <i className="fas fa-spinner fa-spin text-xl"></i>
                        ) : (
                            'ENTRAR NO SISTEMA'
                        )}
                    </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-800 text-center">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">Tecnologia Argent Cloud</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
