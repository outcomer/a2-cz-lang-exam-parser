import { JSDOM } from 'jsdom';
import { Page } from 'puppeteer';
import type { PageInterface } from '../types/app';
import type { CaptchaProcessorInterface } from '../types/app';
import type { Dispatcher } from '../captcha/dispatcher';
import type { PuppeteerClient } from './puppeteer-client';
/**
 * Main interface for interaction with target page.
 * Final goal it to provide a way to get HTML content
 * of page with a list of exam slots.
 */
export declare class PuppeteerPage implements PageInterface {
    private _page;
    private readonly _client;
    private readonly _dispatcher;
    private readonly _tracer;
    /**
     * Constructor.
     */
    constructor(client: PuppeteerClient, dispatcher: Dispatcher);
    /**
     * Getter.
     */
    get page(): Page;
    /**
     * Page smart loader.
     * Load page, attach required event handlers,
     * trace IP and fire captcha resolving.
     */
    load(url: string, language: string, reload?: boolean): Promise<void>;
    /**
     * Reloads page and that is all.
     */
    reload(): Promise<void>;
    /**
     * Close opened page.
     */
    close(): Promise<void>;
    /**
     * Page url getter.
     */
    url(): string;
    /**
     * Page HTML content getter.
     */
    content(): Promise<JSDOM>;
    /**
     * CloudFlare captcha processor.
     * Allows to get captcha config
     * and submit captcha like user do.
     */
    captchaCFTurnstileProcessor(): CaptchaProcessorInterface;
    /**
     * Google captcha processor.
     * Allows to get captcha config
     * and submit captcha like user do.
     */
    captchaReCaptchaProcessor(): CaptchaProcessorInterface;
    /**
     * Apply required checks at page.
     */
    private validate;
    /**
     * Handle errors thrown in browser context
     * and dispatch them into Nodejs environment.
     */
    private handleErrors;
    /**
     * Puppeteer native request's interceptor.
     * Site loads a lot of redundunt data that
     * actually not reuired but increase traffic.
     */
    private handleRequest;
    /**
     * Fetch remote host for current IP.
     */
    private traceOutgoingIP;
}
