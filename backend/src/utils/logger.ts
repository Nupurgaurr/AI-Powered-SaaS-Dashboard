import winston from 'winston';

const { combine, timestamp, errors, printf, colorize, json } = winston.format;

const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true })
  ),
  transports: [
    process.env.NODE_ENV === 'production'
      ? new winston.transports.Console({ format: json() })
      : new winston.transports.Console({ format: combine(colorize(), devFormat) }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: json(),
    }),
  ],
});
