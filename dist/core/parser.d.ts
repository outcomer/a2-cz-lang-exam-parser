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
export declare class Parser {
    private _jobsCount;
    private _activeJobs;
    private _activeTasks;
    private readonly _client;
    private readonly _notificator;
    private readonly _options;
    private readonly _reset;
    private readonly _fgGreen;
    private readonly _fgYellow;
    /**
     * Constructor.
     */
    constructor(config: ConfigInterface);
    /**
     * Independantly run parser only once.
     * But do not stop it.
     */
    runOnce(): Promise<this>;
    /**
     * Independantly run static and dynamic cron jobs.
     */
    runCron(): Promise<this>;
    /**
     * Stop parser (jobs in progress will still
     * be running).
     */
    stop(): Promise<void>;
    /**
     * Trigger static part of cron.
     */
    private staticJob;
    /**
     * Trigger dynamic part of cron.
     * Once finished job will require new timer.
     */
    private dynamicJob;
    /**
     * Parser itself.
     */
    private parse;
    /**
     * Cron job stopper.
     */
    private shouldBreakJob;
    /**
     * Validates jobs in stack against maximum allowed to run in parallel.
     */
    private shouldDropTask;
    /**
     * Validates if job has any limits for number of executions.
     */
    private jobIsBreakable;
    /**
     * Handles all errors and exceptions accross the whole App.
     */
    private handleErr;
    private dump;
    private formateDate;
}
