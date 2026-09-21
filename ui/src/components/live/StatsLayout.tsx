import { Link } from 'react-router-dom';
import { useIsAdmin } from '../../hooks/useRole';
import '../../styles/live-stats.css';

export type LiveAudience = 'guest' | 'admin';
type NavPage = 'live' | 'matches' | 'control' | 'setup' | 'test';

interface StatsLayoutProps {
  children: React.ReactNode;
  audience?: LiveAudience;
  active?: NavPage;
  liveCount?: number;
}

const GUEST_NAV: { id: NavPage; label: string; to: string }[] = [
  { id: 'live',    label: 'Эфир',   to: '/live' },
  { id: 'matches', label: 'Матчи',  to: '/live/matches' },
];

const ADMIN_NAV: { id: NavPage; label: string; to: string }[] = [
  { id: 'live',    label: 'Эфир',        to: '/live' },
  { id: 'matches', label: 'Матчи',       to: '/live/matches' },
  { id: 'control', label: 'Управление',  to: '/live/control' },
  { id: 'setup',   label: 'Setup',       to: '/live/control/setup' },
  { id: 'test',    label: 'GSI Test',    to: '/live/control/gsi-test' },
];

export function StatsLayout({
  children,
  audience = 'guest',
  active = 'live',
  liveCount = 0,
}: StatsLayoutProps) {
  const isAdmin = useIsAdmin();
  const isControl = audience === 'admin';
  const nav = isControl ? ADMIN_NAV : GUEST_NAV;

  return (
    <div className={`live-stats live-stats--${isControl ? 'admin' : 'guest'}`}>
      <header className="live-stats__header">
        <div className="live-stats__header-inner">
          <Link to="/live" className="live-stats__logo">
            CYBER<span>X</span>
            <span className="live-stats__logo-sub">
              {isControl ? 'CONTROL' : 'LIVE'}
            </span>
          </Link>

          <nav className="live-stats__nav">
            {nav.map(n => (
              <Link
                key={n.id}
                to={n.to}
                className={`live-stats__nav-link${active === n.id ? ' live-stats__nav-link--active' : ''}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="live-stats__header-actions">
            {liveCount > 0 && (
              <span className="live-stats__badge-live">{liveCount} LIVE</span>
            )}
            {isControl && (
              <Link to="/live" target="_blank" className="live-stats__pill live-stats__pill--broadcast">
                Публичный эфир ↗
              </Link>
            )}
            {!isControl && isAdmin && (
              <Link to="/live/control" className="live-stats__pill live-stats__pill--control">
                Управление
              </Link>
            )}
            <Link to="/" className="live-stats__nav-link live-stats__nav-link--muted">
              Сайт
            </Link>
          </div>
        </div>
        {isControl && <div className="live-stats__admin-strip" aria-hidden />}
      </header>
      <main className="live-stats__main">{children}</main>
    </div>
  );
}
