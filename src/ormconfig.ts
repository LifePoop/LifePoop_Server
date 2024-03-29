import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

dotenv.config();

export const mySqlOptions: MysqlConnectionOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/../libs/entity/**/*.entity{.ts,.js}'],
  timezone: '+09:00',
  synchronize: true,
  migrationsRun: true,
  logging: process.env.NODE_ENV === 'development',
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  charset: 'utf8mb4',
  namingStrategy: new SnakeNamingStrategy(),
};
