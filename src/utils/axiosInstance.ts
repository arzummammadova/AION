// src/utils/axiosInstance.ts

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'; // Default URL əlavə edin

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Cookies/credential göndərmək üçün
});

// Request Interceptor əlavə edirik
axiosInstance.interceptors.request.use(
    (config) => {
        // LocalStorage-dan tokeni alırıq (token-i necə saxladığınıza bağlıdır)
        const token = localStorage.getItem('token'); // Və ya 'userToken', 'jwt' və s.

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;