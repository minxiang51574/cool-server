/*
 * @Author: Mx
 * @Date: 2022-02-22 14:57:08
 * @Description: 
 */
import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  config.orm = {
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: 'Mx515520',
    database: 'sys',
    // 自动建表 注意：线上部署的时候不要使用，有可能导致数据丢失
    synchronize: true,
    // 打印日志
    logging: false,
    // 字符集
    charset: 'utf8mb4',
    // 驱动
    driver: require('mysql2'),
  };

  config.logger = {
    coreLogger: {
      consoleLevel: 'INFO',
    },
  };

  config.cool = {
    socket: {
      cors: {
        // 这里可以写具体的地址如：http://127.0.0.1:8080
        origin: '*',
        methods: ['GET', 'POST'],
      },
    },
  };

  return config;
};
