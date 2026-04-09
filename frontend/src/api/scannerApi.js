import axios from 'axios';

const API_URL = '/api/v1/tickets';

export const verifyTicket = async (ticketPayload) => {
    return await axios.post(`${API_URL}/verify`, ticketPayload);
};
