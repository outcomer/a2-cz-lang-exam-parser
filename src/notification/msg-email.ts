import { MsgEmailInterface } from '../types/app';

/**
 * Message container.
 */
export class MsgEmail implements MsgEmailInterface {
    private _to: string[];
    private _subject: string;
    private _body: string;

    /**
     * Constructor.
     */
    constructor(to: string[], subject: string, message: string) {
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
