import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const getLatestRates = async (from = 'USD', to = '') => {
    const response = await api.get('/latest', { params: { from, to } });
    return response.data;
};

export const convertCurrency = async (amount, from, to) => {
    const response = await api.get('/convert', { params: { amount, from, to } });
    return response.data;
};

export const getHistory = async (from, to, days = 30) => {
    const response = await api.get('/history', { params: { from, to, days } });
    return response.data;
};

export default api;
