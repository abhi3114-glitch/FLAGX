import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FlagsPage from './pages/FlagsPage';
import FlagDetailPage from './pages/FlagDetailPage';
import SegmentsPage from './pages/SegmentsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/flags" element={<FlagsPage />} />
        <Route path="/flags/:id" element={<FlagDetailPage />} />
        <Route path="/segments" element={<SegmentsPage />} />
        <Route path="/audit" element={<AuditLogsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;