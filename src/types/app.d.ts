import type { JSDOM } from 'jsdom';
import type { Page } from 'puppeteer';

export interface ClientInterface {
    load(url: string, language: string): Promise<Page>;
}

export interface PageInterface {
    captchaCFTurnstileProcessor(): CaptchaProcessorInterface;
    captchaReCaptchaProcessor(): CaptchaProcessorInterface;
    close(): void;
    content(): Promise<JSDOM>;
    get page(): Page | void;
    load(url: string, language: string): Promise<void>;
    url(): string;
}

export interface CaptchaProcessorInterface {
    getConfig(): Promise<CaptchaCFTurnstileConfigInterface | CaptchaReCaptchaConfigInterface | void>;
    submit(token: string, callbackName: string): Promise<void>;
}

export interface MsgEventInterface {
    extra: string[];
}

export interface MsgEmailInterface {
    get to(): string[];
    get subject(): string;
    get body(): string;
}
export interface MsgTelegramInterface {
    get chats(): string[];
    get body(): string;
}

export interface ParserResultInterface {
    getMessagesTelegram(): MsgTelegramInterface[];
    getMessagesEmail(): MsgEmailInterface[];
}

export interface CaptchaReCaptchaConfigInterface {
    sitekey: string;
    verifyFn: string;
}

export interface CaptchaCFTurnstileConfigInterface {
    sitekey: string;
    verifyFn: string;
}

export interface AppWindow extends Window {
    jQuery?: any;
    _cf_chl_opt?: {
        chlApiSitekey: string;
    };
}
