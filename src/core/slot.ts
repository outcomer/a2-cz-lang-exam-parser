import { ClientTelegram } from '../notification/client-telegram';

/**
 * Unit of succesfull search result.
 */
export class Slot {
    private _city: string;
    private _text: string;
    private _href: string;

    /**
     * Constructor.
     */
    constructor(city: string, text: string, href: string) {
        this._city = city;
        this._text = text;
        this._href = href;
    }

    /**
     * Converter.
     */
    public toTelegramMarkdownString(): string {
        let textEsc: string;

        if (this.isValidURL(this._href)) {
            textEsc = `[${ClientTelegram.escapeMarkdownV2(this._text)}](${this._href})`;
        } else {
            textEsc = ClientTelegram.escapeMarkdownV2(this._text);
        }

        return `${ClientTelegram.escapeMarkdownV2(this._city)}: ${textEsc}`;
    }

    /**
     * Converter.
     */
    public toEmailHtmlString(): string {
        let text: string;

        if (this.isValidURL(this._href)) {
            text = `<a href="${this._href}">${this._text}</a>`;
        } else {
            text = this._text;
        }

        return `${this._city} - ${text}`;
    }

    /**
     * URL validator.
     */
    private isValidURL(url: string) {
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
    }
}
