import { ConfigInterface } from '../types/config';
import { ParserResultInterface } from '../types/app';
/**
 * Notifications dispatcher.
 */
export declare class Notificator {
    private _parserResult;
    private _notifyOptions;
    constructor(notifyOptions: ConfigInterface['notifications']);
    /**
     * Notificator handler.
     * Acts like a dispatcher, validates logic
     * and decide whether to send mesage and where to send it.
     */
    notify(parserResult: ParserResultInterface): Promise<void>;
    /**
     * Notificate via Telegram.
     * Deal with a type of message, prepare content
     * and pass it to client.
     */
    private notifyTelegram;
    /**
     * Notificate via Email.
     * Deal with a type of message, prepare content
     * and pass it to client.
     */
    private notifyEmail;
    /**
     * Reads config for repeatition params.
     */
    private isMessageRepeatable;
    /**
     * Simple timer.
     */
    private delay;
}
