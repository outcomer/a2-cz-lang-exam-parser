"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const cron_1 = require("cron");
const dispatcher_1 = require("../captcha/dispatcher");
const error_handler_1 = require("./error-handler");
const date_fns_1 = require("date-fns");
const options_1 = require("./options");
const notificator_1 = require("../notification/notificator");
const page_parser_1 = require("../context/page-parser");
const parser_error_1 = require("../notification/parser-error");
const parser_success_slots_1 = require("../notification/parser-success-slots");
const puppeteer_client_1 = require("../context/puppeteer-client");
const puppeteer_page_1 = require("../context/puppeteer-page");
const tracer_1 = require("./tracer");
/**
 * Entry point.
 *
 * See {@link ConfigExample}
 *
 * Next example creates parser instance and run parsing
 * with given config.
 *
 * ```ts
 * import { Container } from 'a2-cz-lang-exam-parser';
 *
 * const parcer = new Parser(...);
 * parcer.runOnce().stop();
 * parcer.runCron();
 * ```
 */
class Parser {
    _jobsCount = 0;
    _activeJobs = [];
    _activeTasks = 0;
    _client;
    _notificator;
    _options;
    _reset = '\x1b[0m';
    _fgGreen = '\x1b[32m';
    _fgYellow = '\x1b[93m';
    /**
     * Constructor.
     */
    constructor(config) {
        this._options = new options_1.LaunchOptions(config);
        this._client = new puppeteer_client_1.PuppeteerClient(this._options.context);
        this._notificator = new notificator_1.Notificator(this._options.notifications);
    }
    /**
     * Independantly run parser only once.
     * But do not stop it.
     */
    async runOnce() {
        const tracer = new tracer_1.Tracer();
        const dispatcher = new dispatcher_1.Dispatcher(this._options.toCatcha, tracer);
        const page = new puppeteer_page_1.PuppeteerPage(this._client, dispatcher);
        const parserSuccessSlots = new parser_success_slots_1.ParserSuccessSlots(this._options.notifications, this._options.slotPage, tracer);
        this.dump(`Single run triggered.`);
        try {
            await this._client.makeBrowser();
            await page.load(this._options.slotPage.url, this._options.slotPage.language);
            parserSuccessSlots.slots = await page_parser_1.PageParser.slots(page, this._options.slotPage.targetContainerSelector, this._options.slotPage.noTermsText);
            await this._notificator.notify(parserSuccessSlots);
            await page.close();
        }
        catch (error) {
            await this.handleErr(error);
        }
        finally {
            tracer.flush();
        }
        return this;
    }
    /**
     * Independantly run static and dynamic cron jobs.
     */
    async runCron() {
        await this.staticJob();
        await this.dynamicJob();
        return this;
    }
    /**
     * Stop parser (jobs in progress will still
     * be running).
     */
    async stop() {
        await this._client.destroy();
        this._activeJobs = [];
        this._activeTasks = 0;
    }
    /**
     * Trigger static part of cron.
     */
    async staticJob() {
        if (0 === this._options.cron.staticTime.length) {
            return;
        }
        const _self = this;
        await _self._client.makeBrowser();
        for (const time of _self._options.cron.staticTime) {
            const tracer = new tracer_1.Tracer();
            const dispatcher = new dispatcher_1.Dispatcher(this._options.toCatcha, tracer);
            const page = new puppeteer_page_1.PuppeteerPage(this._client, dispatcher);
            const parserSuccessSlots = new parser_success_slots_1.ParserSuccessSlots(this._options.notifications, this._options.slotPage, tracer);
            cron_1.CronJob.from({
                cronTime: time,
                onTick: function () {
                    if (_self.shouldBreakJob()) {
                        // Will trigger CronJob.onComplete()
                        this.stop();
                        return;
                    }
                    _self.parse(_self, page, parserSuccessSlots, tracer);
                },
                onComplete: async () => {
                    await Promise.allSettled(_self._activeJobs);
                    await _self.stop();
                },
                start: true,
                timeZone: null,
            });
        }
        const t = _self._options.cron.staticTime.length > 0 ? '' : 'Never';
        this.dump(`Static job(s) planned at: T`.replace('T', t));
        _self._options.cron.staticTime.forEach((time) => console.log(_self._fgGreen, `- ${time}`, _self._reset));
    }
    /**
     * Trigger dynamic part of cron.
     * Once finished job will require new timer.
     */
    async dynamicJob() {
        const _self = this;
        await _self._client.makeBrowser();
        const tracer = new tracer_1.Tracer();
        const dispatcher = new dispatcher_1.Dispatcher(this._options.toCatcha, tracer);
        const page = new puppeteer_page_1.PuppeteerPage(this._client, dispatcher);
        const parserSuccessSlots = new parser_success_slots_1.ParserSuccessSlots(this._options.notifications, this._options.slotPage, tracer);
        const start = () => {
            const time = this._options.cron.dynamicTime();
            if (!(time instanceof Date) || !(0, date_fns_1.isValid)(time)) {
                this.dump('Given Date for dynamic job is invalid. Ignoring.');
                return;
            }
            if (time < new Date()) {
                this.dump('Given Date for dynamic job is in past. Ignoring.');
                start();
                return;
            }
            this.dump(`Dynamic job planned at: ${this.formateDate(time)}`);
            try {
                cron_1.CronJob.from({
                    cronTime: time,
                    onTick: async function () {
                        if (_self.shouldBreakJob()) {
                            // Will trigger CronJob.onComplete()
                            this.stop();
                            return;
                        }
                        await _self.parse(_self, page, parserSuccessSlots, tracer);
                        start();
                    },
                    onComplete: async () => {
                        await Promise.allSettled(_self._activeJobs);
                        await _self.stop();
                    },
                    start: true,
                    timeZone: null,
                });
            }
            catch (error) {
                this.dump(`${error.message}. Restarting job...`);
                start();
            }
        };
        start();
    }
    /**
     * Parser itself.
     */
    async parse(parser, page, parserSuccessSlots, tracer) {
        const go = async () => {
            this._jobsCount++;
            this._activeTasks++;
            this.dump(`Cron triggered.`);
            try {
                await page.load(this._options.slotPage.url, this._options.slotPage.language, true);
                parserSuccessSlots.slots = await page_parser_1.PageParser.slots(page, this._options.slotPage.targetContainerSelector, this._options.slotPage.noTermsText);
                await this._notificator.notify(parserSuccessSlots);
                return 'parsed';
            }
            catch (error) {
                await this.handleErr(error);
                return 'error';
            }
            finally {
                tracer.flush();
                this._activeTasks--;
            }
        };
        if (parser.shouldDropTask()) {
            this.dump(`Cron task dropped. Reached _maxConcurrency value (${this._options.cron.maxConcurrency})`);
            return;
        }
        if (parser.jobIsBreakable()) {
            parser._activeJobs.push(go());
            return;
        }
        await go();
    }
    /**
     * Cron job stopper.
     */
    shouldBreakJob() {
        return this._options.cron.maxRuns > 0 && this._jobsCount >= this._options.cron.maxRuns;
    }
    /**
     * Validates jobs in stack against maximum allowed to run in parallel.
     */
    shouldDropTask() {
        return this._options.cron.maxConcurrency > 0 && this._activeTasks >= this._options.cron.maxConcurrency;
    }
    /**
     * Validates if job has any limits for number of executions.
     */
    jobIsBreakable() {
        return this._options.cron.maxRuns > 0;
    }
    /**
     * Handles all errors and exceptions accross the whole App.
     */
    async handleErr(error) {
        const errorHandler = new error_handler_1.ErrorHandler(this._notificator, new parser_error_1.ParserError(this._options.notifications));
        await errorHandler.handle(error);
    }
    dump(msg) {
        console.log(`[${this._fgYellow}${this.formateDate(new Date())}${this._reset}]:`, msg);
    }
    formateDate(date) {
        return date.toISOString();
    }
}
exports.Parser = Parser;
