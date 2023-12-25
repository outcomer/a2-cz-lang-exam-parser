import { PageInterface } from '../types/app';
import { Solver } from '2captcha-ts';
import { Tracer } from '../core/tracer';

export class ResolverCFTurnstile {
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
        const processor = this._page.captchaCFTurnstileProcessor();
        const captchaConfig = await processor.getConfig();

        if (typeof captchaConfig === 'undefined') {
            this._tracer.addTrace('dev', `Cloudflare Turnstile: none`);
            return;
        }

        const token = await this.solveCaptcha(this._page.url(), captchaConfig.sitekey);

        this._tracer.addTrace('dev', 'Cloudflare Turnstile: Solved.');
        await processor.submit(token, captchaConfig.verifyFn);
    }

    /**
     * Resolves captcha and gets solution token.
     */
    private async solveCaptcha(url: string, sitekey: string): Promise<string> {
        const result = await this._solver.cloudflareTurnstile({
            pageurl: url,
            sitekey: sitekey,
        });

        return result.data;
    }
}
