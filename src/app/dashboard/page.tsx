import SignOut from '@/components/signOut';

import type { FC } from 'react';

interface DashboardProps {
  
}

const Dashboard: FC<DashboardProps> = async () => {
  return <pre>
    <SignOut />
  </pre>;
}

export default Dashboard;