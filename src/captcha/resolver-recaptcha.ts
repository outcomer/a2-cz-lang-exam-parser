import { PageInterface } from '../types/app';
import { Solver } from '2captcha-ts';
import { Tracer } from '../core/tracer';

export class ResolverRecaptcha {
    private _page: PageInterface;
    private _tracer: Tracer;
    private _solver: Solver;

    /**
     * Constructor.
     */
    constructor(toCaptchaSecretKey: string, page: PageInterface, tracer: Tracer) {
        this._page = page;
        this._tracer = tracer;
        this._solver = new Solver(toCaptchaSecretKey);
    }

    /**
     * Captcha resolver.
     */
    public async resolve(): Promise<void> {
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
    private async solveCaptcha(url: string, sitekey: string): Promise<string> {
        const result = await this._solver.recaptcha({
            pageurl: url,
            googlekey: sitekey,
        });

        return result.data;
    }
}
