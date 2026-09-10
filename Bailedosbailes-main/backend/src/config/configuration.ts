export interface AppConfig {
  port: number;
  nodeEnv: string;
  frontendUrl: string;
  databaseUrl: string;
  admin: {
    user: string;
    key: string;
  };
  mp: {
    accessToken: string;
    publicKey: string;
    webhookSecret: string;
    webhookUrl?: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  email: {
    resendApiKey?: string;
    fromEmail: string;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || '',
  admin: {
    user: process.env.ADMIN_USER || '',
    key: process.env.ADMIN_KEY || '',
  },
  mp: {
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST_ACCESS_TOKEN_PLACEHOLDER',
    publicKey: process.env.MP_PUBLIC_KEY || 'TEST_PUBLIC_KEY_PLACEHOLDER',
    webhookSecret: process.env.MP_WEBHOOK_SECRET || 'TEST_WEBHOOK_SECRET_PLACEHOLDER',
    webhookUrl: process.env.MP_BACKEND_WEBHOOK_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.EMAIL_FROM || 'Hotel Cortez <ingressos@hotelcortez.com>',
  },
});
