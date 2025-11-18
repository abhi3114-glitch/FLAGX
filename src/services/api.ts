const API_BASE = '/api';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Flags
export const getAllFlags = (environment: string) =>
  fetchAPI(`/flags?environment=${environment}`);

export const getFlagById = (id: string) =>
  fetchAPI(`/flags/${id}`);

export const createFlag = (data: any) =>
  fetchAPI('/flags', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateFlag = (id: string, data: any) =>
  fetchAPI(`/flags/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteFlag = (id: string) =>
  fetchAPI(`/flags/${id}`, {
    method: 'DELETE',
  });

export const toggleFlag = (id: string) =>
  fetchAPI(`/flags/${id}/toggle`, {
    method: 'PATCH',
  });

export const killSwitch = (id: string, reason: string) =>
  fetchAPI(`/flags/${id}/kill-switch`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });

// Segments
export const getAllSegments = () =>
  fetchAPI('/segments');

export const getSegmentById = (id: string) =>
  fetchAPI(`/segments/${id}`);

export const createSegment = (data: any) =>
  fetchAPI('/segments', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Audit
export const getAuditLogs = (params?: any) => {
  const query = new URLSearchParams(params).toString();
  return fetchAPI(`/audit?${query}`);
};

export const getAuditLogsByFlag = (flagId: string) =>
  fetchAPI(`/audit/flag/${flagId}`);

// Analytics
export const getFlagAnalytics = (flagId: string, timeRange: string = '24h') =>
  fetchAPI(`/analytics/flags/${flagId}?timeRange=${timeRange}`);

export const getSystemMetrics = () =>
  fetchAPI('/analytics/metrics');

// Evaluation
export const evaluateFlag = (flagId: string, userId: string, context: any) =>
  fetchAPI('/evaluate', {
    method: 'POST',
    body: JSON.stringify({ flagId, userId, context }),
  });

export const bulkEvaluate = (flagIds: string[], userId: string, context: any) =>
  fetchAPI('/evaluate/bulk', {
    method: 'POST',
    body: JSON.stringify({ flagIds, userId, context }),
  });