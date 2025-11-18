import React from 'react';
import { Power, AlertTriangle, Calendar } from 'lucide-react';
import clsx from 'clsx';

interface FlagCardProps {
  flag: any;
  onToggle: (id: string) => void;
  onKillSwitch: (id: string) => void;
  onClick: () => void;
}

const FlagCard: React.FC<FlagCardProps> = ({ flag, onToggle, onKillSwitch, onClick }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{flag.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{flag.description}</p>
          </div>
          <span
            className={clsx('badge ml-2', {
              'badge-success': flag.enabled,
              'badge-danger': !flag.enabled
            })}
          >
            {flag.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        <div className="flex items-center text-xs text-gray-500 mb-4">
          <Calendar className="w-3 h-3 mr-1" />
          <span>Updated {new Date(flag.updated_at).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(flag.id);
            }}
            className={clsx('flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors', {
              'bg-green-100 text-green-700 hover:bg-green-200': flag.enabled,
              'bg-gray-100 text-gray-700 hover:bg-gray-200': !flag.enabled
            })}
          >
            <Power className="w-4 h-4 mr-1" />
            Toggle
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onKillSwitch(flag.id);
            }}
            className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            title="Kill Switch"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        </div>
      </div>
      {flag.rules && flag.rules.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">{flag.rules.length} rule(s) configured</p>
        </div>
      )}
    </div>
  );
};

export default FlagCard;