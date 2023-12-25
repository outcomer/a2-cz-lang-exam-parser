"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notificator = void 0;
const client_email_1 = require("./client-email");
const client_telegram_1 = require("./client-telegram");
const parser_error_1 = require("./parser-error");
const parser_success_slots_1 = require("./parser-success-slots");
/**
 * Notifications dispatcher.
 */
class Notificator {
    _parserResult;
    _notifyOptions;
    constructor(notifyOptions) {
        this._notifyOptions = notifyOptions;
    }
    /**
     * Notificator handler.
     * Acts like a dispatcher, validates logic
     * and decide whether to send mesage and where to send it.
     */
    async notify(parserResult) {
        this._parserResult = parserResult;
        await Promise.all([this.notifyTelegram(), this.notifyEmail()]);
    }
    /**
     * Notificate via Telegram.
     * Deal with a type of message, prepare content
     * and pass it to client.
     */
    notifyTelegram = async () => {
        const client = new client_telegram_1.ClientTelegram(this._notifyOptions.channels.telegram.token);
        if (this._parserResult instanceof parser_success_slots_1.ParserSuccessSlots) {
            for (const telegramMessage of this._parserResult.getMessagesTelegram()) {
                await client.send(telegramMessage);
                if (!this.isMessageRepeatable(this._parserResult)) {
                    continue;
                }
                let stack = [];
                let repeat = this._notifyOptions.repeatSuccefullMessage.num;
                let interval = this._notifyOptions.repeatSuccefullMessage.intervalSec;
                for (let i = 1; i <= repeat; i++) {
                    await this.delay(interval);
                    for (const telegramMessageRemind of this._parserResult.getMessagesTelegram(true)) {
                        stack.push(client.send(telegramMessageRemind));
                    }
                }
                await Promise.all(stack);
            }
        }
        if (this._parserResult instanceof parser_error_1.ParserError) {
            for (const telegramMessage of this._parserResult.getMessagesTelegram()) {
                await client.send(telegramMessage);
            }
        }
    };
    /**
     * Notificate via Email.
     * Deal with a type of message, prepare content
     * and pass it to client.
     */
    notifyEmail = async () => {
        const client = new client_email_1.ClientEmail(this._notifyOptions.channels.email.gMailUser, this._notifyOptions.channels.email.gAppPass);
        if (this._parserResult instanceof parser_success_slots_1.ParserSuccessSlots) {
            for (const emailMessage of this._parserResult.getMessagesEmail()) {
                await client.send(emailMessage);
                if (this.isMessageRepeatable(this._parserResult)) {
                    continue;
                }
                let stack = [];
                let repeat = this._notifyOptions.repeatSuccefullMessage.num;
                let interval = this._notifyOptions.repeatSuccefullMessage.intervalSec;
                for (let i = 1; i <= repeat; i++) {
                    await this.delay(interval);
                    for (const emailMessageRemind of this._parserResult.getMessagesEmail(true)) {
                        stack.push(client.send(emailMessageRemind));
                    }
                }
                await Promise.all(stack);
            }
        }
        if (this._parserResult instanceof parser_error_1.ParserError) {
            for (const emailMessage of this._parserResult.getMessagesEmail()) {
                await client.send(emailMessage);
            }
        }
    };
    /**
     * Reads config for repeatition params.
     */
    isMessageRepeatable = (message) => {
        return (message.slots.length > 0 &&
            this._notifyOptions.repeatSuccefullMessage.num > 0 &&
            this._notifyOptions.repeatSuccefullMessage.intervalSec > 0);
    };
    /**
     * Simple timer.
     */
    delay = async (seconds) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, seconds * 1000);
        });
    };
}
exports.Notificator = Notificator;
