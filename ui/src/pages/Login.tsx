import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as { from?: Location })?.from?.pathname ?? '/';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white text-sm ' +
    'focus:border-cyber-primary focus:outline-none focus:ring-1 focus:ring-cyber-primary/30 transition-all duration-300';

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-bg px-4">
      <div className="w-full max-w-md glass rounded-2xl p-8 border border-cyber-primary/20">
        <a href="/" className="font-[family-name:var(--font-display)] text-xl font-bold tracking-widest block mb-6">
          CYBER<span className="text-cyber-primary">X</span>
        </a>

        <h1 className="text-lg font-semibold mb-1">Вход в аккаунт</h1>
        <p className="text-sm text-cyber-muted mb-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-cyber-primary hover:underline">Зарегистрироваться</Link>
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs text-cyber-muted uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs text-cyber-muted uppercase tracking-wider mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white font-bold text-sm uppercase tracking-widest hover:shadow-[0_0_25px_rgba(255,0,51,0.4)] transition-all duration-300 disabled:opacity-50 rounded"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <Link to="/" className="block mt-6 text-sm text-cyber-muted hover:text-cyber-primary transition-colors">
          ← На главную
        </Link>
      </div>
    </div>
  );
}
