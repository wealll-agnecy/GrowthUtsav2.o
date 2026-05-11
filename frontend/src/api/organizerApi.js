import apiClient from './apiClient';

const API_URL = '/api/v1/organizer';

export const getStaff = () => apiClient.get(`${API_URL}/staff`);
export const createStaff = (staffData) => apiClient.post(`${API_URL}/staff`, staffData);
export const deleteStaff = (id) => apiClient.delete(`${API_URL}/staff/${id}`);
export const assignStaffToEvents = (id, eventIds) => apiClient.put(`${API_URL}/staff/${id}/assign`, { assignedEvents: eventIds });
