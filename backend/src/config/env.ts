function getEnvVar(name: string, required: boolean = true, defaultValue?: string): string {
  const value = process.env[name] || defaultValue;
  if (required && !value) {
    throw new Error(`❌ Missing required environment variable: ${name}`);
  }
  return value || '';
}

export const env = {
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', false, '7d'),
  PORT: parseInt(getEnvVar('PORT', false, '5000'), 10),
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', false, 'http://localhost:3000'),
  CLOUDINARY_CLOUD_NAME: getEnvVar('CLOUDINARY_CLOUD_NAME', false),
  CLOUDINARY_API_KEY: getEnvVar('CLOUDINARY_API_KEY', false),
  CLOUDINARY_API_SECRET: getEnvVar('CLOUDINARY_API_SECRET', false),
  NODE_ENV: getEnvVar('NODE_ENV', false, 'development'),
} as const;
