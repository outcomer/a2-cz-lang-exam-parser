import { ConfigInterface } from '../types/config';
import { MsgEmailInterface } from '../types/app';
import { MsgTelegramInterface } from '../types/app';
import { ParserResultInterface } from '../types/app';
/**
 * Runtime errors parser's results storage and message formatter.
 */
export declare class ParserError implements ParserResultInterface {
    private _options;
    private _error;
    /**
     * Constructor.
     */
    constructor(options: ConfigInterface['notifications']);
    /**
     * Setter.
     */
    set error(error: Error);
    /**
     * Ready to send message getter.
     */
    getMessagesTelegram(): MsgTelegramInterface[];
    /**
     * Ready to send message getter.
     */
    getMessagesEmail(): MsgEmailInterface[];
}
