import apiClient from './apiClient';

const BASE = '/api/v1/admin';

// â”€â”€ Organizer Requests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getPendingOrganizers = () => apiClient.get(`${BASE}/organizers/pending`);
export const getApprovedOrganizers = () => apiClient.get(`${BASE}/organizers/approved`);
export const getRejectedOrganizers = () => apiClient.get(`${BASE}/organizers/rejected`);
export const approveOrganizer = (id) => apiClient.patch(`${BASE}/organizers/${id}/approve`);
export const rejectOrganizer = (id, reason) => apiClient.patch(`${BASE}/organizers/${id}/reject`, { reason });

// â”€â”€ Users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getAllUsers = () => apiClient.get(`${BASE}/users`);

// â”€â”€ Events (moderation) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getAdminPendingEvents = () => apiClient.get(`${BASE}/events/pending`);
export const adminApproveEvent = (id) => apiClient.patch(`${BASE}/events/${id}/approve`);
export const adminRejectEvent = (id) => apiClient.patch(`${BASE}/events/${id}/reject`);

// â”€â”€ Staff Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getStaff = () => apiClient.get(`${BASE}/staff`);
export const createStaff = (staffData) => apiClient.post(`${BASE}/staff`, staffData);
export const deleteStaff = (id) => apiClient.delete(`${BASE}/staff/${id}`);
export const assignStaffToEvents = (id, assignedEvents) => apiClient.put(`${BASE}/staff/${id}/assign`, { assignedEvents });

// â”€â”€ Dashboard Statistics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getTotalRevenue = () => apiClient.get(`${BASE}/total-revenue`);
export const getNetProfit = () => apiClient.get(`${BASE}/net-profit`);
export const getActiveEvents = () => apiClient.get(`${BASE}/active-events`);
export const getTotalUsers = () => apiClient.get(`${BASE}/total-users`);
export const getTotalEvents = () => apiClient.get(`${BASE}/total-events`);
export const getTicketsSold = () => apiClient.get(`${BASE}/tickets-sold`);
export const getPendingRequests = () => apiClient.get(`${BASE}/pending-requests`);
export const getAdminStats = () => apiClient.get(`${BASE}/stats`);
