import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface UseStakeholderAPIProps {
  role: string;
  stakeholderId?: number;
}

export const useStakeholderAPI = ({ role, stakeholderId }: UseStakeholderAPIProps) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch alerts
  const fetchAlerts = async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAlerts(role, stakeholderId, filters) as { success?: boolean; alerts?: any[] };
      setAlerts(response.alerts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cases
  const fetchCases = async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getCases(role, stakeholderId, filters) as { success?: boolean; cases?: any[] };
      setCases(response.cases || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages
  const fetchMessages = async (isRead?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getMessages(role, stakeholderId, isRead) as { success?: boolean; messages?: any[] };
      setMessages(response.messages || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create alert
  const createAlert = async (alertData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.createAlert({
        ...alertData,
        stakeholderId
      });
      await fetchAlerts();
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create case
  const createCase = async (caseData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.createCase({
        ...caseData,
        createdBy: stakeholderId
      });
      await fetchCases();
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Send message to another role
  const sendMessage = async (messageData: {
    toRole: string;
    toStakeholderId?: number;
    messageType: string;
    subject: string;
    content: string;
    priority?: string;
    relatedCaseId?: number;
    relatedAlertId?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.sendMessage({
        ...messageData,
        fromRole: role,
        fromStakeholderId: stakeholderId || 0
      });
      await fetchMessages();
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update alert
  const updateAlert = async (id: number, updates: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.updateAlert(id, updates);
      await fetchAlerts();
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update case
  const updateCase = async (id: number, updates: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.updateCase(id, updates);
      await fetchCases();
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh data
  useEffect(() => {
    if (role && stakeholderId) {
      fetchAlerts();
      fetchCases();
      fetchMessages();

      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchAlerts();
        fetchCases();
        fetchMessages();
      }, 30000);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, stakeholderId]);

  return {
    alerts,
    cases,
    messages,
    loading,
    error,
    fetchAlerts,
    fetchCases,
    fetchMessages,
    createAlert,
    createCase,
    sendMessage,
    updateAlert,
    updateCase,
    refresh: () => {
      fetchAlerts();
      fetchCases();
      fetchMessages();
    }
  };
};

