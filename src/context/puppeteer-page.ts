import { JSDOM } from 'jsdom';
import { Page, JSHandle, ElementHandle, HTTPRequest } from 'puppeteer';
import type { AppWindow, PageInterface } from '../types/app';
import type { CaptchaCFTurnstileConfigInterface } from '../types/app';
import type { CaptchaProcessorInterface } from '../types/app';
import type { CaptchaReCaptchaConfigInterface } from '../types/app';
import type { Dispatcher } from '../captcha/dispatcher';
import type { PuppeteerClient } from './puppeteer-client';
import type { Tracer } from '../core/tracer';

/**
 * Main interface for interaction with target page.
 * Final goal it to provide a way to get HTML content
 * of page with a list of exam slots.
 */
export class PuppeteerPage implements PageInterface {
    private _page: Page;
    private readonly _client: PuppeteerClient;
    private readonly _dispatcher: Dispatcher;
    private readonly _tracer: Tracer;

    /**
     * Constructor.
     */
    public constructor(client: PuppeteerClient, dispatcher: Dispatcher) {
        this._client = client;
        this._dispatcher = dispatcher;
        this._tracer = dispatcher.tracer;
    }

    /**
     * Getter.
     */
    public get page(): Page {
        return this._page;
    }

    /**
     * Page smart loader.
     * Load page, attach required event handlers,
     * trace IP and fire captcha resolving.
     */
    public async load(url: string, language: string, reload: boolean = false): Promise<void> {
        if (true === reload && this._page instanceof Page) {
            await this.reload();
        } else {
            this._page = await this._client.createPage();
            await this._page.setRequestInterception(true);

            this._page.on('error', this.handleErrors.bind(this));
            this._page.on('pageerror', this.handleErrors.bind(this));
            this._page.on('request', this.handleRequest.bind(this));
            await this._client.load(this._page, url, language);
        }

        await this.traceOutgoingIP();
        await this.validate();
    }

    /**
     * Reloads page and that is all.
     */
    public async reload(): Promise<void> {
        await this._page.reload();
    }

    /**
     * Close opened page.
     */
    public async close(): Promise<void> {
        if (this._page.isClosed()) {
            return;
        }

        await this._page.close();
    }

    /**
     * Page url getter.
     */
    public url(): string {
        return this._page.url();
    }

    /**
     * Page HTML content getter.
     */
    public async content(): Promise<JSDOM> {
        const content = await this._page.content();
        const dom = new JSDOM(content, { url: this.url() });

        return dom;
    }

