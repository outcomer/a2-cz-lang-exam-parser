import { ConfigInterface } from '../types/config';
import { ExceptionBalanceCritical } from '../exception/error-balance-critical';
import { MsgEmail } from './msg-email';
import { MsgEmailInterface } from '../types/app';
import { MsgTelegram } from './msg-telegram';
import { MsgTelegramInterface } from '../types/app';
import { ParserResultInterface } from '../types/app';
import * as fs from 'node:fs';
import handlebars = require('handlebars');
import path = require('path');

/**
 * Runtime errors parser's results storage and message formatter.
 */
export class ParserError implements ParserResultInterface {
    private _options: ConfigInterface['notifications'];
    private _error: Error;

    /**
     * Constructor.
     */
    constructor(options: ConfigInterface['notifications']) {
        this._options = options;

        handlebars.registerPartial(
            'report-email',
            fs.readFileSync(path.resolve(__dirname, '../views/email/parts/report-error.html'), 'utf-8')
        );
    }

    /**
     * Setter.
     */
    public set error(error: Error) {
        this._error = error;
    }

    /**
     * Ready to send message getter.
     */
    public getMessagesTelegram(): MsgTelegramInterface[] {
        const messages = [];
        const { telegram } = this._options.channels;

        if (false === telegram.active) {
            return messages;
        }

        const dev = (): void => {
            if (false === telegram.dev.reportErrors) {
                return;
            }

            const templateSource = fs.readFileSync(
                path.resolve(__dirname, '../views/telegram/parser-msg-error.md'),
                'utf-8'
            );
            const template = handlebars.compile(templateSource);
            const context = {
                message: this._error.toString().replace(/:(\s)/, ':\n').replaceAll('\\', '\\\\'),
            };

            const chats = this._options.channels.telegram.dev.chats;
            const message = template(context);

            messages.push(new MsgTelegram(chats, message));
        };

        const live = (): void => {
            const templateSource = fs.readFileSync(
                path.resolve(__dirname, '../views/telegram/parser-msg-error.md'),
                'utf-8'
            );
            const template = handlebars.compile(templateSource);
            const context = {
                message: this._error.toString().replace(/:(\s)/, ':\n').replaceAll('\\', '\\\\'),
            };

            const chats = this._options.channels.telegram.live.chats;
            const message = template(context);

            messages.push(new MsgTelegram(chats, message));
        };

        dev();

        if (this._error instanceof ExceptionBalanceCritical) {
            live();
        }

        return messages;
    }

    /**
     * Ready to send message getter.
     */
    public getMessagesEmail(): MsgEmailInterface[] {
        const messages = [];
        const { email } = this._options.channels;

        if (false === email.active) {
            return messages;
        }

        const dev = (): void => {
            if (false === email.dev.reportErrors) {
                return;
            }

            const templateSource = fs.readFileSync(path.resolve(__dirname, '../views/email/parser-msg.html'), 'utf-8');
            const template = handlebars.compile(templateSource);
            const context = {
                message: this._error.toString(),
            };

            const to = this._options.channels.email.dev.sendTo;
            const subject = this._options.channels.email.dev.subjectError;
            const message = template(context);

            messages.push(new MsgEmail(to, subject, message));
        };

        const live = (): void => {
            const templateSource = fs.readFileSync(path.resolve(__dirname, '../views/email/parser-msg.html'), 'utf-8');
            const template = handlebars.compile(templateSource);
            const context = {
                message: this._error.toString(),
            };

            const to = this._options.channels.email.live.sendTo;
            const subject = this._options.channels.email.live.subjectError;
            const message = template(context);

            messages.push(new MsgEmail(to, subject, message));
        };

        dev();

        if (this._error instanceof ExceptionBalanceCritical) {
            live();
        }

        return messages;
    }
}
