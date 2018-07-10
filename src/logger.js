import appRoot from 'app-root-path';
import {createLogger, transports, format} from 'winston';
const { combine, timestamp, simple, printf } = format;

const options = {
    file: {
        level: 'info',
        filename: `${appRoot}/logs/app.log`,
        handleExceptions: true,
        json: false,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};


const MESSAGE = Symbol.for('message');

const formatter = (logEntry) => {
    logEntry[MESSAGE] = new Date().toISOString() + ' ' + logEntry.message;
    return logEntry;
};

const logger = createLogger({
    format: format(formatter)(),
    transports: [
        new transports.File(options.file),
        new transports.Console(options.console)
    ],
});

export default logger;