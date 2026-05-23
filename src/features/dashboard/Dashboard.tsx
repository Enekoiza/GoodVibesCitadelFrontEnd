import React from 'react';
import { hasRegisteredRoles } from '../../constants';
import { useAuth } from '../auth/context/AuthContext';
import { PeopleListCard } from './components/PeopleListCard';
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
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <PeopleListCard />
        </div>
        {showUpcomingEvents ? (
          <div className="w-full shrink-0 lg:w-auto">
            <UpcomingEventsCard />
          </div>
        ) : null}
      </div>
    </div>
  );
};

