import winston from "winston";

const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        success: 3,
        verbose: 4,
        debug: 5
    },
    colors: {
        fatal: "inverse red",
        error: "red",
        warn: "yellow",
        info: "blue",
        success: "green",
        verbose: "cyan",
        debug: "magenta"
    }
};

winston.addColors(customLevels.colors);

export const winstonConfig: winston.LoggerOptions = {
    level: "debug",
    format: winston.format.simple(),
    levels: customLevels.levels,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format((info) => {
                    info.level = info.level.toUpperCase();
                    return info;
                })(),
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.colorize({ all: true }),
                winston.format.printf(
                    (info) =>
                        `[${info.timestamp}] [${info.level}]: ${info.message}`
                )
            ),
            handleExceptions: true
        })
    ]
};
