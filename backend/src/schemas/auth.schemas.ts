import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    fullname: z
      .string()
      .trim()
      .min(2, 'Fullname must be at least 2 characters')
      .max(100, 'Fullname must not exceed 100 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Fullname can only contain letters and spaces'),
    
    email: z
      .email('Please provide a valid email address')
      .toLowerCase(),
    
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    
    avatar: z
      .url('Avatar must be a valid URL')
      .optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .email('Please provide a valid email address')
      .toLowerCase(),
    
    password: z
      .string()
      .min(1, 'Password is required')
  })
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
