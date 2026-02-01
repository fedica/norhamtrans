
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Lock, User, AlertCircle } from 'lucide-react';
import { useTranslation, useAuth } from '../App';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate network delay to feel like a real auth process
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Login fehlgeschlagen. Bitte überprüfen Sie E-Mail und Passwort.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600 text-white mb-6 shadow-xl shadow-blue-500/20">
            <Truck size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-white mb-1 tracking-tighter lowercase">{t.brand}</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] opacity-60">Logistik & Personal</p>
        </div>

        <form 
          onSubmit={handleLogin} 
          className={`bg-white rounded-3xl p-8 shadow-2xl space-y-6 transition-all ${error ? 'border-2 border-red-500/20 ring-4 ring-red-500/5' : ''}`}
        >
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center space-x-3 animate-bounce-short">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <p className="text-xs font-black text-red-600 leading-tight uppercase tracking-tight">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">E-Mail Adresse</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                required
                autoComplete="email"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm"
                placeholder="t.turcan@anviktrans.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Passwort</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                required
                autoComplete="current-password"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/30 transition-all transform active:scale-95 flex items-center justify-center space-x-2 text-base"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>{t.login}</span>
            )}
          </button>

          <div className="pt-2 text-center">
            <a href="#" className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 opacity-60">Passwort vergessen?</a>
          </div>
        </form>

        <p className="text-center mt-12 text-slate-500/30 text-[9px] font-black uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} {t.brand} logistics suite
        </p>
      </div>
      
      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-short {
          animation: bounce-short 0.4s ease-in-out 1;
        }
      `}</style>
    </div>
  );
};

export default Login;
