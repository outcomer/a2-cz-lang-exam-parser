"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dispatcher = void 0;
const error_balance_critical_1 = require("../exception/error-balance-critical");
const resolver_cloudflare_turnstile_1 = require("./resolver-cloudflare-turnstile");
const resolver_recaptcha_1 = require("./resolver-recaptcha");
const axios_1 = require("axios");
/**
 * Dispatches requests for any captcha resolving.
 */
class Dispatcher {
    _options;
    _tracer;
    /**
     * Constructor.
     */
    constructor(launchOptions, tracer) {
        this._options = launchOptions;
        this._tracer = tracer;
    }
    /**
     * Gettre for tracer.
     */
    get tracer() {
        return this._tracer;
    }
    /**
     * Capthca resolving trigger.
     */
    async dispatch(page) {
        const balance = await this.getBalance();
        this.checkRequirements(balance);
        const resolvers = [
            new resolver_cloudflare_turnstile_1.ResolverCFTurnstile(this._options.secretKey, page, this._tracer).resolve(),
            new resolver_recaptcha_1.ResolverRecaptcha(this._options.secretKey, page, this._tracer).resolve(),
        ];
        await Promise.all(resolvers);
        await this.traceBalance(balance);
    }
    /**
     * Currently validates whether 2captcha
     * service has positive balance.
     */
    checkRequirements(balance) {
        if (balance > this._options.lowBalance.threshold.critical) {
            return;
        }
        const msg = this._options.lowBalance.message.replaceAll('%balance%', balance.toString());
        throw new error_balance_critical_1.ExceptionBalanceCritical(msg);
    }
    /**
     * Balance getter from remote.
     */
    async getBalance() {
        try {
            const response = await (0, axios_1.default)({
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
        }
        catch (error) {
            const msg = `AXIOS response: ${JSON.stringify(error.response.data, null, 2)}`;
            throw new Error(msg);
        }
    }
    /**
     * Adds extrac info into tracer.
     */
    async traceBalance(balance) {
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
        }
        catch (error) {
            const msg = `AXIOS response: ${JSON.stringify(error.response.data, null, 2)}`;
            throw new Error(msg);
        }
    }
}
exports.Dispatcher = Dispatcher;
