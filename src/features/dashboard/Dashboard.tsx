import React from 'react';
import { hasRegisteredRoles } from '../../constants';
import { useAuth } from '../auth/context/AuthContext';
import { MembersCard } from './components/MembersCard';
import { UpcomingEventsCard } from './components/UpcomingEventsCard';

export const Dashboard: React.FC = () => {
  const { roles } = useAuth();
  const showUpcomingEvents = hasRegisteredRoles(roles);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Bienvenido a Good Vibes Citadel</h2>
        <p className="text-slate-400">Panel Principal de la Constant Party</p>
      </header>

      {/* Main Content Area — events card solo ocupa el ancho del calendario */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-stretch">
        <div className="flex min-h-[32rem] flex-col">
          <MembersCard />
        </div>
        {showUpcomingEvents ? (
          <div className="flex min-h-[32rem] flex-col">
            <UpcomingEventsCard />
          </div>
        ) : null}
      </div>
    </div>
  );
};

