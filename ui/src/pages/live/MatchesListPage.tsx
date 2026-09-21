import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatsLayout } from '../../components/live/StatsLayout';
import { MatchResultRow } from '../../components/live/MatchCards';
import { liveApi, type MatchSummary } from '../../services/api';

export function MatchesListPage() {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    liveApi.matches(100)
      .then(setMatches)
      .finally(() => setLoading(false));
  }, []);

  return (
    <StatsLayout audience="guest" active="matches">
      <div className="live-stats__section-title">
        <h2>All Matches</h2>
        <span className="live-stats__section-meta">{matches.length} results</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#555' }}>LOADING...</div>
      ) : (
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, overflow: 'hidden' }}>
          {matches.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#555' }}>
              <div style={{ marginBottom: 12 }}>Нет завершённых матчей</div>
              <Link to="/gsi-test" style={{ color: '#ff5500', fontSize: 11 }}>Протестировать через GSI Simulator →</Link>
            </div>
          ) : (
            matches.map(m => <MatchResultRow key={m.id} m={m} />)
          )}
        </div>
      )}
    </StatsLayout>
  );
}
