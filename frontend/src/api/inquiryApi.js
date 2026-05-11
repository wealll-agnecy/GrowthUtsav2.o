import apiClient from './apiClient';

const API_URL = '/api/v1/inquiries';

export const createInquiry = async (inquiryData) => {
    return await apiClient.post(`${API_URL}/create`, inquiryData);
};

export const getOrganizerInquiries = async () => {
    return await apiClient.get(`${API_URL}/organizer`);
};

export const updateInquiryStatus = async (id, statusData) => {
    return await apiClient.put(`${API_URL}/${id}`, statusData);
};

export const deleteInquiry = async (id) => {
    return await apiClient.delete(`${API_URL}/${id}`);
};
