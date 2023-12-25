import { MsgTelegramInterface } from '../types/app';
import * as winston from 'winston';
import axios from 'axios';

/**
 * Specific messanger client for Telegram.
 */
export class ClientTelegram {
    private _logger: winston.Logger;
    public static markdownSpcecialChars: string[] = [
        '\\',
        '_',
        '*',
        '[',
        ']',
        '(',
        ')',
        '~',
        '`',
        '>',
        '<',
        '&',
        '#',
        '+',
        '-',
        '=',
        '|',
        '{',
        '}',
        '.',
        '!',
    ];

    private _token: string;
    private _msgMaxLenght: number = 2048; // 2KB - 2000 non-latin chars.

    /**
     * Constructor.
     */
    constructor(token: string) {
        this._token = token;
        this._logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.printf(({ stack, timestamp }) => {
                    return `${timestamp} ${stack}`;
                })
            ),
            transports: [
                new winston.transports.File({
                    filename: './a2-error-telegram.log',
                    level: 'error',
                    maxsize: 5120000,
                    maxFiles: 20,
                }),
            ],
        });
    }

    /**
     * Escapes restricted symbols in telegramm message.
     */
    public static escapeMarkdownV2(text: string) {
        ClientTelegram.markdownSpcecialChars.forEach((char) => {
            text = text.replaceAll(char, `\\${char}`);
        });

        return text;
    }

    /**
     * Messages dispatcher.
     */
    public async send(message: MsgTelegramInterface): Promise<void> {
        for (const chat of message.chats) {
            await this.sendMessage(chat.trim(), message.body);
        }
    }

    /**
     * Single message dispatcher.
     */
    private async sendMessage(chatID: string, message: string): Promise<void> {
        if (message.length > this._msgMaxLenght) {
            message =
                'Message too long\\. Truncated version\\:\n' +
                '```' +
                `${message.substring(0, this._msgMaxLenght)}` +
                '```';
        }

        const url = `https://api.telegram.org/bot${this._token}/sendMessage`;
        const queryParams = new URLSearchParams({
            chat_id: chatID,
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: 'true',
            text: message,
        });

        try {
            await axios({
                method: 'get',
                url: `${url}?${queryParams.toString()}`,
            });
        } catch (error: any) {
            this._logger.error(new Error(`Error sending telegram message: ${message}`));

            const queryParams = new URLSearchParams({
                chat_id: chatID,
                parse_mode: 'MarkdownV2',
                disable_web_page_preview: 'true',
                text: `Error sending message\\. Original message saved in telegram error log\\. Sending error\\:\`\`\`${JSON.stringify(
                    error,
                    null,
                    2
                )}\`\`\``,
            });

            await axios({
                method: 'get',
                url: `${url}?${queryParams.toString()}`,
            });
        }
    }
}
