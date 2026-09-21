import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StatsLayout } from '../components/live/StatsLayout';
import { GsiSetupGuide } from '../components/live/GsiSetupGuide';
import { postGsi } from '../services/api';

const DEMO_TOKEN = 'cyberx-demo-gsi-token-001';

function buildPayload(opts: {
  map?: string; round?: number; scoreCt?: number; scoreT?: number;
  phase?: string; roundPhase?: string; bomb?: string;
}) {
  const map = opts.map ?? 'de_dust2';
  const round = opts.round ?? 1;
  const scoreCt = opts.scoreCt ?? 0;
  const scoreT = opts.scoreT ?? 0;

  return {
    provider: { name: 'Counter-Strike 2', appid: 730 },
    map: {
      mode: 'competitive',
      name: map,
      phase: opts.phase ?? 'live',
      round,
      team_ct: { score: scoreCt, name: 'CyberX CT', consecutive_round_losses: 0 },
      team_t:  { score: scoreT, name: 'CyberX T',  consecutive_round_losses: 0 },
    },
    round: {
      phase: opts.roundPhase ?? 'live',
      bomb: opts.bomb ?? 'planted',
    },
    allplayers: {
      '76561198000000001': {
        name: 's1mple_fan',
        team: 'CT',
        state: { health: 87, armor: 100, money: 4200, helmet: true, round_killhs: 3 },
        match_stats: { kills: 12, deaths: 8, assists: 4, mvps: 2, score: 28 },
        weapons: { weapon_ak47: { state: 'holstered' }, weapon_m4a1: { state: 'active' } },
      },
      '76561198000000002': {
        name: 'NiKo_fan',
        team: 'CT',
        state: { health: 100, armor: 100, money: 5100, helmet: true, round_killhs: 2 },
        match_stats: { kills: 10, deaths: 9, assists: 2, mvps: 1, score: 24 },
        weapons: { weapon_awp: { state: 'active' } },
      },
      '76561198000000003': {
        name: 'donk_fan',
        team: 'T',
        state: { health: 0, armor: 0, money: 1400, round_killhs: 1 },
        match_stats: { kills: 14, deaths: 10, assists: 1, mvps: 3, score: 32 },
        weapons: { weapon_ak47: { state: 'active' } },
      },
      '76561198000000004': {
        name: 'ZywOo_fan',
        team: 'T',
        state: { health: 45, armor: 50, money: 2800, helmet: false, round_killhs: 4 },
        match_stats: { kills: 11, deaths: 11, assists: 3, mvps: 1, score: 26 },
        weapons: { weapon_deagle: { state: 'active' } },
      },
      '76561198000000005': {
        name: 'm0NESY_fan',
        team: 'CT',
        state: { health: 62, armor: 50, round_killhs: 1 },
        match_stats: { kills: 8, deaths: 7, assists: 5, mvps: 0, score: 21 },
        weapons: { weapon_m4a1_silencer: { state: 'active' } },
      },
      '76561198000000006': {
        name: 'jL_fan',
        team: 'T',
        state: { health: 100, armor: 100, round_killhs: 0 },
        match_stats: { kills: 9, deaths: 12, assists: 2, mvps: 0, score: 19 },
        weapons: { weapon_galilar: { state: 'active' } },
      },
    },
    auth: { token: DEMO_TOKEN },
  };
}

