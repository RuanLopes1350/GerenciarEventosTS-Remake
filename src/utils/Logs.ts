import { createLogger, format, transports } from 'winston';
import * as fs from 'fs';

const logPath = './logs/';
if(!fs.existsSync(logPath)){
    fs.mkdirSync(logPath);
}

export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toLocaleUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new transports.File({filename: `${logPath}/system.log`})
    ]
});