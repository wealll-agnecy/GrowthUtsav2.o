import axios from 'axios';

const API_URL = '/api/v1/analytics';

export const getOrganizerStats = async () => {
    return await axios.get(`${API_URL}/organizer`);
};

export const getAdminStats = async () => {
    return await axios.get(`${API_URL}/admin`);
};

export const getEventAttendees = async (eventId) => {
    return await axios.get(`${API_URL}/event/${eventId}/attendees`);
};
