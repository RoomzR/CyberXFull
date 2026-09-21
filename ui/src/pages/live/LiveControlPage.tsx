import { StatsLayout } from '../../components/live/StatsLayout';
import { AdminLivePanel } from '../admin/AdminLivePanel';

export function LiveControlPage() {
  return (
    <StatsLayout audience="admin" active="control">
      <AdminLivePanel inLiveZone />
    </StatsLayout>
  );
}
