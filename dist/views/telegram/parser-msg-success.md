{{#if remind}}
\!\!\! Reminder
—
{{/if}}
{{#if slots.length}}
*New Exam place\(s\) Exists\!*
Whole list are [Here]({{{url}}})\.
—
Vacant slots:
{{#each slots}}
• {{{this.toTelegramMarkdownString}}}
{{/each}}

{{else}}
*No* free exam slots found\. Alas\.
{{/if}}
{{#if extra.length}}
—
*Trace data:*
{{#each extra}}
• {{{this}}}
{{/each}}
{{/if}}
