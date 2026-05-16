import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Loader } from '../../../components/common/Loader';
import { ErrorMessage } from '../../../components/common/ErrorMessage';

// Mock data for Lineage 2 Clan Members
const mockPeople = [
  { id: 1, name: 'Legolas', role: 'Silver Ranger', level: 78, status: 'Online', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
  { id: 2, name: 'Gimli', role: 'Bounty Hunter', level: 75, status: 'Offline', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: 3, name: 'Gandalf', role: 'Spellsinger', level: 80, status: 'In Party', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d' },
  { id: 4, name: 'Aragorn', role: 'Gladiator', level: 79, status: 'Online', avatar: 'https://i.pravatar.cc/150?u=a04258a2462d826712d' },
  { id: 5, name: 'Elrond', role: 'Bishop', level: 76, status: 'Offline', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024e' },
];

export const PeopleListCard: React.FC = () => {
  const [people, setPeople] = useState<typeof mockPeople>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeople = () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      setPeople(mockPeople);
      setIsLoading(false);
    }, 1500);
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
      case 'Offline': return 'bg-slate-500/20 text-slate-400 border-slate-500/20';
      case 'In Party': return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <Card title="Clan Members" className="h-[500px]">
      {isLoading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchPeople} />
      ) : (
        <div className="flex h-[420px] flex-col overflow-y-auto pr-2 custom-scrollbar">
          <ul className="space-y-4">
            {people.map((person) => (
              <li key={person.id} className="group flex items-center justify-between rounded-xl bg-slate-800/50 p-3 transition-colors hover:bg-slate-800 border border-transparent hover:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={person.avatar} 
                      alt={person.name} 
                      className="h-10 w-10 rounded-full object-cover border border-slate-600"
                    />
                    <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 ${person.status === 'Online' ? 'bg-emerald-500' : person.status === 'Offline' ? 'bg-slate-500' : 'bg-amber-500'}`}></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {person.name} <span className="text-xs text-orange-400">Lv.{person.level}</span>
                    </h4>
                    <p className="text-xs text-slate-500">{person.role}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(person.status)}`}>
                  {person.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
