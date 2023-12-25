"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const client_telegram_1 = require("../notification/client-telegram");
const node_events_1 = require("node:events");
/**
 * This is used as a
 * global accessible object.
 */
class Event {
    _emitter;
    _tracer;
    /**
     * Constructor.
     */
    constructor(options, tracer) {
        this._emitter = new node_events_1.EventEmitter();
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
    get emitter() {
        return this._emitter;
    }
    /**
     * Event handler.
     */
    onMsgTelegramSuccess(mode, event) {
        event.extra = event.extra.concat(this._tracer.trace[mode].map((item) => client_telegram_1.ClientTelegram.escapeMarkdownV2(item)));
    }
    /**
     * Event handler.
     */
    onMsgEmailSuccess(mode, event) {
        event.extra = event.extra.concat(this._tracer.trace[mode]);
    }
}
exports.Event = Event;
