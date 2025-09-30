import { Request } from 'express';
import { TUser } from "../../models/user.model";

export type SignUpData = {
  fullname: string;
  email: string;
  password: string;
  avatar?: string;
}

export type AuthResponse = {
  token: string;
  user: Partial<TUser>;
}

export type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
  };
}