import { ConfigInterface } from '../types/config';
import { Tracer } from './tracer';
/**
 * Runtime config container.
 */
export declare class LaunchOptions {
    private readonly _config;
    private readonly _tracer;
    /**
     * Constructor.
     */
    constructor(config: ConfigInterface);
    /**
     * Getter.
     */
    get toCatcha(): ConfigInterface['toCaptcha'];
    /**
     * Getter.
     */
    get notifications(): ConfigInterface['notifications'];
    /**
     * Getter.
     */
    get context(): ConfigInterface['context'];
    /**
     * Getter.
     */
    get slotPage(): ConfigInterface['slotPage'];
    /**
     * Getter.
     */
    get cron(): ConfigInterface['cron'];
    /**
     * Getter.
     */
    get tracer(): Tracer;
}
