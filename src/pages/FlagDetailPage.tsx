import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import { getFlagById, deleteFlag, updateFlag } from '../services/api';
import RuleBuilder from '../components/RuleBuilder';

const FlagDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [flag, setFlag] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (id) {
      loadFlag();
    }
  }, [id]);

  const loadFlag = async () => {
    try {
      setLoading(true);
      const data = await getFlagById(id!);
      setFlag(data);
    } catch (error) {
      console.error('Failed to load flag:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this flag?')) {
      try {
        await deleteFlag(id!);
        navigate('/flags');
      } catch (error) {
        console.error('Failed to delete flag:', error);
      }
    }
  };

  const handleSaveRules = async (rules: any[]) => {
    try {
      await updateFlag(id!, { ...flag, rules });
      loadFlag();
      setEditing(false);
    } catch (error) {
      console.error('Failed to update rules:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!flag) {
    return <div className="text-center py-12">Flag not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/flags')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Flags
        </button>
        <div className="flex space-x-2">
          <button onClick={() => setEditing(!editing)} className="btn-secondary flex items-center">
            <Edit className="w-4 h-4 mr-2" />
            {editing ? 'Cancel' : 'Edit Rules'}
          </button>
          <button onClick={handleDelete} className="btn-danger flex items-center">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{flag.name}</h1>
        <p className="text-gray-600 mb-4">{flag.description}</p>
        <div className="flex items-center space-x-4">
          <span className={`badge ${flag.enabled ? 'badge-success' : 'badge-danger'}`}>
            {flag.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <span className="badge badge-warning">{flag.environment}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Rules</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Rule
            </button>
          )}
        </div>
        <RuleBuilder
          rules={flag.rules || []}
          onSave={handleSaveRules}
          editing={editing}
        />
      </div>
    </div>
  );
};

export default FlagDetailPage;