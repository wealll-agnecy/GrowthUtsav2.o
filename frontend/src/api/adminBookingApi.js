import apiClient from './apiClient';

// API instance with base URL is already configured in some projects, 
// but here we follow the existing pattern in adminApi.js
const API_URL = '/api/v1/admin/bookings';

export const getOrganizersWithStats = () => apiClient.get(`${API_URL}/organizers`);
export const getOrganizerBookings = (organizerId) => apiClient.get(`${API_URL}/${organizerId}`);