    /**
     * CloudFlare captcha processor.
     * Allows to get captcha config
     * and submit captcha like user do.
     */
    public captchaCFTurnstileProcessor(): CaptchaProcessorInterface {
        const getConfig = async (): Promise<CaptchaCFTurnstileConfigInterface | void> => {
            let node: JSHandle | void;

            const findCaptchaFrame = async (): Promise<void> => {
                const hasCaptchaScriptTag = await this._page.$(`script[src*="/turnstile/v0/api.js"]`);

                if (hasCaptchaScriptTag instanceof JSHandle) {
                    node = await this._page.$(`iframe[src*="challenges.cloudflare.com"][src*="/turnstile"]`);
                }
            };

            const buildConfig = async (): Promise<CaptchaCFTurnstileConfigInterface> => {
                const contentFrame = await (node as ElementHandle).contentFrame();
                const cfChlOpt = await contentFrame.evaluate(async (): Promise<AppWindow['_cf_chl_opt']> => {
                    return (window as AppWindow)._cf_chl_opt;
                });

                return {
                    sitekey: cfChlOpt.chlApiSitekey,
                    verifyFn: 'verify',
                };
            };

            await findCaptchaFrame();

            if (node instanceof JSHandle) {
                return await buildConfig();
            }
        };

        const submit = async (token: string, callbackName: string): Promise<void> => {
            await this._page.evaluate(
                async (token: string, _callbackName: string) => {
                    await fetch(window.location.href, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `action=verifyToken&token=${encodeURIComponent(token)}`,
                    });

                    window.location.reload();

                    /**
                     * This approach works, but... only if page submits captcha solution
                     * being loaded alone. If more then one page was loaded at once and
                     * first page submitted solution, than other pages will recieve
                     * validated page within response and it will trigger jQuery error,
                     * cause response is not valid JSON.
                     */
                    /* (document.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement).value =
                        token;

                    if ('function' === typeof window[callbackName]) {
                        window[callbackName](token);
                    } */
                },
                token,
                callbackName
            );

            await this._page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 });
            return;
        };

        return {
            getConfig: getConfig,
            submit: submit,
        };
    }

    /**
     * Google captcha processor.
     * Allows to get captcha config
     * and submit captcha like user do.
     */
    public captchaReCaptchaProcessor(): CaptchaProcessorInterface {
        const getConfig = async (): Promise<CaptchaReCaptchaConfigInterface | void> => {
            let node: JSHandle | void;

            const findCaptchaNode = async (): Promise<void> => {
                const hasCaptchaScriptTag = await this._page.$(`script[src*="/recaptcha/api.js"]`);

                if (hasCaptchaScriptTag instanceof JSHandle) {
                    node = await this._page.$('div.g-recaptcha[data-sitekey]');
                }
            };

            const buildConfig = async (): Promise<CaptchaReCaptchaConfigInterface> => {
                const sitekey = await (node as ElementHandle).evaluate((element: HTMLElement) => {
                    return element.dataset.sitekey;
                });
                const callback = await (node as ElementHandle).evaluate((element: HTMLElement) => {
                    return element.dataset.callback;
                });

                return {
                    sitekey: sitekey,
                    verifyFn: callback,
                };
            };

            await findCaptchaNode();

            if (node instanceof JSHandle) {
                return await buildConfig();
            }
        };

        const submit = async (token: string, callbackName: string): Promise<void> => {
            await this._page.evaluate(
                async (token: string, _callbackName: string) => {
                    await fetch(window.location.href, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `action=verifyToken&token=${encodeURIComponent(token)}`,
                    });

                    window.location.reload();

                    /**
                     * This approach works, but... only if page submits captcha solution
                     * being loaded alone. If more then one page was loaded at once and
                     * first page submitted solution, than other pages will recieve
                     * validated page within response and it will trigger jQuery error,
                     * cause response is not valid JSON.
                     */
                    /* (document.querySelector('[id="g-recaptcha-response"]') as HTMLInputElement).value = token;

                    if ('function' === typeof window[callbackName]) {
                        window[callbackName](token);
                    } */
                },
                token,
                callbackName
            );

            await this._page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 });
        };

        return {
            getConfig: getConfig,
            submit: submit,
        };
    }

    /**
     * Apply required checks at page.
     */
    private async validate(): Promise<void> {
        await this._dispatcher.dispatch(this);
    }

    /**
     * Handle errors thrown in browser context
     * and dispatch them into Nodejs environment.
     */
    private handleErrors(error: Error): void {
        const ignoreErrMsg = ['jQuery is not defined', 'LiveForm is not defined'];

        if (ignoreErrMsg.includes(error.message)) {
            return;
        }

        throw error;
    }

    /**
     * Puppeteer native request's interceptor.
     * Site loads a lot of redundunt data that
     * actually not reuired but increase traffic.
     */
    private async handleRequest(request: HTTPRequest): Promise<void> {
        let abort: boolean = true;

        switch (request.resourceType()) {
            case 'image':
            case 'stylesheet':
            case 'font':
                abort = true;
                break;

            case 'fetch':
            case 'xhr':
            case 'document':
                abort = false;
                break;

            case 'script':
                const urlRequest = new URL(request.url());
                const urlPage = new URL(this._page.url());

                if (urlRequest.host === urlPage.host) {
                    abort = true;
                    break;
                }

                switch (urlRequest.host) {
                    case 'www.googletagmanager.com':
                    case 'momentjs.com':
                    case 'cse.google.com':
                    case 'cdn.rawgit.com':
                    case 'cdn.jsdelivr.net':
                        abort = true;
                        break;

                    default:
                        abort = false;
                        break;
                }

                break;

            default:
                abort = true;
                break;
        }

        if (false === abort) {
            request.continue();
            return;
        }

        request.abort();
    }

    /**
     * Fetch remote host for current IP.
     */
    private async traceOutgoingIP(): Promise<void> {
        const callback = async (source: string): Promise<string> => {
            try {
                const response = await fetch(source);

                if (response.status === 200) {
                    try {
                        const body = await response.json();
                        return `${body.ip} (${body.country.code})`;
                    } catch (error) {
                        return `unknown, response is not valid JSON - ${await response.text()}`;
                    }
                } else {
                    return `unknown, response ${response.status}`;
                }
            } catch (error) {
                return `unknown, error ${error.toString()}`;
            }
        };

        const geo = await this._page.evaluate(callback, 'https://api.my-ip.io/v2/ip.json');
        this._tracer.addTrace('dev', `Outgoing IP: ${geo}`);
    }
}
