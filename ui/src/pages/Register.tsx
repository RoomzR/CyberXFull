import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return;
    }

    setLoading(true);
    try {
      await register(email, username, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
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

        <h1 className="text-lg font-semibold mb-1">Регистрация</h1>
        <p className="text-sm text-cyber-muted mb-6">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-cyber-primary hover:underline">Войти</Link>
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
            <label className="block text-xs text-cyber-muted uppercase tracking-wider mb-1">Никнейм</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className={inputClass}
              placeholder="CyberPlayer"
              required
              minLength={2}
              maxLength={50}
              autoComplete="username"
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
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-xs text-cyber-muted uppercase tracking-wider mb-1">Повторить пароль</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white font-bold text-sm uppercase tracking-widest hover:shadow-[0_0_25px_rgba(255,0,51,0.4)] transition-all duration-300 disabled:opacity-50 rounded"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <Link to="/" className="block mt-6 text-sm text-cyber-muted hover:text-cyber-primary transition-colors">
          ← На главную
        </Link>
      </div>
    </div>
  );
}
