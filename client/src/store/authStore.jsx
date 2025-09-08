import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

/**
 * This function runs once when the module is first imported.
 * It syncs the Axios header with the token from localStorage on app load,
 * ensuring the user stays logged in across page refreshes.
 */
const initializeAxiosHeader = () => {
  try {
    const storage = JSON.parse(localStorage.getItem('auth-storage'));
    if (storage?.state?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${storage.state.token}`;
    }
  } catch (e) {
    console.error("Error initializing auth state from localStorage", e);
  }
};

initializeAxiosHeader();

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,

      /**
       * Login Action: Saves token/user to state and sets the default Axios header.
       */
      login: (authData) => {
        const { token, user } = authData;
        // Set the default auth header for all subsequent API requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ token, user });
      },

      /**
       * Logout Action: Clears state and removes the default Axios header.
       */
      logout: () => {
        // Remove the auth header from the api instance
        delete api.defaults.headers.common['Authorization'];
        // Reset the state to null
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-storage', // The key to use in localStorage
      getStorage: () => localStorage, // Specify localStorage for persistence
    }
  )
);

export default useAuthStore;
