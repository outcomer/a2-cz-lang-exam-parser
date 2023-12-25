import { Language } from './enum';

export interface SlotPageOptionsInterface {
    /**
     * Site store selected language in cookies.
     * So even if url includes language active language
     * will be setted up by this value.
     */
    language: Language;

    /**
     * Well, this is target page and our headache.
     */
    url: string;

    /**
     * Text on button if slots exists (for reference).
     */
    termsText: string[];

    /**
     * Text on button if slots does not exists.
     */
    noTermsText: string[];

    /**
     * HTML selector of DOM node that is contains
     * the list of schools.
     */
    targetContainerSelector: string;
}
