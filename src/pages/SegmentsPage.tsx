import React, { useEffect, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { getAllSegments } from '../services/api';

const SegmentsPage: React.FC = () => {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    try {
      const data = await getAllSegments();
      setSegments(data);
    } catch (error) {
      console.error('Failed to load segments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Segments</h1>
        <button className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Create Segment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.map((segment) => (
          <div key={segment.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">{segment.name}</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{segment.description}</p>
            <div className="text-xs text-gray-500">
              {Object.keys(segment.conditions).length} condition(s)
            </div>
          </div>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No segments created yet</p>
        </div>
      )}
    </div>
  );
};

export default SegmentsPage;