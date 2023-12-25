"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolverRecaptcha = void 0;
const _2captcha_ts_1 = require("2captcha-ts");
class ResolverRecaptcha {
    _page;
    _tracer;
    _solver;
    /**
     * Constructor.
     */
    constructor(toCaptchaSecretKey, page, tracer) {
        this._page = page;
        this._tracer = tracer;
        this._solver = new _2captcha_ts_1.Solver(toCaptchaSecretKey);
    }
    /**
     * Captcha resolver.
     */
    async resolve() {
        const processor = this._page.captchaReCaptchaProcessor();
        const captchaConfig = await processor.getConfig();
        if (typeof captchaConfig === 'undefined') {
            this._tracer.addTrace('dev', `Recaptcha V2/3: none`);
            return;
        }
        const token = await this.solveCaptcha(this._page.url(), captchaConfig.sitekey);
        this._tracer.addTrace('dev', 'Recaptcha V2/3: Solved.');
        await processor.submit(token, captchaConfig.verifyFn);
    }
    /**
     * Resolves captcha and gets solution token.
     */
    async solveCaptcha(url, sitekey) {
        const result = await this._solver.recaptcha({
            pageurl: url,
            googlekey: sitekey,
        });
        return result.data;
    }
}
exports.ResolverRecaptcha = ResolverRecaptcha;
