import { ConfigInterface } from './types/config';
import { Language } from './types/enum';

const ConfigExample: ConfigInterface = {
    notifications: {
        channels: {
            telegram: {
                active: true,
                token: '%TELEGRAM_BOT_TOKEN%',
                live: {
                    chats: ['CHATID-1', 'CHATID-X'],
                },
                dev: {
                    chats: ['CHATID-1', 'CHATID-X'],
                    reportErrors: true,
                    reportAttempt: true,
                    reportTrace: true,
                },
            },
            email: {
                active: true,
                gMailUser: '773021792e@gmail.com',
                gAppPass: 'get you Google App password',
                live: {
                    sendTo: ['any@valid.email'],
                    subjectSuccess: 'Attention!!! FREE Exam Slot FOUND!!!',
                    subjectError: 'Parser error.',
                },
                dev: {
                    sendTo: ['any@valid.email'],
                    subjectSuccess: 'Attention!!! FREE Exam Slot FOUND!!!',
                    subjectEmpty: 'Parser report - still no slots.',
                    subjectError: 'Parser error.',
                    reportErrors: true,
                    reportAttempt: true,
                    reportTrace: true,
                },
            },
        },
        repeatSuccefullMessage: {
            num: 10,
            intervalSec: 6,
        },
    },
    toCaptcha: {
        secretKey: 'get it from https://2captcha.com/',
        lowBalance: {
            threshold: {
                warn: 5.0,
                critical: 0.1,
            },
            message: 'Anything you want all to know. Placeholder %balance% will be replaced with real value.',
        },
    },
    context: {
        proxy: 'http://username:passwrord@host:port', // or undefined you not needed.
        timeout: 180000,
    },
    slotPage: {
        url: 'https://cestina-pro-cizince.cz/trvaly-pobyt/a2/{lang}/online-prihlaska/',
        language: Language.Czech,
        targetContainerSelector: '#registration-wrap',
        termsText: [
            /* CS */ 'Vybrat',
            /* EN */ 'Select',
            /* UA */ 'Вибрати',
            /* RU */ 'Выбрать',
            /* VN */ 'Chọn, lựa chọn',
            /* FR */ 'Sélectionner',
            /* MN */ 'Сонгох',
        ],
        noTermsText: [
            'Obsazeno',
            'Nedostupná',
            'Filled',
            'Нема місць',
            'Нет мест',
            'không còn trống',
            'Complet',
            'Дүүрэн',
        ],
    },
    cron: {
        maxRuns: 0,
        maxConcurrency: 1,
        staticTime: [
            '* * * * *', // Every minute.
        ],
        dynamicTime: (): Date | void => {
            // ---- Config STARTS here --- //
            const runsPerHour = 3600;
            const startTimeCfg = {
                hours: 9,
                min: 0,
                sec: 0,
                ms: 0,
            };
            const stopTimeCfg = {
                hours: 23,
                min: 0,
                sec: 0,
                ms: 0,
            };
            // ---- Config ENDS here --- //

            const activeFromDate = new Date();
            const activeToDate = new Date();

            activeFromDate.setHours(startTimeCfg.hours, startTimeCfg.min, startTimeCfg.sec, startTimeCfg.ms);
            activeToDate.setHours(stopTimeCfg.hours, stopTimeCfg.min, stopTimeCfg.sec, stopTimeCfg.ms);

            /**
             * Random number generator (inclusive).
             */
            const getRandomInteger = (min: number, max: number) => {
                return max - min <= 1 ? max : Math.floor(Math.random() * (max - min + 1)) + min;
            };

            /**
             * Produce random date in a range of dates.
             */
            const getRandomDate = (startDate: Date, endDate: Date): Date => {
                const startTimestamp = startDate.getTime();
                const endTimestamp = endDate.getTime();
                const randomTimestamp = getRandomInteger(startTimestamp, endTimestamp);
                const date = new Date(randomTimestamp);

                date.setMilliseconds(999);
                return date;
            };

            /**
             * Creates an array of dates starting with {@link activeFromDate} and ending by {@link activeToDate},
             * where between any each two dates interval equal to hour/runsPerHour.
             * So in fact it is runs schedule.
             */
            const splitInterval = (startDate: Date, endDate: Date, splitHourInto: number): Array<Date> => {
                const resultArray: Date[] = [];
                let currentDate = new Date(startDate);

                while (currentDate <= endDate) {
                    resultArray.push(new Date(currentDate));
                    currentDate.setSeconds(currentDate.getSeconds() + (60 * 60) / splitHourInto);
                }

                return resultArray;
            };

            /**
             * Generates time that always in between
             * {@link activeFromDate} and {@link activeToDate}
             */
            const getNextRunDate = (): Date | void => {
                let runDate: Date;
                const now = new Date();
                const stepDates = splitInterval(activeFromDate, activeToDate, runsPerHour);

                /**
                 * If {@link now} earlier then {@link activeFromDate} or
                 * between {@link activeFromDate} - {@link activeToDate}
                 * {@link runDate} will be calculated to a closest possible
                 * interval.
                 */
                for (let i = 1; i <= stepDates.length; i++) {
                    const stepDate = stepDates[i];

                    if (stepDate >= now) {
                        if (stepDates[i + 1]) {
                            runDate = getRandomDate(stepDate, stepDates[i + 1]);
                        } else {
                            runDate = getRandomDate(stepDates[0], stepDates[1]);
                            runDate.setHours(runDate.getHours() + 24);
                        }
                        break;
                    }
                }

                /**
                 * Means that {@link now} is later then {@link activeToDate}
                 */
                if (typeof runDate === undefined) {
                    runDate = getRandomDate(stepDates[0], stepDates[1]);
                    runDate.setHours(runDate.getHours() + 24);
                }

                /**
                 * If {@link runDate} is later then {@link now} due to
                 * calculation timing for high looaded cron then set it to {@link now}.
                 */
                if (runDate < new Date()) {
                    runDate = new Date();
                    runDate.setSeconds(runDate.getSeconds() + 1);
                }

                /**
                 * Round time miliseconds to closest second up.
                 */
                if (runDate.getMilliseconds() !== 0) {
                    runDate.setTime(runDate.getTime() + (1000 - runDate.getMilliseconds()));
                }

                return runDate;
            };

            return getNextRunDate();
        },
    },
};

export { ConfigExample };
