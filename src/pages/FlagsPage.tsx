import React, { useEffect, useState } from 'react';
import { Plus, Search, Power, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllFlags, toggleFlag, killSwitch } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import CreateFlagModal from '../components/CreateFlagModal';
import FlagCard from '../components/FlagCard';

interface Flag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: string;
  rules: any[];
  created_at: string;
  updated_at: string;
}

const FlagsPage: React.FC = () => {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [environment, setEnvironment] = useState('development');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const { lastMessage } = useWebSocket();

  useEffect(() => {
    loadFlags();
  }, [environment]);

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'flag_update') {
        loadFlags();
      }
    }
  }, [lastMessage]);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const data = await getAllFlags(environment);
      setFlags(data);
    } catch (error) {
      console.error('Failed to load flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleFlag(id);
      loadFlags();
    } catch (error) {
      console.error('Failed to toggle flag:', error);
    }
  };

  const handleKillSwitch = async (id: string) => {
    if (confirm('Are you sure you want to activate the kill switch? This will immediately disable the flag.')) {
      try {
        await killSwitch(id, 'Emergency kill switch activated');
        loadFlags();
      } catch (error) {
        console.error('Failed to activate kill switch:', error);
      }
    }
  };

  const filteredFlags = flags.filter(flag =>
    flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Feature Flags</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Flag</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search flags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="input sm:w-48"
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlags.map((flag) => (
            <FlagCard
              key={flag.id}
              flag={flag}
              onToggle={handleToggle}
              onKillSwitch={handleKillSwitch}
              onClick={() => navigate(`/flags/${flag.id}`)}
            />
          ))}
        </div>
      )}

      {!loading && filteredFlags.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No flags found</p>
        </div>
      )}

      {showCreateModal && (
        <CreateFlagModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadFlags();
          }}
        />
      )}
    </div>
  );
};

export default FlagsPage;