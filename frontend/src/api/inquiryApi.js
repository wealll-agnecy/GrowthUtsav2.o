import axios from 'axios';

const API_URL = '/api/v1/inquiries';

export const createInquiry = async (inquiryData) => {
    return await axios.post(`${API_URL}/create`, inquiryData);
};

export const getOrganizerInquiries = async () => {
    return await axios.get(`${API_URL}/organizer`);
};

export const updateInquiryStatus = async (id, statusData) => {
    return await axios.put(`${API_URL}/${id}`, statusData);
};

export const deleteInquiry = async (id) => {
    return await axios.delete(`${API_URL}/${id}`);
};
