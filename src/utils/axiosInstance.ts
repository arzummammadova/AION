// src/utils/axiosInstance.ts

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Bu, httpOnly cookie-lərin avtomatik göndərilməsini təmin edir
});

// Request Interceptor-u dəyişdiririk: Artıq localStorage-dan token oxumağa ehtiyac yoxdur.
// Çünki token httpOnly cookie-dədir və brauzer onu avtomatik göndərəcək.
axiosInstance.interceptors.request.use(
    (config) => {
        // Tokeni localStorage-dan oxuyan hissəni SİL!
        // const token = localStorage.getItem('token'); 
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;