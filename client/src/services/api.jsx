import axios from 'axios';

// Define the base URL for your backend API
// Your server.js file listens on process.env.PORT || 5000.
const API_URL = 'http://localhost:5000';

/**
 * Create a global Axios instance.
 * All components and services will import this instance instead of using axios directly.
 * This allows us to centrally manage the Base URL and Authorization headers.
 *
 * Your Zustand auth store (authStore.js) will directly modify the
 * default headers of THIS instance upon login/logout.
 */
const api = axios.create({
  baseURL: API_URL,
});

export default api;