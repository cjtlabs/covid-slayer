import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const rawAuth = window.localStorage.getItem('covid_slayer_auth');
      if (rawAuth) {
        try {
          const parsed = JSON.parse(rawAuth) as { token?: string };
          if (parsed.token) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${parsed.token}`;
          }
        } catch (error) {
          window.localStorage.removeItem('covid_slayer_auth');
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === 'ERR_NETWORK') {
      return Promise.reject(new Error('Unable to connect to the server. Please check your internet connection.'));
    }

    if (error.response) {
      const { status, data }: any = error.response;
      
      if (status === 401) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('covid_slayer_auth');
        }
        if (data.error === "Invalid credentials") {
          return Promise.reject(new Error('Invalid credentials. Please try again.'));
        }
        return Promise.reject(new Error('Your session has expired. Please log in again.'));
      }

      if (status === 403) {
        return Promise.reject(new Error('You do not have permission to perform this action.'));
      }

      if (status === 404) {
        return Promise.reject(new Error('The requested resource was not found.'));
      }

      if (status === 400 && data?.error === 'User already exists') {
        return Promise.reject(new Error('User already exists.'));
      }

      const message = typeof data === 'object' && data !== null && 'message' in data
        ? (data as { message: string }).message
        : 'An error occurred while processing your request.';
      
      return Promise.reject(new Error(message));
    }

    return Promise.reject(error);
  }
);
