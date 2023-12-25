"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserError = void 0;
const error_balance_critical_1 = require("../exception/error-balance-critical");
const msg_email_1 = require("./msg-email");
const msg_telegram_1 = require("./msg-telegram");
const fs = require("node:fs");
const handlebars = require("handlebars");
const path = require("path");
/**
 * Runtime errors parser's results storage and message formatter.
 */
class ParserError {
    _options;
    _error;
    /**
     * Constructor.
     */
    constructor(options) {
        this._options = options;
        handlebars.registerPartial('report-email', fs.readFileSync(path.resolve(__dirname, '../views/email/parts/report-error.html'), 'utf-8'));
    }
    /**
     * Setter.
     */
    set error(error) {
        this._error = error;
    }
    /**
     * Ready to send message getter.
     */
    getMessagesTelegram() {
        const messages = [];
        const { telegram } = this._options.channels;
        if (false === telegram.active) {
            return messages;
        }
        const dev = () => {
            if (false === telegram.dev.reportErrors) {
                return;
            }
            const templateSource = fs.readFileSync(path.resolve(__dirname, '../views/telegram/parser-msg-error.md'), 'utf-8');
            const template = handlebars.compile(templateSource);
            const context = {
                message: this._error.toString().replace(/:(\s)/, ':\n').replaceAll('\\', '\\\\'),
            };
            const chats = this._options.channels.telegram.dev.chats;
            const message = template(context);
            messages.push(new msg_telegram_1.MsgTelegram(chats, message));
        };
        const live = () => {
            const templateSource = fs.readFileSync(path.resolve(__dirname, '../views/telegram/parser-msg-error.md'), 'utf-8');
            const template = handlebars.compile(templateSource);
            const context = {
                message: this._error.toString().replace(/:(\s)/, ':\n').replaceAll('\\', '\\\\'),
            };
            const chats = this._options.channels.telegram.live.chats;
            const message = template(context);
            messages.push(new msg_telegram_1.MsgTelegram(chats, message));
        };
        dev();
        if (this._error instanceof error_balance_critical_1.ExceptionBalanceCritical) {
            live();
        }
        return messages;
    }
    /**
     * Ready to send message getter.
     */
    getMessagesEmail() {
        const messages = [];
        const { email } = this._options.channels;
        if (false === email.active) {
            return messages;
        }
        const dev = () => {
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
            messages.push(new msg_email_1.MsgEmail(to, subject, message));
        };
        const live = () => {
            const templateSource = fs.readFileSync(path.resolve(__dirname, '../views/email/parser-msg.html'), 'utf-8');
            const template = handlebars.compile(templateSource);
            const context = {
                message: this._error.toString(),
            };
            const to = this._options.channels.email.live.sendTo;
            const subject = this._options.channels.email.live.subjectError;
            const message = template(context);
            messages.push(new msg_email_1.MsgEmail(to, subject, message));
        };
        dev();
        if (this._error instanceof error_balance_critical_1.ExceptionBalanceCritical) {
            live();
        }
        return messages;
    }
}
exports.ParserError = ParserError;
