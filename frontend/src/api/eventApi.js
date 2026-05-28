import apiClient from './apiClient';

const API_URL = '/api/v1/events';

export const createEvent = async (eventData) => {
    return await apiClient.post(`${API_URL}`, eventData);
};

const cache = new Map();

export const getEvents = async (params = {}) => {
    const queryStr = new URLSearchParams(params).toString();
    const cacheKey = `getEvents-${queryStr}`;
    
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }
    
    const res = await apiClient.get(`${API_URL}?${queryStr}`);
    cache.set(cacheKey, res);
    return res;
};

export const getMyEvents = async () => {
    return await apiClient.get(`${API_URL}/myevents`);
};

export const getEvent = async (id) => {
    return await apiClient.get(`${API_URL}/${id}`);
};

export const updateEvent = async (id, eventData) => {
    return await apiClient.put(`${API_URL}/${id}`, eventData);
};

export const deleteEvent = async (id) => {
    return await apiClient.delete(`${API_URL}/${id}`);
};
