import axios from 'axios';

const API_URL = '/api/v1/logistics';

// VENDORS
export const getVendors = async (eventId) => {
    return await axios.get(`${API_URL}/vendors/${eventId}`);
};

export const addVendor = async (eventId, vendorData) => {
    return await axios.post(`${API_URL}/vendors/${eventId}`, vendorData);
};

export const deleteVendor = async (id) => {
    return await axios.delete(`${API_URL}/vendors/delete/${id}`);
};

// EQUIPMENT
export const getEquipment = async (eventId) => {
    return await axios.get(`${API_URL}/equipment/${eventId}`);
};

export const addEquipment = async (eventId, equipmentData) => {
    return await axios.post(`${API_URL}/equipment/${eventId}`, equipmentData);
};

export const deleteEquipment = async (id) => {
    return await axios.delete(`${API_URL}/equipment/delete/${id}`);
};

// TASKS (KANBAN)
export const getTasks = async (eventId) => {
    return await axios.get(`${API_URL}/tasks/${eventId}`);
};

export const addTask = async (eventId, taskData) => {
    return await axios.post(`${API_URL}/tasks/${eventId}`, taskData);
};

export const updateTaskStatus = async (id, statusData) => {
    return await axios.put(`${API_URL}/tasks/update/${id}`, statusData);
};

export const deleteTask = async (id) => {
    return await axios.delete(`${API_URL}/tasks/delete/${id}`);
};
