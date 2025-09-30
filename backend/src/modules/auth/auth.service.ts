import { TUser, User } from '../../models/user.model';
import { AuthResponse, SignUpData } from './auth.types';
import { generateToken } from './auth.helpers';

export async function signupService(userData: SignUpData): Promise<AuthResponse> {
  const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const user = new User({
    fullname: userData.fullname,
    email: userData.email.toLowerCase(),
    password: userData.password,
    avatar: userData.avatar
  });

  await user.save();

  const token = generateToken(user.id);

  return {
    token,
    user: user.toJSON()
  };
}

export async function loginService(email: string, password: string): Promise<AuthResponse> {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user.id);

  return {
    token,
    user: user.toJSON()
  };
}

export async function getUserByIdService(userId: string): Promise<TUser | null> {
  return User.findById(userId).select('-password');
}