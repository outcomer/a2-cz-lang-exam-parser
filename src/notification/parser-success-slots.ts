import { ConfigInterface } from '../types/config';
import { Event } from '../core/event';
import { MsgEmail } from './msg-email';
import { MsgEmailInterface } from '../types/app';
import { MsgTelegram } from './msg-telegram';
import { MsgTelegramInterface } from '../types/app';
import { ParserResultInterface } from '../types/app';
import { Slot } from '../core/slot';
import { Tracer } from '../core/tracer';
import * as fs from 'node:fs';
import handlebars = require('handlebars');
import path = require('path');

/**
 * Succesfull parser's results storage and message formatter.
 */
export class ParserSuccessSlots implements ParserResultInterface {
    private _event: Event;
    private _notifyOptions: ConfigInterface['notifications'];
    private _slotsOptions: ConfigInterface['slotPage'];
    private _slots: Slot[];

    /**
     * Constructor.
     */
    constructor(
        notifyOptions: ConfigInterface['notifications'],
        slotsOptions: ConfigInterface['slotPage'],
        tracer: Tracer
    ) {
        this._notifyOptions = notifyOptions;
        this._slotsOptions = slotsOptions;
        this._event = new Event(notifyOptions, tracer);

        handlebars.registerPartial(
            'report-email',
            fs.readFileSync(path.resolve(__dirname, '../views/email/parts/report-success.html'), 'utf-8')
        );
    }

    /**
     * Setter.
     */
    public set slots(slots: Slot[]) {
        this._slots = slots;
    }

    /**
     * Getter.
     */
    public get slots(): Slot[] {
        return this._slots;
    }

    /**
     * Ready to send message getter.
     */
    public getMessagesTelegram(remind: boolean = false): MsgTelegramInterface[] {
        const messages = [];
        const { telegram } = this._notifyOptions.channels;

        if (false === telegram.active) {
            return messages;
        }

        const dev = (): void => {
            if (0 === this.slots.length && false === telegram.dev.reportAttempt) {
                return;
            }

            const event = {
                extra: [],
            };
            this._event.emitter.emit('msg-telegram-success-extra', 'dev', event);

            const templateSource = fs.readFileSync(
                path.resolve(__dirname, '../views/telegram/parser-msg-success.md'),
                'utf-8'
            );
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

            messages.push(new MsgTelegram(chats, message));
        };

        const live = (): void => {
            if (0 === this.slots.length) {
                return;
            }

            const event = {
                extra: [],
            };
            this._event.emitter.emit('msg-telegram-success-extra', 'live', event);

            const templateSource = fs.readFileSync(
                path.resolve(__dirname, '../views/telegram/parser-msg-success.md'),
                'utf-8'
            );
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

            messages.push(new MsgTelegram(chats, message));
        };

        dev();
        live();

        return messages;
    }

    /**
     * Ready to send message getter.
     */
    public getMessagesEmail(remind: boolean = false): MsgEmailInterface[] {
        const messages = [];
        const { email } = this._notifyOptions.channels;

        if (false === email.active) {
            return messages;
        }

        const dev = (): void => {
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
            const subject =
                this.slots.length > 0
                    ? `${remindText} ${this._notifyOptions.channels.email.dev.subjectSuccess}`
                    : `${remindText} ${this._notifyOptions.channels.email.dev.subjectEmpty}`;
            const message = template(context, {
                allowedProtoMethods: {
                    toEmailHtmlString: true,
                },
            });

            messages.push(new MsgEmail(to, subject, message));
        };

        const live = (): void => {
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

            messages.push(new MsgEmail(to, subject, message));
        };

        dev();
        live();

        return messages;
    }
}
