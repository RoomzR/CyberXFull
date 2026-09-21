import { StatsLayout } from '../../components/live/StatsLayout';
import { GsiSetupGuide } from '../../components/live/GsiSetupGuide';

export function LiveSetupPage() {
  return (
    <StatsLayout audience="admin" active="setup">
      <div className="live-stats__section-title">
        <h2>Setup Guide</h2>
        <span className="live-stats__section-meta">CS2 GSI → CyberX · только админ</span>
      </div>
      <GsiSetupGuide />
    </StatsLayout>
  );
}
