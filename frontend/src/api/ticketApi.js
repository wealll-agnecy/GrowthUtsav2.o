import apiClient from './apiClient';

const API_URL = '/api/v1/tickets';

/**
 * Fetch ticket details from the backend
 */
export const getTicket = async (id) => {
    return await apiClient.get(`${API_URL}/${id}`);
};

/**
 * Robust PDF download that includes authentication headers
 */
export const downloadTicketPDF = async (id) => {
    try {
        const response = await apiClient.get(`${API_URL}/${id}/download`, {
            responseType: 'blob', // Important for binary data
        });

        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // Use a descriptive filename
        link.setAttribute('download', `Ticket-${id.substring(0,8)}.pdf`);
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Download failed:', err);
        throw err;
    }
};

/**
 * Publicly verify a ticket ID (used by the scanning page)
 */
export const verifyTicketForScanner = async (uuid) => {
    return await apiClient.get(`/api/ticket/verify/${uuid}`);
};
