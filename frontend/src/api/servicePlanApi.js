import axios from 'axios';

const API_URL = '/api/v1/plans';

export const getPlans = async () => {
    return await axios.get(API_URL);
};

export const selectPlan = async (planId) => {
    return await axios.put(`${API_URL}/select/${planId}`);
};
