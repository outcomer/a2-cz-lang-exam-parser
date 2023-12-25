import { PageInterface } from '../types/app';
import { ConfigInterface } from '../types/config';
import { Tracer } from '../core/tracer';
/**
 * Dispatches requests for any captcha resolving.
 */
export declare class Dispatcher {
    private _options;
    private _tracer;
    /**
     * Constructor.
     */
    constructor(launchOptions: ConfigInterface['toCaptcha'], tracer: Tracer);
    /**
     * Gettre for tracer.
     */
    get tracer(): Tracer;
    /**
     * Capthca resolving trigger.
     */
    dispatch(page: PageInterface): Promise<void>;
    /**
     * Currently validates whether 2captcha
     * service has positive balance.
     */
    private checkRequirements;
    /**
     * Balance getter from remote.
     */
    getBalance(): Promise<number>;
    /**
     * Adds extrac info into tracer.
     */
    private traceBalance;
}
