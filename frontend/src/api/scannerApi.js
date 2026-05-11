import apiClient from './apiClient';

const API_URL = '/api/v1/tickets';

export const verifyTicket = async (ticketPayload) => {
    return await apiClient.post(`${API_URL}/verify`, ticketPayload);
};
