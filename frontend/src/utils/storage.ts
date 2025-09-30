import type { AuthResponse } from '../types/auth';

const AUTH_STORAGE_KEY = 'covid_slayer_auth';

export type PersistedAuthState = {
  token: string;
  user: AuthResponse['user'];
}

export const persistAuthState = (state: PersistedAuthState): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
};

export const loadAuthState = (): PersistedAuthState | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PersistedAuthState;
  } catch (error) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const clearAuthState = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};
