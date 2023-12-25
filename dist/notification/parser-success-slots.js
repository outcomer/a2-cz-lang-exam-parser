"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserSuccessSlots = void 0;
const event_1 = require("../core/event");
const msg_email_1 = require("./msg-email");
const msg_telegram_1 = require("./msg-telegram");
const fs = require("node:fs");
const handlebars = require("handlebars");
const path = require("path");
/**
 * Succesfull parser's results storage and message formatter.
 */
class ParserSuccessSlots {
    _event;
    _notifyOptions;
    _slotsOptions;
    _slots;
    /**
     * Constructor.
     */
    constructor(notifyOptions, slotsOptions, tracer) {
        this._notifyOptions = notifyOptions;
        this._slotsOptions = slotsOptions;
        this._event = new event_1.Event(notifyOptions, tracer);
        handlebars.registerPartial('report-email', fs.readFileSync(path.resolve(__dirname, '../views/email/parts/report-success.html'), 'utf-8'));
    }
    /**
     * Setter.
     */
    set slots(slots) {
        this._slots = slots;
    }
    /**
     * Getter.
     */
    get slots() {
        return this._slots;
    }
    /**
     * Ready to send message getter.
     */
    getMessagesTelegram(remind = false) {
        const messages = [];
        const { telegram } = this._notifyOptions.channels;
        if (false === telegram.active) {
            return messages;
        }
        const dev = () => {
            if (0 === this.slots.length && false === telegram.dev.reportAttempt) {
                return;
            }
            const event = {
                extra: [],
            };
            this._event.emitter.emit('msg-telegram-success-extra', 'dev', event);
            const templateSource = fs.readFileSync(path.resolve(__dirname, '../views/telegram/parser-msg-success.md'), 'utf-8');
            const template = handlebars.compile(templateSource);
            const context = {
                remind: remind,
                url: this._slotsOptions.url,
                slots: this._slots,
                extra: event.extra,
            };
            const chats = this._notifyOptions.channels.telegram.dev.chats;
            const message = template(context, {
                allowedProtoMethods: {
                    toTelegramMarkdownString: true,
                },
            });
            messages.push(new msg_telegram_1.MsgTelegram(chats, message));
        };
        const live = () => {
            if (0 === this.slots.length) {
                return;
            }
            const event = {
                extra: [],
            };
            this._event.emitter.emit('msg-telegram-success-extra', 'live', event);
            const templateSource = fs.readFileSync(path.resolve(__dirname, '../views/telegram/parser-msg-success.md'), 'utf-8');
            const template = handlebars.compile(templateSource);
            const context = {
                remind: remind,
                url: this._slotsOptions.url,
                slots: this._slots,
                extra: event.extra,
            };
            const chats = this._notifyOptions.channels.telegram.live.chats;
            const message = template(context, {
                allowedProtoMethods: {
                    toTelegramMarkdownString: true,
                },
            });
            messages.push(new msg_telegram_1.MsgTelegram(chats, message));
        };
        dev();
        live();
        return messages;
    }
    /**
     * Ready to send message getter.
     */
    getMessagesEmail(remind = false) {
        const messages = [];
        const { email } = this._notifyOptions.channels;
        if (false === email.active) {
            return messages;
        }
        const dev = () => {
            if (0 === this.slots.length && false === email.dev.reportAttempt) {
                return;
            }
            const event = {
                extra: [],
            };
            this._event.emitter.emit('msg-email-success-extra', 'dev', event);
            const templateSource = fs.readFileSync(path.resolve(__dirname, '../views/email/parser-msg.html'), 'utf-8');
            const template = handlebars.compile(templateSource);
            const context = {
                remind: remind,
                url: this._slotsOptions.url,
                slots: this._slots,
                extra: event.extra,
            };
            const remindText = remind ? '!!!Reminder.' : '';
            const to = this._notifyOptions.channels.email.dev.sendTo;
            const subject = this.slots.length > 0
                ? `${remindText} ${this._notifyOptions.channels.email.dev.subjectSuccess}`
                : `${remindText} ${this._notifyOptions.channels.email.dev.subjectEmpty}`;
            const message = template(context, {
                allowedProtoMethods: {
                    toEmailHtmlString: true,
                },
            });
            messages.push(new msg_email_1.MsgEmail(to, subject, message));
        };
        const live = () => {
            if (0 === this.slots.length) {
                return;
            }
            const event = {
                extra: [],
            };
            this._event.emitter.emit('msg-email-success-extra', 'live', event);
            const templateSource = fs.readFileSync(path.resolve(__dirname, '../views/email/parser-msg.html'), 'utf-8');
            const template = handlebars.compile(templateSource);
            const context = {
                remind: remind,
                url: this._slotsOptions.url,
                slots: this._slots,
                extra: event.extra,
            };
            const remindText = remind ? '!!!Reminder.' : '';
            const to = this._notifyOptions.channels.email.live.sendTo;
            const subject = `${remindText} ${this._notifyOptions.channels.email.live.subjectSuccess}`;
            const message = template(context, {
                allowedProtoMethods: {
                    toEmailHtmlString: true,
                },
            });
            messages.push(new msg_email_1.MsgEmail(to, subject, message));
        };
        dev();
        live();
        return messages;
    }
}
exports.ParserSuccessSlots = ParserSuccessSlots;
