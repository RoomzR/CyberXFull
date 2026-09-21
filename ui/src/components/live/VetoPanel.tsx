import type { VetoSeries } from '../../services/api';
import { mapTheme } from './liveUtils';
import { getFormatDef, mapRolesFromLog, actionLabel, getTotalSteps } from './vetoFormats';

const STATUS: Record<string, { bg: string; color: string; label: string }> = {
  ban:     { bg: '#3d1515', color: '#ff6b6b', label: 'BANNED' },
  pick:    { bg: '#153d20', color: '#3dd68c', label: 'PICKED' },
  decider: { bg: '#3d3510', color: '#ffd166', label: 'DECIDER' },
};

export function VetoPanel({ series }: { series: VetoSeries }) {
  const done = series.status === 'live' || series.status === 'finished';
  const fmt = getFormatDef(series.format);
  const mapRoles = mapRolesFromLog(series.format, series.log, series.mapPool);
  const totalSteps = series.totalSteps || getTotalSteps(series.format);
  const playableMaps = series.playableMaps ?? [];

  return (
    <div className="veto-panel veto-panel--enhanced">
      <div className="veto-panel__header">
        <div className="veto-panel__team-col">
          <div className="veto-panel__logo veto-panel__logo--t1">{series.team1Name.slice(0, 2).toUpperCase()}</div>
          <div>
            <div className="veto-panel__team-name">{series.team1Name}</div>
            <div className="veto-panel__team-tag">TEAM 1</div>
          </div>
        </div>
        <div className="veto-panel__center">
          <div className={`veto-panel__status${done ? ' veto-panel__status--done' : ''}`}>
            {done ? '✓ VETO COMPLETE' : 'MAP VETO IN PROGRESS'}
          </div>
          <div className="veto-panel__format-row">
            <span className="veto-format-badge">{fmt.short}</span>
            <span className="veto-panel__format">{fmt.mapsPlayed} {fmt.mapsPlayed === 1 ? 'карта' : fmt.mapsPlayed < 5 ? 'карты' : 'карт'}</span>
          </div>
        </div>
        <div className="veto-panel__team-col veto-panel__team-col--right">
          <div>
            <div className="veto-panel__team-name">{series.team2Name}</div>
            <div className="veto-panel__team-tag">TEAM 2</div>
          </div>
          <div className="veto-panel__logo veto-panel__logo--t2">{series.team2Name.slice(0, 2).toUpperCase()}</div>
        </div>
      </div>

      {playableMaps.length > 0 && (
        <div className="veto-series-maps">
          <div className="veto-series-maps__title">Карты серии</div>
          <div className="veto-series-maps__row">
            {playableMaps.map(pm => {
              const theme = mapTheme(pm.mapName);
              return (
                <div key={pm.order} className="veto-series-map-chip">
                  <span className="veto-series-map-chip__num">{pm.label}</span>
                  <span
                    className="veto-series-map-chip__thumb"
                    style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
                  />
                  <span className="veto-series-map-chip__name">{theme.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!done && (
        <div className="veto-progress-bar">
          <div
            className="veto-progress-bar__fill"
            style={{ width: `${Math.round((series.log.length / totalSteps) * 100)}%` }}
          />
          <span className="veto-progress-bar__text">
            Шаг {series.log.length}/{totalSteps}
          </span>
        </div>
      )}

      <div className="veto-panel__body">
        <div className="veto-panel__maps">
          {series.mapPool.map(entry => {
            const theme = mapTheme(entry.mapName);
            const st = STATUS[entry.status];
            const teamName = entry.team === 'team1' ? series.team1Name : entry.team === 'team2' ? series.team2Name : null;
            const isAvailable = entry.status === 'available';
            const roleInfo = mapRoles[entry.mapName];

            return (
              <div
                key={entry.mapName}
                className={`veto-map-row veto-map-row--v2${!isAvailable ? ` veto-map-row--${entry.status}` : ''}${roleInfo ? ' veto-map-row--played' : ''}`}
              >
                <div
                  className="veto-map-row__thumb"
                  style={{ background: `linear-gradient(160deg, ${theme.from} 0%, ${theme.to} 100%)` }}
                >
                  {!isAvailable && entry.status === 'ban' && <span className="veto-map-row__ban-x">✕</span>}
                  {roleInfo && <span className="veto-map-row__map-slot">{roleInfo.label}</span>}
                </div>
                <div className="veto-map-row__info">
                  <div className="veto-map-row__name">{theme.label}</div>
                  {entry.sideNote && <div className="veto-map-row__note">{entry.sideNote}</div>}
                  {teamName && !isAvailable && (
                    <div className="veto-map-row__by">{teamName}</div>
                  )}
                </div>
                {st && (
                  <span className="veto-map-row__badge" style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}33` }}>
                    {st.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {series.log.length > 0 && (
          <div className="veto-panel__log veto-panel__log--v2">
            <div className="veto-panel__log-title">VETO LOG</div>
            {series.log.map(entry => (
              <div key={entry.step} className="veto-log-line veto-log-line--v2">
                <span className="veto-log-line__num">{entry.step}</span>
                <span className="veto-log-line__action" data-action={entry.label.toLowerCase()}>{actionLabel(entry.label)}</span>
                <span className="veto-log-line__text">
                  <strong>{entry.team}</strong> → {mapTheme(entry.map).label}
                  {entry.note && <em> ({entry.note})</em>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
