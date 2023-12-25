import { MsgTelegramInterface } from '../types/app';
/**
 * Message container.
 */
export declare class MsgTelegram implements MsgTelegramInterface {
    private _chats;
    private _body;
    /**
     * Constructor.
     */
    constructor(chats: string[], message: string);
    /**
     * Getter.
     */
    get chats(): string[];
    /**
     * Getter.
     */
    get body(): string;
}
