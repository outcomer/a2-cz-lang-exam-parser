export interface CronInterface {
    /**
     * The cron task will be stopped when this number
     * is reached. The counter works for all tasks in
     * total. Value must be greater 0 to activate option.
     * Applied to non-dropped by maxConcurrency tasks run only.
     */
    maxRuns: number;

    /**
     * Maximum number of concurrent tasks. The counter
     * works for all jobs in total. Value must be greater
     * 0 to activate option.
     */
    maxConcurrency: number;

    /**
     * This one is simple and static.
     * Follow crontab syntax.
     * To debug visit https://crontab.guru/.
     */
    staticTime: string[];

    /**
     * This one more tricky. Function must return
     * JS Date instance with time when task should be
     * triggered. Once task done function will be invoked
     * again to get next time and so on..
     *
     * Current example will lead to running job twice per
     * hour from 9AM to 8PM: at a random time in a ranges 0 - 30 min and at
     * a random time at a range 31 - 59 mins.
     */
    dynamicTime: () => Date | void;
}
