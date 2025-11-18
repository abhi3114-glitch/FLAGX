import React from 'react';
import { TrendingUp, Activity, Users, Zap } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Evaluations', value: '1.2M', icon: Activity, color: 'bg-blue-500' },
          { title: 'Avg Response Time', value: '45ms', icon: Zap, color: 'bg-green-500' },
          { title: 'Active Users', value: '15.3K', icon: Users, color: 'bg-purple-500' },
          { title: 'Success Rate', value: '99.8%', icon: TrendingUp, color: 'bg-orange-500' }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Evaluation Timeline</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Chart visualization would go here
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;