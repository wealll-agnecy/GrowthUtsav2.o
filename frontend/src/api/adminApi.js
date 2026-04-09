import axios from 'axios';

const BASE = '/api/v1/admin';

// ── Organizer Requests ─────────────────────────────────────
export const getPendingOrganizers = () => axios.get(`${BASE}/organizers/pending`);
export const getApprovedOrganizers = () => axios.get(`${BASE}/organizers/approved`);
export const getRejectedOrganizers = () => axios.get(`${BASE}/organizers/rejected`);
export const approveOrganizer = (id) => axios.patch(`${BASE}/organizers/${id}/approve`);
export const rejectOrganizer = (id, reason) => axios.patch(`${BASE}/organizers/${id}/reject`, { reason });

// ── Users ──────────────────────────────────────────────────
export const getAllUsers = () => axios.get(`${BASE}/users`);

// ── Events (moderation) ────────────────────────────────────
export const getAdminPendingEvents = () => axios.get(`${BASE}/events/pending`);
export const adminApproveEvent = (id) => axios.patch(`${BASE}/events/${id}/approve`);
export const adminRejectEvent = (id) => axios.patch(`${BASE}/events/${id}/reject`);

// ── Staff Management ──────────────────────────────────────
export const getStaff = () => axios.get(`${BASE}/staff`);
export const createStaff = (staffData) => axios.post(`${BASE}/staff`, staffData);
export const deleteStaff = (id) => axios.delete(`${BASE}/staff/${id}`);
export const assignStaffToEvents = (id, assignedEvents) => axios.put(`${BASE}/staff/${id}/assign`, { assignedEvents });

// ── Dashboard Statistics ────────────────────────────────────
export const getTotalRevenue = () => axios.get(`${BASE}/total-revenue`);
export const getNetProfit = () => axios.get(`${BASE}/net-profit`);
export const getActiveEvents = () => axios.get(`${BASE}/active-events`);
export const getTotalUsers = () => axios.get(`${BASE}/total-users`);
export const getTotalEvents = () => axios.get(`${BASE}/total-events`);
export const getTicketsSold = () => axios.get(`${BASE}/tickets-sold`);
export const getPendingRequests = () => axios.get(`${BASE}/pending-requests`);
