/// <reference types="node" />
import { ConfigInterface } from '../types/config';
import { EventEmitter } from 'node:events';
import { MsgEventInterface } from '../types/app';
import { Tracer } from './tracer';
/**
 * This is used as a
 * global accessible object.
 */
export declare class Event {
    private _emitter;
    _tracer: Tracer;
    /**
     * Constructor.
     */
    constructor(options: ConfigInterface['notifications'], tracer: Tracer);
    /**
     * Emitter getter.
     */
    get emitter(): EventEmitter;
    /**
     * Event handler.
     */
    onMsgTelegramSuccess(mode: string, event: MsgEventInterface): void;
    /**
     * Event handler.
     */
    onMsgEmailSuccess(mode: string, event: MsgEventInterface): void;
}
