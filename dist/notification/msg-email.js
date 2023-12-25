"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsgEmail = void 0;
/**
 * Message container.
 */
class MsgEmail {
    _to;
    _subject;
    _body;
    /**
     * Constructor.
     */
    constructor(to, subject, message) {
        this._to = to;
        this._subject = subject;
        this._body = message;
    }
    /**
     * Getter.
     */
    get to() {
        return this._to;
    }
    /**
     * Getter.
     */
    get subject() {
        return this._subject;
    }
    /**
     * Getter.
     */
    get body() {
        return this._body;
    }
}
exports.MsgEmail = MsgEmail;
