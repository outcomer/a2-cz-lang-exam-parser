"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageParser = void 0;
const slot_1 = require("../core/slot");
/**
 * Parse page content.
 */
class PageParser {
    /**
     * Try to find HTML with exams slots.
     */
    static async slots(page, selector, noTermsText) {
        let nodes;
        let targetContainer;
        const content = await page.content();
        const callback = (window, targetContainer, noTermsText) => {
            const schools = [];
            const links = targetContainer.querySelectorAll(`a.btn`);
            const filteredLinks = Array.from(links).filter((link) => !noTermsText.includes(link.textContent.trim()));
            filteredLinks.forEach((link) => {
                const closestTownEl = link.closest('.row').querySelector('.town');
                const cityValue = Array.from(closestTownEl.childNodes)
                    .filter((node) => node.nodeType === window.Node.TEXT_NODE && node.textContent.trim() !== '')
                    .map((node) => node.textContent.trim())
                    .join(' ');
                const btnValue = link.textContent.replace(/^[ \t\n\r\u3164]+|[ \t\n\r\u3164]+$/g, '');
                const btnHref = link instanceof window.HTMLAnchorElement ? link.href : false;
                schools.push([cityValue, btnValue, btnHref]);
            });
            return schools;
        };
        const document = content.window.document;
        targetContainer = document.querySelector(selector);
        if ('undefined' === typeof targetContainer) {
            throw new Error(`Can not find target container ${selector} in page.`);
        }
        if (targetContainer instanceof content.window.Element) {
            nodes = callback(content.window, targetContainer, noTermsText);
        }
        return nodes.map((node) => new slot_1.Slot(node[0], node[1], node[2]));
    }
}
exports.PageParser = PageParser;
