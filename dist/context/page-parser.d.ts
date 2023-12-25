import { Slot } from '../core/slot';
import type { PageInterface } from '../types/app';
/**
 * Parse page content.
 */
export declare abstract class PageParser {
    /**
     * Try to find HTML with exams slots.
     */
    static slots(page: PageInterface, selector: string, noTermsText: string[]): Promise<Slot[]>;
}
