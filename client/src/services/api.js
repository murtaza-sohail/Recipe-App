import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL
});

// Add token to requests
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 (Unauthorized) responses
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Clear auth data and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData)
};

export const recipeService = {
    getMerged: (params) => api.get('/recipes', { params }),
    getExternalCategories: () => api.get('/external/categories'),
    getExternalRecipe: (id) => api.get(`/external/recipe/${id}`),
    getLocalRecipe: (id) => api.get(`/recipes/${id}`),
    submitLocal: (recipeData) => api.post('/recipes', recipeData),
    deleteLocal: (id) => api.delete(`/recipes/${id}`)
};

export default api;
