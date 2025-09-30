export type UserProfile = {
  id: string;
  fullname: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AuthTokens = {
  token: string;
}

export type AuthResponse = {
  user: UserProfile;
  token: string;
}

export type LoginPayload = {
  email: string;
  password: string;
}

export type SignupPayload = {
  fullname: string;
  email: string;
  password: string;
  avatar?: string;
}
