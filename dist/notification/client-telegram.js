"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientTelegram = void 0;
const winston = require("winston");
const axios_1 = require("axios");
/**
 * Specific messanger client for Telegram.
 */
class ClientTelegram {
    _logger;
    static markdownSpcecialChars = [
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
    _token;
    _msgMaxLenght = 2048; // 2KB - 2000 non-latin chars.
    /**
     * Constructor.
     */
    constructor(token) {
        this._token = token;
        this._logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.printf(({ stack, timestamp }) => {
                return `${timestamp} ${stack}`;
            })),
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
    static escapeMarkdownV2(text) {
        ClientTelegram.markdownSpcecialChars.forEach((char) => {
            text = text.replaceAll(char, `\\${char}`);
        });
        return text;
    }
    /**
     * Messages dispatcher.
     */
    async send(message) {
        for (const chat of message.chats) {
            await this.sendMessage(chat.trim(), message.body);
        }
    }
    /**
     * Single message dispatcher.
     */
    async sendMessage(chatID, message) {
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
            await (0, axios_1.default)({
                method: 'get',
                url: `${url}?${queryParams.toString()}`,
            });
        }
        catch (error) {
            this._logger.error(new Error(`Error sending telegram message: ${message}`));
            const queryParams = new URLSearchParams({
                chat_id: chatID,
                parse_mode: 'MarkdownV2',
                disable_web_page_preview: 'true',
                text: `Error sending message\\. Original message saved in telegram error log\\. Sending error\\:\`\`\`${JSON.stringify(error, null, 2)}\`\`\``,
            });
            await (0, axios_1.default)({
                method: 'get',
                url: `${url}?${queryParams.toString()}`,
            });
        }
    }
}
exports.ClientTelegram = ClientTelegram;
