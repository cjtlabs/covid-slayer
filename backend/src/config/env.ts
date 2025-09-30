import dotenv from 'dotenv';

dotenv.config();

type EnvConfig = {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  FRONTEND_URL: string;
}

const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
};

export const config: EnvConfig = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVar('PORT', '5000'), 10),
  MONGODB_URI: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/covid-slayer'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
  FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:3000')
};

export const validateConfig = (): void => {
  const requiredVars = ['JWT_SECRET'];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Environment variable ${varName} is required`);
    }
  }

  if (isNaN(config.PORT) || config.PORT < 1 || config.PORT > 65535) {
    throw new Error('PORT must be a valid port number between 1 and 65535');
  }
};
