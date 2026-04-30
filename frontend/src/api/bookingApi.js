import axios from 'axios';

const API_URL = '/api/v1/bookings';

export const checkout = async (bookingData) => {
    return await axios.post(`${API_URL}/demo-book`, bookingData);
};

export const demoBook = async (bookingData) => {
    return await axios.post(`${API_URL}/demo-book`, bookingData);
};

export const demoCheckout = async (bookingData) => {
    return await axios.post(`${API_URL}/demo-book`, bookingData);
};

export const verifyPayment = async (paymentData) => {
    return await axios.post(`${API_URL}/verify`, paymentData);
};

export const getMyBookings = async () => {
    return await axios.get(`${API_URL}/mybookings`);
};

export const initiateInstallment = async (id, amount) => {
    return await axios.post(`${API_URL}/${id}/installment`, { amount });
};

export const verifyInstallment = async (paymentData) => {
    return await axios.post(`${API_URL}/verify-installment`, paymentData);
};

export const resendTicketEmail = async (id) => {
    return await axios.post(`${API_URL}/resend-ticket/${id}`);
};
