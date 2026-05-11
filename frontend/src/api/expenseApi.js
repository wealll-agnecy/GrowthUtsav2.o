import apiClient from './apiClient';

export const getExpenses = () => apiClient.get('/api/v1/expenses');
export const addExpense = (data) => apiClient.post('/api/v1/expenses', data);
export const deleteExpense = (id) => apiClient.delete(`/api/v1/expenses/${id}`);
export const getProfitSummary = () => apiClient.get('/api/v1/expenses/summary');
export const getDetailedProfit = () => apiClient.get('/api/v1/expenses/profit');

