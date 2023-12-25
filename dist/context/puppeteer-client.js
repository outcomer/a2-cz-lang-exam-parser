"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuppeteerClient = void 0;
const puppeteer_1 = require("puppeteer");
const node_fs_1 = require("node:fs");
const path = require("path");
const puppeteer_2 = require("puppeteer");
/**
 * Client for interaction with remote host.
 */
class PuppeteerClient {
    _proxy;
    _browser;
    _timeout;
    cookieFilePath = path.resolve(__dirname, '../../cookie.json');
    /**
     * Constructor.
     */
    constructor(options) {
        this._proxy = options.proxy;
        this._timeout = options.timeout;
    }
    /**
     * Puppeteer agent.
     */
    async makeBrowser() {
        if (this._browser instanceof puppeteer_2.Browser) {
            return;
        }
        const optionsPuppeteer = {
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
        this._browser = await puppeteer_2.default.launch(optionsPuppeteer);
    }
    /**
     * Page loader.
     */
    async load(page, url, language) {
        await this.delay(200);
        await this.makeBrowser();
        await this.loadCookies(page, url, language);
        await page.emulate(puppeteer_1.KnownDevices['Galaxy S8']);
        await page.goto(url.replace('{lang}', language), { timeout: 30000 });
        await this.saveCookies(page, url);
        return page;
    }
    /**
     * Blank tab loader.
     */
    async createPage() {
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
    async destroy() {
        if (this._browser instanceof puppeteer_2.Browser) {
            await this._browser.close();
            this._browser = undefined;
        }
    }
    /**
     * Saves domain cookies into file.
     */
    async loadCookies(page, url, language) {
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
        const eliminateCookieDuplicates = (array, key) => {
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
            await node_fs_1.promises.access(this.cookieFilePath);
        }
        catch (error) {
            await node_fs_1.promises.writeFile(this.cookieFilePath, JSON.stringify([defaultLanguageCookie], null, 2));
        }
        const content = await node_fs_1.promises.readFile(this.cookieFilePath);
        let cookies = JSON.parse(content.toString());
        cookies = eliminateCookieDuplicates(cookies, 'name');
        const cookieLang = cookies.find((cookie) => cookie.name === 'language');
        const cookieSess = cookies.find((cookie) => cookie.name === 'PHPSESSID');
        if ('undefined' === typeof cookieLang) {
            cookies.push(defaultLanguageCookie);
        }
        else {
            cookieLang.value = language;
        }
        if (cookieSess) {
            cookieSess.expires = expires.getTime() / 1000;
        }
        await node_fs_1.promises.writeFile(this.cookieFilePath, JSON.stringify(cookies, null, 2));
        await page.setCookie(...cookies);
    }
    /**
     * Load domain cookies into file.
     */
    async saveCookies(page, url) {
        const cookies = await page.cookies(url);
        await node_fs_1.promises.writeFile(this.cookieFilePath, JSON.stringify(cookies, null, 2));
    }
    /**
     * Simple timer.
     */
    async delay(milliseconds) {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }
}
exports.PuppeteerClient = PuppeteerClient;
