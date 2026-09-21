import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin';
import type { TournamentAdmin } from '../../types/admin';
import { clearAdminKey, getAdminKey } from './AdminLogin';

export function AdminTournaments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<TournamentAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const apiKey = getAdminKey();

  useEffect(() => {
    if (!apiKey) { navigate('/admin'); return; }
    adminApi.getTournaments(apiKey).then(setItems).catch(() => setError(true)).finally(() => setLoading(false));
  }, [apiKey, navigate]);

  const handleDelete = async (id: number) => {
    if (!apiKey || !confirm(t('admin.confirm_delete'))) return;
    try {
      await adminApi.deleteTournament(apiKey, id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch { setError(true); }
  };

  if (!apiKey) return null;

  return (
    <div className="min-h-screen bg-cyber-bg">
      <header className="glass border-b border-white/5 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <span className="font-[family-name:var(--font-display)] font-bold tracking-widest">
          CYBER<span className="text-cyber-primary">X</span> Admin
        </span>
        <div className="flex gap-2 flex-wrap">
          <Link to="/admin/tournaments/new" className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-cyber-primary text-white hover:shadow-[0_0_15px_rgba(255,0,51,0.4)] transition-shadow">
            + {t('admin.new_tournament')}
          </Link>
          <a href="/" className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-white/10 hover:border-cyber-primary/50 transition-colors">{t('admin.back_site')}</a>
          <button type="button" onClick={() => { clearAdminKey(); navigate('/admin'); }} className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-white/10 hover:border-cyber-primary/50 transition-colors">
            {t('admin.logout')}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-wider mb-6">{t('admin.tournaments')}</h1>
        {loading && <p className="text-cyber-muted">{t('loading')}</p>}
        {error && <p className="text-red-400">{t('admin.load_error')}</p>}

        {!loading && (
          <div className="overflow-x-auto glass rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[10px] uppercase tracking-widest text-cyber-muted">
                  <th className="p-4">ID</th>
                  <th className="p-4">{t('admin.col_title')}</th>
                  <th className="p-4">{t('admin.col_game')}</th>
                  <th className="p-4">{t('admin.col_status')}</th>
                  <th className="p-4">{t('admin.col_prize')}</th>
                  <th className="p-4">{t('admin.col_featured')}</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">{item.id}</td>
                    <td className="p-4 font-medium">{item.titleRu}</td>
                    <td className="p-4">{item.game}</td>
                    <td className="p-4"><span className="text-cyber-primary text-xs font-bold uppercase">{item.status}</span></td>
                    <td className="p-4">{item.prizePool} BYN</td>
                    <td className="p-4">{item.isFeatured ? '✓' : '—'}</td>
                    <td className="p-4 flex gap-3">
                      <Link to={`/admin/tournaments/${item.id}`} className="text-cyber-primary text-xs font-bold hover:underline">{t('admin.edit')}</Link>
                      <button type="button" onClick={() => handleDelete(item.id)} className="text-red-400 text-xs font-bold hover:underline">{t('admin.delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