export function GsiTestPage() {
  const [token, setToken]     = useState(DEMO_TOKEN);
  const [round, setRound]     = useState(1);
  const [scoreCt, setScoreCt] = useState(0);
  const [scoreT, setScoreT]   = useState(0);
  const [map, setMap]         = useState('de_dust2');
  const [log, setLog]         = useState<string[]>([]);
  const [busy, setBusy]       = useState(false);

  const send = async (label: string, payload: unknown) => {
    setBusy(true);
    try {
      await postGsi(token, payload);
      setLog(prev => [`[${new Date().toLocaleTimeString()}] OK — ${label}`, ...prev].slice(0, 30));
    } catch (e) {
      setLog(prev => [`[${new Date().toLocaleTimeString()}] ERR — ${e instanceof Error ? e.message : 'fail'}`, ...prev].slice(0, 30));
    } finally {
      setBusy(false);
    }
  };

  const sendCurrent = (label: string) =>
    send(label, buildPayload({ map, round, scoreCt, scoreT }));

  const actions = [
    { label: 'Start Match', fn: () => { setRound(1); setScoreCt(0); setScoreT(0); send('Start match', buildPayload({ map, round: 1, scoreCt: 0, scoreT: 0 })); } },
    { label: 'Send State', fn: () => sendCurrent('Current state') },
    { label: 'CT +1 Round', fn: () => { const r = round + 1, c = scoreCt + 1; setRound(r); setScoreCt(c); send('CT round', buildPayload({ map, round: r, scoreCt: c, scoreT })); } },
    { label: 'T +1 Round', fn: () => { const r = round + 1, t = scoreT + 1; setRound(r); setScoreT(t); send('T round', buildPayload({ map, round: r, scoreCt, scoreT: t })); } },
    { label: 'Bomb Planted', fn: () => send('Bomb planted', buildPayload({ map, round, scoreCt, scoreT, bomb: 'planted' })) },
    { label: 'Round Freeze', fn: () => send('Freeze time', buildPayload({ map, round, scoreCt, scoreT, roundPhase: 'freezetime' })) },
    { label: 'End Map', fn: () => send('Map over', buildPayload({ map, round, scoreCt, scoreT, phase: 'gameover' })) },
  ];

  return (
    <StatsLayout audience="admin" active="test">
      <div className="live-stats__grid-2">
        <div>
          <div className="live-stats__section-title">
            <h2>GSI Simulator</h2>
            <span className="live-stats__section-meta">offline testing</span>
          </div>

          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', color: '#555', marginBottom: 14 }}>SETTINGS</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, color: '#555', display: 'block', marginBottom: 4 }}>GSI TOKEN</label>
              <input
                value={token}
                onChange={e => setToken(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: '#111', border: '1px solid #333', borderRadius: 3, color: '#fff', fontSize: 12, fontFamily: 'monospace' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 10, color: '#555', display: 'block', marginBottom: 4 }}>MAP</label>
                <select
                  value={map}
                  onChange={e => setMap(e.target.value)}
                  style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: 3, color: '#fff', fontSize: 12 }}
                >
                  {['de_dust2', 'de_mirage', 'de_inferno', 'de_nuke', 'de_ancient', 'de_anubis'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, color: '#555', display: 'block', marginBottom: 4 }}>ROUND</label>
                <input
                  type="number"
                  value={round}
                  onChange={e => setRound(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: 3, color: '#fff', fontSize: 12 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: '#555', display: 'block', marginBottom: 4 }}>SCORE CT : T</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  <input type="number" value={scoreCt} onChange={e => setScoreCt(Number(e.target.value))}
                    style={{ flex: 1, padding: '8px', background: '#111', border: '1px solid #333', borderRadius: 3, color: '#5b9bd5', fontSize: 12, fontWeight: 700 }} />
                  <input type="number" value={scoreT} onChange={e => setScoreT(Number(e.target.value))}
                    style={{ flex: 1, padding: '8px', background: '#111', border: '1px solid #333', borderRadius: 3, color: '#e8a838', fontSize: 12, fontWeight: 700 }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,85,0,0.25)', borderRadius: 4, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', color: '#ff5500', marginBottom: 14 }}>ACTIONS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
              {actions.map(({ label, fn }) => (
                <button
                  key={label}
                  type="button"
                  onClick={fn}
                  disabled={busy}
                  style={{
                    padding: '10px 8px', fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                    background: 'rgba(255,85,0,0.08)', border: '1px solid rgba(255,85,0,0.25)',
                    borderRadius: 3, color: '#ff5500', cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.5 : 1,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
              <Link to="/live" style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, textDecoration: 'none' }}>
                Open /live →
              </Link>
              <Link to="/live/1" style={{ fontSize: 11, color: '#64748b', textDecoration: 'none' }}>
                Demo server #1 →
              </Link>
            </div>
          </div>

          {log.length > 0 && (
            <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: 4, padding: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#555', marginBottom: 8 }}>LOG</div>
              {log.map((l, i) => (
                <div key={i} style={{ fontSize: 11, fontFamily: 'monospace', color: l.includes('ERR') ? '#ef4444' : '#22c55e', padding: '2px 0' }}>
                  {l}
                </div>
              ))}
            </div>
          )}
        </div>

        <aside>
          <div className="live-stats__sidebar-box">
            <h3>How to test</h3>
            <ol style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#888', lineHeight: 1.9 }}>
              <li>API running on :5006</li>
              <li>Click <strong style={{ color: '#ff5500' }}>Start Match</strong></li>
              <li>Open <Link to="/live" style={{ color: '#ff5500' }}>/live</Link></li>
              <li>Click server card → scoreboard</li>
              <li>Use CT/T +1 to simulate rounds</li>
              <li><strong>End Map</strong> saves to history</li>
            </ol>
          </div>
          <GsiSetupGuide compact apiHost="http://localhost:5006" />
        </aside>
      </div>
    </StatsLayout>
  );
}
