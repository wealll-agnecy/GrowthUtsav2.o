import axios from 'axios';

export const getExpenses = () => axios.get('/api/v1/expenses');
export const addExpense = (data) => axios.post('/api/v1/expenses', data);
export const deleteExpense = (id) => axios.delete(`/api/v1/expenses/${id}`);
export const getProfitSummary = () => axios.get('/api/v1/expenses/summary');
export const getDetailedProfit = () => axios.get('/api/v1/expenses/profit');

