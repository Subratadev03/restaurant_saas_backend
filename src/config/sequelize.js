import { Sequelize } from 'sequelize';

let sequelize = null;

export function getSequelize() {
  if (sequelize) return sequelize;

  const env = process.env.NODE_ENV || 'development';

  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: env === 'development' && process.env.LOG_LEVEL === 'debug' ? console.log : false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions:
      env === 'production'
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
  });

  return sequelize;
}
