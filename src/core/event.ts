import { ClientTelegram } from '../notification/client-telegram';
import { ConfigInterface } from '../types/config';
import { EventEmitter } from 'node:events';
import { MsgEventInterface } from '../types/app';
import { Tracer } from './tracer';

/**
 * This is used as a
 * global accessible object.
 */
export class Event {
    private _emitter: EventEmitter;
    public _tracer: Tracer;

    /**
     * Constructor.
     */
    public constructor(options: ConfigInterface['notifications'], tracer: Tracer) {
        this._emitter = new EventEmitter();
        this._tracer = tracer;

        if (options.channels.telegram.dev.reportTrace) {
            this._emitter.on('msg-telegram-success-extra', this.onMsgTelegramSuccess.bind(this));
        }

        if (options.channels.email.dev.reportTrace) {
            this._emitter.on('msg-email-success-extra', this.onMsgEmailSuccess.bind(this));
        }
    }

    /**
     * Emitter getter.
     */
    public get emitter(): EventEmitter {
        return this._emitter;
    }

    /**
     * Event handler.
     */
    public onMsgTelegramSuccess(mode: string, event: MsgEventInterface) {
        event.extra = event.extra.concat(this._tracer.trace[mode].map((item) => ClientTelegram.escapeMarkdownV2(item)));
    }

    /**
     * Event handler.
     */
    public onMsgEmailSuccess(mode: string, event: MsgEventInterface) {
        event.extra = event.extra.concat(this._tracer.trace[mode]);
    }
}
