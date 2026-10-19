import { Suspense } from 'react';
import PortalAtsView from '@/components/portal-ats-view';

export default function DashboardAtsCheckerPage() {
  return (
    <Suspense>
      <PortalAtsView />
    </Suspense>
  );
}
