/**
 * Unit of succesfull search result.
 */
export declare class Slot {
    private _city;
    private _text;
    private _href;
    /**
     * Constructor.
     */
    constructor(city: string, text: string, href: string);
    /**
     * Converter.
     */
    toTelegramMarkdownString(): string;
    /**
     * Converter.
     */
    toEmailHtmlString(): string;
    /**
     * URL validator.
     */
    private isValidURL;
}
