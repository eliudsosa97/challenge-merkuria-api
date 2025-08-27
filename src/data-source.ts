// src/data-source.ts
import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

const getDataSourceOptions = (): DataSourceOptions => {
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    return {
      type: 'postgres',
      url: dbUrl,
      synchronize: false,
      logging: false,
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/database/migrations/*.js'],
      ssl: {
        rejectUnauthorized: false,
      },
    };
  } else {
    return {
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      synchronize: false,
      logging: true,
      entities: ['src/**/*.entity.ts'],
      migrations: ['src/database/migrations/*.ts'],
    };
  }
};

const dataSourceOptions = getDataSourceOptions();
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
