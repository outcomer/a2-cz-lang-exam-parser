import { Page, KnownDevices } from 'puppeteer';
import { promises as Fs } from 'node:fs';
import path = require('path');
import puppeteer, { PuppeteerLaunchOptions, Browser } from 'puppeteer';
import type { ConfigInterface } from '../types/config';

/**
 * Client for interaction with remote host.
 */
export class PuppeteerClient {
    private _proxy: string | void;
    private _browser: Browser;
    private _timeout: number;
    protected readonly cookieFilePath: string = path.resolve(__dirname, '../../cookie.json');

    /**
     * Constructor.
     */
    public constructor(options: ConfigInterface['context']) {
        this._proxy = options.proxy;
        this._timeout = options.timeout;
    }

    /**
     * Puppeteer agent.
     */
    public async makeBrowser(): Promise<void> {
        if (this._browser instanceof Browser) {
            return;
        }

        const optionsPuppeteer: PuppeteerLaunchOptions = {
            headless: false,
            slowMo: 10,
            defaultViewport: null,
            protocolTimeout: this._timeout,
            devtools: true,
            args: [
                '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
                '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
            ],
        };

        if ('string' === typeof this._proxy) {
            optionsPuppeteer.args.push(`--proxy-server=${new URL(this._proxy).host}`);
        }

        this._browser = await puppeteer.launch(optionsPuppeteer);
    }

    /**
     * Page loader.
     */
    public async load(page: Page, url: string, language: string): Promise<Page> {
        await this.delay(200);
        await this.makeBrowser();
        await this.loadCookies(page, url, language);
        await page.emulate(KnownDevices['Galaxy S8']);
        await page.goto(url.replace('{lang}', language), { timeout: 30000 });
        await this.saveCookies(page, url);

        return page;
    }

    /**
     * Blank tab loader.
     */
    public async createPage(): Promise<Page> {
        const page = await this._browser.newPage();

        if ('string' === typeof this._proxy) {
            const url = new URL(this._proxy);
            const hasUsername = url.username !== '';
            const hasPassword = url.password !== null && url.password !== undefined;

            if (hasUsername && hasPassword) {
                await page.authenticate({
                    username: url.username,
                    password: url.password,
                });
            }
        }

        return page;
    }

    /**
     * Close browser and puppeteer connection.
     */
    public async destroy(): Promise<void> {
        if (this._browser instanceof Browser) {
            await this._browser.close();
            this._browser = undefined;
        }
    }

    /**
     * Saves domain cookies into file.
     */
    private async loadCookies(page: Page, url: string, language: string): Promise<void> {
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);

        const defaultLanguageCookie = {
            domain: new URL(url).hostname,
            expires: expires.getTime() / 1000,
            httpOnly: false,
            name: 'language',
            path: '/',
            sameParty: false,
            secure: false,
            session: false,
            size: 10,
            sourcePort: 443,
            sourceScheme: 'Secure',
            value: language,
        };

        const eliminateCookieDuplicates = (array, key: string): Array<any> => {
            const uniqueNames = {};
            const resultArray = array.filter((obj) => {
                if (uniqueNames[obj[key]]) {
                    return false;
                }
                uniqueNames[obj[key]] = true;
                return true;
            });

            return resultArray;
        };

        try {
            await Fs.access(this.cookieFilePath);
        } catch (error) {
            await Fs.writeFile(this.cookieFilePath, JSON.stringify([defaultLanguageCookie], null, 2));
        }

        const content = await Fs.readFile(this.cookieFilePath);
        let cookies = JSON.parse(content.toString());
        cookies = eliminateCookieDuplicates(cookies, 'name');

        const cookieLang = cookies.find((cookie) => cookie.name === 'language');
        const cookieSess = cookies.find((cookie) => cookie.name === 'PHPSESSID');

        if ('undefined' === typeof cookieLang) {
            cookies.push(defaultLanguageCookie);
        } else {
            cookieLang.value = language;
        }

        if (cookieSess) {
            cookieSess.expires = expires.getTime() / 1000;
        }

        await Fs.writeFile(this.cookieFilePath, JSON.stringify(cookies, null, 2));
        await page.setCookie(...cookies);
    }

    /**
     * Load domain cookies into file.
     */
    private async saveCookies(page: Page, url: string): Promise<void> {
        const cookies = await page.cookies(url);
        await Fs.writeFile(this.cookieFilePath, JSON.stringify(cookies, null, 2));
    }

    /**
     * Simple timer.
     */
    private async delay(milliseconds: number) {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }
}
