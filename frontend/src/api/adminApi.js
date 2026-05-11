import axios from 'axios';

const BASE = '/api/v1/admin';

// â”€â”€ Organizer Requests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getPendingOrganizers = () => axios.get(`${BASE}/organizers/pending`);
export const getApprovedOrganizers = () => axios.get(`${BASE}/organizers/approved`);
export const getRejectedOrganizers = () => axios.get(`${BASE}/organizers/rejected`);
export const approveOrganizer = (id) => axios.patch(`${BASE}/organizers/${id}/approve`);
export const rejectOrganizer = (id, reason) => axios.patch(`${BASE}/organizers/${id}/reject`, { reason });

// â”€â”€ Users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getAllUsers = () => axios.get(`${BASE}/users`);

// â”€â”€ Events (moderation) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getAdminPendingEvents = () => axios.get(`${BASE}/events/pending`);
export const adminApproveEvent = (id) => axios.patch(`${BASE}/events/${id}/approve`);
export const adminRejectEvent = (id) => axios.patch(`${BASE}/events/${id}/reject`);

// â”€â”€ Staff Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getStaff = () => axios.get(`${BASE}/staff`);
export const createStaff = (staffData) => axios.post(`${BASE}/staff`, staffData);
export const deleteStaff = (id) => axios.delete(`${BASE}/staff/${id}`);
export const assignStaffToEvents = (id, assignedEvents) => axios.put(`${BASE}/staff/${id}/assign`, { assignedEvents });

// â”€â”€ Dashboard Statistics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getTotalRevenue = () => axios.get(`${BASE}/total-revenue`);
export const getNetProfit = () => axios.get(`${BASE}/net-profit`);
export const getActiveEvents = () => axios.get(`${BASE}/active-events`);
export const getTotalUsers = () => axios.get(`${BASE}/total-users`);
export const getTotalEvents = () => axios.get(`${BASE}/total-events`);
export const getTicketsSold = () => axios.get(`${BASE}/tickets-sold`);
export const getPendingRequests = () => axios.get(`${BASE}/pending-requests`);
export const getAdminStats = () => axios.get(`${BASE}/stats`);
