import { Page } from 'puppeteer';
import type { ConfigInterface } from '../types/config';
/**
 * Client for interaction with remote host.
 */
export declare class PuppeteerClient {
    private _proxy;
    private _browser;
    private _timeout;
    protected readonly cookieFilePath: string;
    /**
     * Constructor.
     */
    constructor(options: ConfigInterface['context']);
    /**
     * Puppeteer agent.
     */
    makeBrowser(): Promise<void>;
    /**
     * Page loader.
     */
    load(page: Page, url: string, language: string): Promise<Page>;
    /**
     * Blank tab loader.
     */
    createPage(): Promise<Page>;
    /**
     * Close browser and puppeteer connection.
     */
    destroy(): Promise<void>;
    /**
     * Saves domain cookies into file.
     */
    private loadCookies;
    /**
     * Load domain cookies into file.
     */
    private saveCookies;
    /**
     * Simple timer.
     */
    private delay;
}
