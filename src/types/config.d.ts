import { ContextOptionsInterface } from './config-context';
import { CronInterface } from './config-cron';
import { NotificatorOptionsInterface } from './config-notifications';
import { SlotPageOptionsInterface } from './config-slot-page';
import { ToCaptchaOptionsInterface } from './config-to-captcha';

/**
 * Parser base config.
 */
export interface ConfigInterface {
    cron: CronInterface;
    notifications: NotificatorOptionsInterface;
    context: ContextOptionsInterface;
    toCaptcha: ToCaptchaOptionsInterface;
    slotPage: SlotPageOptionsInterface;
}
