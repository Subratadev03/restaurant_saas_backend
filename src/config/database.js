/**
 * Sequelize-CLI database configuration.
 * Used only by the CLI tool (migrations, seeds).
 * Runtime uses src/config/sequelize.js directly.
 *
 * No dotenv dependency — pass DATABASE_URL as an env var or
 * the CLI will use the username/password/database fields below.
 */
const url = process.env.DATABASE_URL;

const fromUrl = url
  ? { url, dialect: 'postgres' }
  : {
      username: process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '12345',
      database: process.env.DB_NAME     || 'restaurant_saas',
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432', 10),
      dialect:  'postgres',
    };

const base = {
  ...fromUrl,
  logging: false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
};

module.exports = {
  development: { ...base, logging: process.env.LOG_LEVEL === 'debug' ? console.log : false },
  test:        { ...base },
  production:  { ...base, dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } },
};
