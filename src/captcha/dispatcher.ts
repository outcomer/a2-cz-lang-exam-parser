import { PageInterface } from '../types/app';
import { ConfigInterface } from '../types/config';
import { ExceptionBalanceCritical } from '../exception/error-balance-critical';
import { ResolverCFTurnstile } from './resolver-cloudflare-turnstile';
import { ResolverRecaptcha } from './resolver-recaptcha';
import { Tracer } from '../core/tracer';
import axios from 'axios';

/**
 * Dispatches requests for any captcha resolving.
 */
export class Dispatcher {
    private _options: ConfigInterface['toCaptcha'];
    private _tracer: Tracer;

    /**
     * Constructor. 
     */
    public constructor(launchOptions: ConfigInterface['toCaptcha'], tracer: Tracer) {
        this._options = launchOptions;
        this._tracer = tracer;
    }

    /**
     * Gettre for tracer.
     */
    public get tracer() {
        return this._tracer;
    }

    /**
     * Capthca resolving trigger.
     */
    public async dispatch(page: PageInterface): Promise<void> {
        const balance = await this.getBalance();
        this.checkRequirements(balance);

        const resolvers = [
            new ResolverCFTurnstile(this._options.secretKey, page, this._tracer).resolve(),
            new ResolverRecaptcha(this._options.secretKey, page, this._tracer).resolve(),
        ];

        await Promise.all(resolvers);
        await this.traceBalance(balance);
    }

    /**
     * Currently validates whether 2captcha 
     * service has positive balance.
     */
    private checkRequirements(balance: number) {
        if (balance > this._options.lowBalance.threshold.critical) {
            return;
        }
        const msg = this._options.lowBalance.message.replaceAll('%balance%', balance.toString());
        throw new ExceptionBalanceCritical(msg);
    }

    /**
     * Balance getter from remote.
     */
    public async getBalance(): Promise<number> {
        try {
            const response = await axios({
                method: 'post',
                url: 'https://api.2captcha.com/getBalance',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    clientKey: this._options.secretKey,
                },
            });

            return response.data.balance;
        } catch (error: any) {
            const msg = `AXIOS response: ${JSON.stringify(error.response.data, null, 2)}`;
            throw new Error(msg);
        }
    }

    /**
     * Adds extrac info into tracer.
     */
    private async traceBalance(balance: number): Promise<void> {
        try {
            // Positive balance - can work.
            if (balance > this._options.lowBalance.threshold.warn) {
                this._tracer.addTrace('dev', `ToCaptcha balance: $${balance.toFixed(4)}`);
                return;
            }

            // Still positive, but lower then Warn level.
            const msg = this._options.lowBalance.message.replaceAll('%balance%', balance.toString());
            this._tracer.addTrace('dev', msg);
            this._tracer.addTrace('live', msg);
        } catch (error: any) {
            const msg = `AXIOS response: ${JSON.stringify(error.response.data, null, 2)}`;
            throw new Error(msg);
        }
    }
}
