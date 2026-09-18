import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  ADMIN_SEED_EMAIL: z.string().email().default('admin@jodo.dev'),
  ADMIN_SEED_PASSWORD: z.string().default('Admin@123456'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  OPENAI_API_KEY_1: z.string().optional(),
  OPENAI_API_KEY_2: z.string().optional(),
  OPENAI_API_KEY_3: z.string().optional(),
  OPENAI_API_KEY_4: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
});

// Load dotenv in dev mode
if (process.env.NODE_ENV !== 'production') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dotenv = require('dotenv');
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });
    if (!process.env.MONGODB_URI) {
      dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
    }
    if (!process.env.MONGODB_URI) {
      dotenv.config({ path: path.resolve(process.cwd(), '.env') });
    }
  } catch {
    // dotenv optional
  }
}

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
