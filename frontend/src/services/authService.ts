import type {
  AuthResponse,
  LoginPayload,
  SignupPayload,
  UserProfile,
} from '../types/auth.ts';
import { apiClient } from './httpClient.ts';

export const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<{ success: boolean; token: string; user: UserProfile }>('/auth/signup', payload);
  return { token: data.token, user: data.user };
};

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<{ success: boolean; token: string; user: UserProfile }>('/auth/login', payload);
  return { token: data.token, user: data.user };
};

export const fetchProfile = async (): Promise<UserProfile> => {
  const { data } = await apiClient.get<{ success: boolean; user: UserProfile }>('/auth/profile');
  return data.user;
};