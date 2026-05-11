import apiClient from './apiClient';

const API_URL = '/api/v1/analytics';

export const getOrganizerStats = async () => {
    return await apiClient.get(`${API_URL}/organizer`);
};

export const getAdminStats = async () => {
    return await apiClient.get(`${API_URL}/admin`);
};

export const getEventAttendees = async (eventId) => {
    return await apiClient.get(`${API_URL}/event/${eventId}/attendees`);
};

export const getOrganizerRevenue = async () => {
    return await apiClient.get('/api/v1/organizer/revenue');
};
