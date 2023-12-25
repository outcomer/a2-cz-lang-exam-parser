import { Notificator } from '../notification/notificator';
import { ParserError } from '../notification/parser-error';
/**
 * One globaluniform handler for errors.
 */
export declare class ErrorHandler {
    private _logger;
    private _notificator;
    private _parserError;
    /**
     * Constructor.
     */
    constructor(notificator: Notificator, parserError: ParserError);
    /**
     * Send error message.
     */
    handle(error: Error): Promise<void>;
}
