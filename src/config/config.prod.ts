import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  config.orm = {
    type: 'mysql',
    host: '',
    port: '',
    username: '',
    password: '',
    database: '',
    // 自动建表 注意：线上部署的时候不要使用，有可能导致数据丢失
    synchronize: false,
    // 打印日志
    logging: false,
    // 字符集
    charset: 'utf8mb4',
    // 驱动
    driver: require('mysql2'),
  };

  config.logger = {
    coreLogger: {
      consoleLevel: 'ERROR',
    },
  };

  // cool配置
  config.cool = {
    // 是否初始化模块数据库
    initDB: false,
  };

  return config;
};
