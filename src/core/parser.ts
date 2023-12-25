import { CronJob } from 'cron';
import { Dispatcher } from '../captcha/dispatcher';
import { ErrorHandler } from './error-handler';
import { isValid } from 'date-fns';
import { LaunchOptions } from './options';
import { Notificator } from '../notification/notificator';
import { PageParser } from '../context/page-parser';
import { ParserError } from '../notification/parser-error';
import { ParserSuccessSlots } from '../notification/parser-success-slots';
import { PuppeteerClient } from '../context/puppeteer-client';
import { PuppeteerPage } from '../context/puppeteer-page';
import { Tracer } from './tracer';
import type { ConfigExample } from '../config-example';
import type { ConfigInterface } from '../types/config';

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
export class Parser {
    private _jobsCount: number = 0;
    private _activeJobs: Array<Promise<string>> = [];
    private _activeTasks: number = 0;

    private readonly _client: PuppeteerClient;
    private readonly _notificator: Notificator;
    private readonly _options: LaunchOptions;

    private readonly _reset = '\x1b[0m';
    private readonly _fgGreen = '\x1b[32m';
    private readonly _fgYellow = '\x1b[93m';

    /**
     * Constructor.
     */
    public constructor(config: ConfigInterface) {
        this._options = new LaunchOptions(config);

        this._client = new PuppeteerClient(this._options.context);
        this._notificator = new Notificator(this._options.notifications);
    }

    /**
     * Independantly run parser only once.
     * But do not stop it.
     */
    public async runOnce(): Promise<this> {
        const tracer = new Tracer();
        const dispatcher = new Dispatcher(this._options.toCatcha, tracer);
        const page = new PuppeteerPage(this._client, dispatcher);
        const parserSuccessSlots = new ParserSuccessSlots(this._options.notifications, this._options.slotPage, tracer);

        this.dump(`Single run triggered.`);

        try {
            await this._client.makeBrowser();
            await page.load(this._options.slotPage.url, this._options.slotPage.language);

            parserSuccessSlots.slots = await PageParser.slots(
                page,
                this._options.slotPage.targetContainerSelector,
                this._options.slotPage.noTermsText
            );

            await this._notificator.notify(parserSuccessSlots);
            await page.close();
        } catch (error: any) {
            await this.handleErr(error);
        } finally {
            tracer.flush();
        }

        return this;
    }

    /**
     * Independantly run static and dynamic cron jobs.
     */
    public async runCron(): Promise<this> {
        await this.staticJob();
        await this.dynamicJob();

        return this;
    }

    /**
     * Stop parser (jobs in progress will still
     * be running).
     */
    public async stop(): Promise<void> {
        await this._client.destroy();
        this._activeJobs = [];
        this._activeTasks = 0;
    }

    /**
     * Trigger static part of cron.
     */
    private async staticJob(): Promise<void> {
        if (0 === this._options.cron.staticTime.length) {
            return;
        }

        const _self = this;
        await _self._client.makeBrowser();

        for (const time of _self._options.cron.staticTime) {
            const tracer = new Tracer();
            const dispatcher = new Dispatcher(this._options.toCatcha, tracer);
            const page = new PuppeteerPage(this._client, dispatcher);
            const parserSuccessSlots = new ParserSuccessSlots(
                this._options.notifications,
                this._options.slotPage,
                tracer
            );

            CronJob.from({
                cronTime: time,
                onTick: function (): void {
                    if (_self.shouldBreakJob()) {
                        // Will trigger CronJob.onComplete()
                        this.stop();
                        return;
                    }
                    _self.parse(_self, page, parserSuccessSlots, tracer);
                },
                onComplete: async (): Promise<void> => {
                    await Promise.allSettled(_self._activeJobs);
                    await _self.stop();
                },
                start: true,
                timeZone: null,
            });
        }

        const t = _self._options.cron.staticTime.length > 0 ? '' : 'Never';
        this.dump(`Static job(s) planned at: T`.replace('T', t));

        _self._options.cron.staticTime.forEach((time: string) =>
            console.log(_self._fgGreen, `- ${time}`, _self._reset)
        );
    }

    /**
     * Trigger dynamic part of cron.
     * Once finished job will require new timer.
     */
    private async dynamicJob(): Promise<void> {
        const _self = this;
        await _self._client.makeBrowser();

        const tracer = new Tracer();
        const dispatcher = new Dispatcher(this._options.toCatcha, tracer);
        const page = new PuppeteerPage(this._client, dispatcher);
        const parserSuccessSlots = new ParserSuccessSlots(this._options.notifications, this._options.slotPage, tracer);

        const start = () => {
            const time = this._options.cron.dynamicTime();

            if (!(time instanceof Date) || !isValid(time)) {
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
                CronJob.from({
                    cronTime: time,
                    onTick: async function (): Promise<void> {
                        if (_self.shouldBreakJob()) {
                            // Will trigger CronJob.onComplete()
                            this.stop();
                            return;
                        }

                        await _self.parse(_self, page, parserSuccessSlots, tracer);
                        start();
                    },
                    onComplete: async (): Promise<void> => {
                        await Promise.allSettled(_self._activeJobs);
                        await _self.stop();
                    },
                    start: true,
                    timeZone: null,
                });
            } catch (error) {
                this.dump(`${error.message}. Restarting job...`);
                start();
            }
        };

        start();
    }

    /**
     * Parser itself.
     */
    private async parse(
        parser: this,
        page: PuppeteerPage,
        parserSuccessSlots: ParserSuccessSlots,
        tracer: Tracer
    ): Promise<void> {
        const go = async (): Promise<string> => {
            this._jobsCount++;
            this._activeTasks++;
            this.dump(`Cron triggered.`);

            try {
                await page.load(this._options.slotPage.url, this._options.slotPage.language, true);

                parserSuccessSlots.slots = await PageParser.slots(
                    page,
                    this._options.slotPage.targetContainerSelector,
                    this._options.slotPage.noTermsText
                );

                await this._notificator.notify(parserSuccessSlots);

                return 'parsed';
            } catch (error: any) {
                await this.handleErr(error);

                return 'error';
            } finally {
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
    private shouldBreakJob(): boolean {
        return this._options.cron.maxRuns > 0 && this._jobsCount >= this._options.cron.maxRuns;
    }

    /**
     * Validates jobs in stack against maximum allowed to run in parallel.
     */
    private shouldDropTask(): boolean {
        return this._options.cron.maxConcurrency > 0 && this._activeTasks >= this._options.cron.maxConcurrency;
    }

    /**
     * Validates if job has any limits for number of executions.
     */
    private jobIsBreakable(): boolean {
        return this._options.cron.maxRuns > 0;
    }

    /**
     * Handles all errors and exceptions accross the whole App.
     */
    private async handleErr(error: Error): Promise<void> {
        const errorHandler = new ErrorHandler(this._notificator, new ParserError(this._options.notifications));

        await errorHandler.handle(error);
    }

    private dump(msg: string) {
        console.log(`[${this._fgYellow}${this.formateDate(new Date())}${this._reset}]:`, msg);
    }

    private formateDate(date: Date): string {
        return date.toISOString();
    }
}
