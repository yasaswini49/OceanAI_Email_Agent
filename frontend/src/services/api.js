import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication
export const checkAuthStatus = async () => {
  const response = await api.get('/auth/status');
  return response.data;
};

export const initiateLogin = async () => {
  const response = await api.post('/auth/login');
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

// Emails
export const fetchEmails = async (count = 20) => {
  const response = await api.post('/emails/fetch', { count });
  return response.data;
};

export const processEmails = async (emails) => {
  const response = await api.post('/emails/process', { emails });
  return response.data;
};

export const generateReply = async (email) => {
  const response = await api.post('/emails/generate-reply', { email });
  return response.data;
};

// Chat
export const sendChatMessage = async (message, context) => {
  const response = await api.post('/chat', { message, context });
  return response.data;
};

// Prompts
export const getPrompts = async () => {
  const response = await api.get('/prompts');
  return response.data;
};

export const updatePrompts = async (prompts) => {
  const response = await api.post('/prompts', prompts);
  return response.data;
};

// Health check
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;