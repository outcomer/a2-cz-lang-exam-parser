"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsgTelegram = void 0;
/**
 * Message container.
 */
class MsgTelegram {
    _chats;
    _body;
    /**
     * Constructor.
     */
    constructor(chats, message) {
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
exports.MsgTelegram = MsgTelegram;
