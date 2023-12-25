export interface ToCaptchaOptionsInterface {
    /**
     * Service responsible for captcha solving.
     */
    secretKey: string;

    /**
     * Due to this App totally depends on 2Captcha serveice
     * to resolve captchas you need to have positive balance
     * within your account. By this property you can specify
     * balance values(inclusive) that is assumed as important.
     * Once 'warn' value reached parsing will continue with
     * message. On 'critical' level parsing with stops and
     * message will be broadcasted as an error.
     */
    lowBalance: {
        threshold: {
            warn: number;
            critical: number;
        };
        message: string;
    };
}
