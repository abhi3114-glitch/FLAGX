import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

interface Rule {
  type: string;
  operator: string;
  value: any;
  field?: string;
}

interface RuleBuilderProps {
  rules: Rule[];
  onSave: (rules: Rule[]) => void;
  editing: boolean;
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({ rules, onSave, editing }) => {
  const [localRules, setLocalRules] = useState<Rule[]>(rules);

  const ruleTypes = [
    { value: 'geo', label: 'Geographic Location' },
    { value: 'device', label: 'Device Type' },
    { value: 'percentage', label: 'Percentage Rollout' },
    { value: 'user', label: 'User ID' },
    { value: 'custom', label: 'Custom Field' }
  ];

  const operators = {
    geo: [
      { value: 'in', label: 'In Countries' },
      { value: 'not_in', label: 'Not In Countries' }
    ],
    device: [
      { value: 'is', label: 'Is' },
      { value: 'is_not', label: 'Is Not' },
      { value: 'in', label: 'In List' }
    ],
    percentage: [
      { value: 'less_than', label: 'Less Than' },
      { value: 'greater_than', label: 'Greater Than' }
    ],
    user: [
      { value: 'in', label: 'In List' },
      { value: 'not_in', label: 'Not In List' }
    ],
    custom: [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Not Equals' },
      { value: 'contains', label: 'Contains' },
      { value: 'greater_than', label: 'Greater Than' },
      { value: 'less_than', label: 'Less Than' }
    ]
  };

  const addRule = () => {
    setLocalRules([...localRules, { type: 'percentage', operator: 'less_than', value: 50 }]);
  };

  const removeRule = (index: number) => {
    setLocalRules(localRules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: string, value: any) => {
    const updated = [...localRules];
    updated[index] = { ...updated[index], [field]: value };
    setLocalRules(updated);
  };

  const handleSave = () => {
    onSave(localRules);
  };

  if (!editing && localRules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No rules configured. Click "Add Rule" to create targeting rules.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {localRules.map((rule, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Rule {index + 1}</span>
            {editing && (
              <button
                onClick={() => removeRule(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select
                value={rule.type}
                onChange={(e) => updateRule(index, 'type', e.target.value)}
                disabled={!editing}
                className="input text-sm"
              >
                {ruleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Operator</label>
              <select
                value={rule.operator}
                onChange={(e) => updateRule(index, 'operator', e.target.value)}
                disabled={!editing}
                className="input text-sm"
              >
                {operators[rule.type as keyof typeof operators]?.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
              {rule.type === 'percentage' ? (
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={rule.value}
                  onChange={(e) => updateRule(index, 'value', parseInt(e.target.value))}
                  disabled={!editing}
                  className="input text-sm"
                />
              ) : (
                <input
                  type="text"
                  value={Array.isArray(rule.value) ? rule.value.join(', ') : rule.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateRule(index, 'value', val.includes(',') ? val.split(',').map(s => s.trim()) : val);
                  }}
                  disabled={!editing}
                  className="input text-sm"
                  placeholder="e.g., US, CA, UK"
                />
              )}
            </div>
          </div>

          {rule.type === 'custom' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Field Name</label>
              <input
                type="text"
                value={rule.field || ''}
                onChange={(e) => updateRule(index, 'field', e.target.value)}
                disabled={!editing}
                className="input text-sm"
                placeholder="e.g., userRole, plan, tier"
              />
            </div>
          )}
        </div>
      ))}

      {editing && (
        <div className="flex space-x-3">
          <button onClick={addRule} className="btn-secondary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </button>
          <button onClick={handleSave} className="btn-primary flex items-center">
            <Save className="w-4 h-4 mr-2" />
            Save Rules
          </button>
        </div>
      )}
    </div>
  );
};

export default RuleBuilder;