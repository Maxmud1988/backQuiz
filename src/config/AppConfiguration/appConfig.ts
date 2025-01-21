export default () => ({
  port: parseInt(process.env.APP_PORT, 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
  },

  jwt: {
    accest_secret: process.env.JWT_ACCESS_SECRET || 'asdkjsdgf',
    refresh_secret: process.env.JWT_REFRESH_SECRET || 'adfgewrqgeth',
    expiresIn: process.env.EXPIRE_JWT || '2h',
  },

  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10) || 465,
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM,
  },

  appUrl: process.env.APP_URL || 'http://localhost:3000',
  appUrlFront: process.env.APP_URL_FRONT || 'http://localhost:5173',

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CLIENT_CALLBACK_URL,
  },

  frontendUrl: process.env.APP_URL_FRONT,
});
