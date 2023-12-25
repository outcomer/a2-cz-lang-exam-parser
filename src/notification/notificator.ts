import { ClientEmail } from './client-email';
import { ClientTelegram } from './client-telegram';
import { ConfigInterface } from '../types/config';
import { ParserError } from './parser-error';
import { ParserResultInterface } from '../types/app';
import { ParserSuccessSlots } from './parser-success-slots';

/**
 * Notifications dispatcher.
 */
export class Notificator {
    private _parserResult: ParserResultInterface;
    private _notifyOptions: ConfigInterface['notifications'];

    constructor(notifyOptions: ConfigInterface['notifications']) {
        this._notifyOptions = notifyOptions;
    }

    /**
     * Notificator handler.
     * Acts like a dispatcher, validates logic
     * and decide whether to send mesage and where to send it.
     */
    public async notify(parserResult: ParserResultInterface): Promise<void> {
        this._parserResult = parserResult;
        await Promise.all([this.notifyTelegram(), this.notifyEmail()]);
    }

    /**
     * Notificate via Telegram.
     * Deal with a type of message, prepare content
     * and pass it to client.
     */
    private notifyTelegram = async (): Promise<void> => {
        const client = new ClientTelegram(this._notifyOptions.channels.telegram.token);

        if (this._parserResult instanceof ParserSuccessSlots) {
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

        if (this._parserResult instanceof ParserError) {
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
    private notifyEmail = async (): Promise<void> => {
        const client = new ClientEmail(
            this._notifyOptions.channels.email.gMailUser,
            this._notifyOptions.channels.email.gAppPass
        );

        if (this._parserResult instanceof ParserSuccessSlots) {
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

        if (this._parserResult instanceof ParserError) {
            for (const emailMessage of this._parserResult.getMessagesEmail()) {
                await client.send(emailMessage);
            }
        }
    };

    /**
     * Reads config for repeatition params.
     */
    private isMessageRepeatable = (message: ParserSuccessSlots) => {
        return (
            message.slots.length > 0 &&
            this._notifyOptions.repeatSuccefullMessage.num > 0 &&
            this._notifyOptions.repeatSuccefullMessage.intervalSec > 0
        );
    };

    /**
     * Simple timer.
     */
    private delay = async (seconds: number): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, seconds * 1000);
        });
    };
}
