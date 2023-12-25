"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slot = void 0;
const client_telegram_1 = require("../notification/client-telegram");
/**
 * Unit of succesfull search result.
 */
class Slot {
    _city;
    _text;
    _href;
    /**
     * Constructor.
     */
    constructor(city, text, href) {
        this._city = city;
        this._text = text;
        this._href = href;
    }
    /**
     * Converter.
     */
    toTelegramMarkdownString() {
        let textEsc;
        if (this.isValidURL(this._href)) {
            textEsc = `[${client_telegram_1.ClientTelegram.escapeMarkdownV2(this._text)}](${this._href})`;
        }
        else {
            textEsc = client_telegram_1.ClientTelegram.escapeMarkdownV2(this._text);
        }
        return `${client_telegram_1.ClientTelegram.escapeMarkdownV2(this._city)}: ${textEsc}`;
    }
    /**
     * Converter.
     */
    toEmailHtmlString() {
        let text;
        if (this.isValidURL(this._href)) {
            text = `<a href="${this._href}">${this._text}</a>`;
        }
        else {
            text = this._text;
        }
        return `${this._city} - ${text}`;
    }
    /**
     * URL validator.
     */
    isValidURL(url) {
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
    }
}
exports.Slot = Slot;
