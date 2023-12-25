"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const winston = require("winston");
/**
 * One globaluniform handler for errors.
 */
class ErrorHandler {
    _logger;
    _notificator;
    _parserError;
    /**
     * Constructor.
     */
    constructor(notificator, parserError) {
        this._parserError = parserError;
        this._notificator = notificator;
        this._logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.printf(({ stack, timestamp }) => {
                return `${timestamp} ${stack}`;
            })),
            transports: [
                new winston.transports.File({
                    filename: './a2-error-parser.log',
                    level: 'error',
                    maxsize: 5120000,
                    maxFiles: 20,
                }),
            ],
        });
    }
    /**
     * Send error message.
     */
    async handle(error) {
        this._parserError.error = error;
        this._logger.error(error);
        await this._notificator.notify(this._parserError);
    }
}
exports.ErrorHandler = ErrorHandler;
