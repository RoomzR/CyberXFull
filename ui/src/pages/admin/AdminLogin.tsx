import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'cyberx-admin-key';

export function getAdminKey(): string | null {
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearAdminKey() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [key, setKey] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    sessionStorage.setItem(STORAGE_KEY, key.trim());
    navigate('/admin/tournaments');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-bg px-4">
      <div className="w-full max-w-md glass rounded-2xl p-8 border border-cyber-primary/20">
        <div className="font-[family-name:var(--font-display)] text-xl font-bold tracking-widest mb-6">
          CYBER<span className="text-cyber-primary">X</span> Admin
        </div>
        <h1 className="text-lg font-semibold mb-1">{t('admin.login_title')}</h1>
        <p className="text-sm text-cyber-muted mb-6">{t('admin.login_hint')}</p>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={t('admin.api_key')}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-cyber-primary focus:outline-none focus:ring-1 focus:ring-cyber-primary/30 transition-all duration-300"
          />
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyber-primary to-cyber-secondary text-white font-bold text-sm uppercase tracking-widest hover:shadow-[0_0_25px_rgba(255,0,51,0.4)] transition-shadow duration-300">
            {t('admin.enter')}
          </button>
        </form>
        <a href="/" className="block mt-6 text-sm text-cyber-muted hover:text-cyber-primary transition-colors">{t('admin.back_site')}</a>
      </div>
    </div>
  );
}
