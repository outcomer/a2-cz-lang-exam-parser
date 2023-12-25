import { MsgTelegramInterface } from '../types/app';

/**
 * Message container.
 */
export class MsgTelegram implements MsgTelegramInterface {
    private _chats: string[];
    private _body: string;

    /**
     * Constructor.
     */
    constructor(chats: string[], message: string) {
        this._chats = chats;
        this._body = message;
    }

    /**
     * Getter.
     */
    get chats() {
        return this._chats;
    }

    /**
     * Getter.
     */
    get body() {
        return this._body;
    }
}
