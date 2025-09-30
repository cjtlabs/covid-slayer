import jwt from 'jsonwebtoken';
import { StringValue } from 'ms';

export function generateToken(userId: string): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  const secret = process.env.JWT_SECRET;
  const expiresIn: StringValue | number =
  (process.env.JWT_EXPIRES_IN as StringValue | undefined) ?? "7d";
  return jwt.sign(
    { userId },
    secret,
    { expiresIn }
  );
}
