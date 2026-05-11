import apiClient from './apiClient';

const API_URL = '/api/v1/plans';

export const getPlans = async () => {
    return await apiClient.get(API_URL);
};

export const selectPlan = async (planId) => {
    return await apiClient.put(`${API_URL}/select/${planId}`);
};
