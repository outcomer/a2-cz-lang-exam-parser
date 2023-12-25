import { MsgEmailInterface } from '../types/app';
/**
 * Message container.
 */
export declare class MsgEmail implements MsgEmailInterface {
    private _to;
    private _subject;
    private _body;
    /**
     * Constructor.
     */
    constructor(to: string[], subject: string, message: string);
    /**
     * Getter.
     */
    get to(): string[];
    /**
     * Getter.
     */
    get subject(): string;
    /**
     * Getter.
     */
    get body(): string;
}
