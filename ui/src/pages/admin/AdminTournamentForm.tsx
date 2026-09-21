import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin';
import type { TournamentFormData } from '../../types/admin';
import { getAdminKey } from './AdminLogin';

const emptyForm: TournamentFormData = {
  titleRu: '', titleEn: '', descriptionRu: '', descriptionEn: '',
  game: 'CS2', status: 'upcoming',
  startDate: new Date().toISOString().slice(0, 10), endDate: '',
  prizePool: 0, registrationUrl: '', rulesUrl: '', isFeatured: false,
};

const GAMES = ['CS2', 'Valorant', 'League of Legends', 'Fortnite', 'Dota 2'];
const STATUSES = ['registration', 'upcoming', 'ongoing', 'finished'];

const inputClass = 'w-full mt-1 px-3 py-2 bg-black/40 border border-white/10 rounded text-white text-sm focus:border-cyber-primary focus:outline-none transition-colors duration-300';

export function AdminTournamentForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const apiKey = getAdminKey();
  const [form, setForm] = useState<TournamentFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!apiKey) { navigate('/admin'); return; }
    if (!isEdit || !id) return;
    adminApi.getTournament(apiKey, Number(id)).then((item) =>
      setForm({
        titleRu: item.titleRu, titleEn: item.titleEn,
        descriptionRu: item.descriptionRu, descriptionEn: item.descriptionEn,
        game: item.game, status: item.status,
        startDate: item.startDate.slice(0, 10),
        endDate: item.endDate?.slice(0, 10) ?? '',
        prizePool: item.prizePool,
        registrationUrl: item.registrationUrl, rulesUrl: item.rulesUrl,
        isFeatured: item.isFeatured,
      }),
    ).catch(() => setError(true));
  }, [apiKey, id, isEdit, navigate]);

  const update = <K extends keyof TournamentFormData>(key: K, value: TournamentFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;
    setSaving(true);
    setError(false);
    try {
      if (isEdit && id) await adminApi.updateTournament(apiKey, Number(id), form);
      else await adminApi.createTournament(apiKey, form);
      navigate('/admin/tournaments');
    } catch { setError(true); }
    finally { setSaving(false); }
  };

  if (!apiKey) return null;

  return (
    <div className="min-h-screen bg-cyber-bg">
      <header className="glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <span className="font-[family-name:var(--font-display)] font-bold tracking-widest">CYBER<span className="text-cyber-primary">X</span> Admin</span>
        <Link to="/admin/tournaments" className="text-sm text-cyber-muted hover:text-cyber-primary transition-colors">← {t('admin.back_list')}</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold uppercase tracking-wider mb-6">
          {isEdit ? t('admin.edit_tournament') : t('admin.new_tournament')}
        </h1>
        {error && <p className="text-red-400 mb-4 text-sm">{t('admin.save_error')}</p>}

        <form onSubmit={submit} className="space-y-5">
          {(['Ru', 'En'] as const).map((lang) => (
            <fieldset key={lang} className="glass rounded-xl p-5 border border-white/5 space-y-3">
              <legend className="text-xs font-bold uppercase tracking-widest text-cyber-primary px-2">{lang === 'Ru' ? '🇷🇺 Русский' : '🇬🇧 English'}</legend>
              <label className="block text-xs text-cyber-muted uppercase tracking-wider">
                {t('admin.field_title')}
                <input className={inputClass} value={form[`title${lang}`]} onChange={(e) => update(`title${lang}`, e.target.value)} required />
              </label>
              <label className="block text-xs text-cyber-muted uppercase tracking-wider">
                {t('admin.field_description')}
                <textarea className={inputClass} rows={3} value={form[`description${lang}`]} onChange={(e) => update(`description${lang}`, e.target.value)} required />
              </label>
            </fieldset>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <label className="text-xs text-cyber-muted uppercase tracking-wider">
              {t('admin.col_game')}
              <select className={inputClass} value={form.game} onChange={(e) => update('game', e.target.value)}>
                {GAMES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label className="text-xs text-cyber-muted uppercase tracking-wider">
              {t('admin.col_status')}
              <select className={inputClass} value={form.status} onChange={(e) => update('status', e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="text-xs text-cyber-muted uppercase tracking-wider">
              {t('admin.field_start')}
              <input type="date" className={inputClass} value={form.startDate} onChange={(e) => update('startDate', e.target.value)} required />
            </label>
            <label className="text-xs text-cyber-muted uppercase tracking-wider">
              {t('admin.field_end')}
              <input type="date" className={inputClass} value={form.endDate} onChange={(e) => update('endDate', e.target.value)} />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => update('isFeatured', e.target.checked)} className="accent-cyber-primary" />
            {t('admin.col_featured')}
          </label>

          <label className="block text-xs text-cyber-muted uppercase tracking-wider">
            {t('admin.col_prize')} (BYN)
            <input type="number" className={inputClass} value={form.prizePool} onChange={(e) => update('prizePool', Number(e.target.value))} min={0} />
          </label>

          <label className="block text-xs text-cyber-muted uppercase tracking-wider">
            {t('admin.field_registration')}
            <input className={inputClass} value={form.registrationUrl} onChange={(e) => update('registrationUrl', e.target.value)} required />
          </label>
          <label className="block text-xs text-cyber-muted uppercase tracking-wider">
            {t('admin.field_rules')}
            <input className={inputClass} value={form.rulesUrl} onChange={(e) => update('rulesUrl', e.target.value)} required />
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="px-6 py-3 bg-cyber-primary text-white text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,0,51,0.4)] transition-shadow disabled:opacity-50">
              {saving ? t('loading') : t('admin.save')}
            </button>
            <Link to="/admin/tournaments" className="px-6 py-3 border border-white/10 text-xs font-bold uppercase tracking-widest hover:border-cyber-primary/50 transition-colors">{t('admin.cancel')}</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
