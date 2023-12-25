import { Notificator } from '../notification/notificator';
import { ParserError } from '../notification/parser-error';
import * as winston from 'winston';

/**
 * One globaluniform handler for errors.
 */
export class ErrorHandler {
    private _logger: winston.Logger;
    private _notificator: Notificator;
    private _parserError: ParserError;

    /**
     * Constructor.
     */
    constructor(notificator: Notificator, parserError: ParserError) {
        this._parserError = parserError;
        this._notificator = notificator;

        this._logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.printf(({ stack, timestamp }) => {
                    return `${timestamp} ${stack}`;
                })
            ),
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
    public async handle(error: Error): Promise<void> {
        this._parserError.error = error;
        this._logger.error(error);
        await this._notificator.notify(this._parserError);
    }
}
