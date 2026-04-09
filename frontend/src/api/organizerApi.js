import axios from 'axios';

const API_URL = '/api/v1/organizer';

export const getStaff = () => axios.get(`${API_URL}/staff`);
export const createStaff = (staffData) => axios.post(`${API_URL}/staff`, staffData);
export const deleteStaff = (id) => axios.delete(`${API_URL}/staff/${id}`);
export const assignStaffToEvents = (id, eventIds) => axios.put(`${API_URL}/staff/${id}/assign`, { assignedEvents: eventIds });
