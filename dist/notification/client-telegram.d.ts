import { MsgTelegramInterface } from '../types/app';
/**
 * Specific messanger client for Telegram.
 */
export declare class ClientTelegram {
    private _logger;
    static markdownSpcecialChars: string[];
    private _token;
    private _msgMaxLenght;
    /**
     * Constructor.
     */
    constructor(token: string);
    /**
     * Escapes restricted symbols in telegramm message.
     */
    static escapeMarkdownV2(text: string): string;
    /**
     * Messages dispatcher.
     */
    send(message: MsgTelegramInterface): Promise<void>;
    /**
     * Single message dispatcher.
     */
    private sendMessage;
}
