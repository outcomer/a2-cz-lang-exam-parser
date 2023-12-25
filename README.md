
# What is this project for?

In the Czech Republic, to obtain permanent residency status, you must pass a language exam at the A2 level. For exam registration, you use the [website](https://cestina-pro-cizince.cz/trvaly-pobyt/a2/online-prihlaska/). At the time of writing this text (19th Nov 2023), the situation in the country is as follows: there are no available slots for registration. There haven't been any for the past six months. The authorities are aware of this and pretend to take measures, but, in my perception, they don't seem to be trying to improve the situation. There is an explanation for this, but it's not the place for it here.

So, to register for the exam, you must endlessly check the information on the website in the hope of finding an available slot. The likelihood of this is approaching zero. I myself fell into this trap. You want to apply for permanent residence, you know the language, but you can't prove it because... you can't take the exam.

It's clear that there's a need to somehow automate the process of tracking available slots, but there's no way to constantly check the website every X minutes.

My attempt to find a ready-made solution led me to two projects on GitHub. One is written in Python, and the other is in PHP. Thanks to the authors. However, at the moment, both are unable to provide autonomous operation for one reason: the exam registration website implements Google Captcha to protect against various automations. As you can see, this repository is a fork of one of the packages I found [swayoleg](https://github.com/swayoleg/mvcr-trvaly-pobyt-lang-exam-online-prihlaska-notify), that implements the logic of @swayoleg project as a basis, but the code is completely rewritten with JavaScript. @swayoleg, thank you for your work!

p.s. this is my first something on JavaScript. And on TypeScript... and with Nodejs.. All that stuff for the first time.

# How their defense works?

Logic of the defenders stands on idea that the target container is not loaded into the body of the page by default, but captcha appears. Once human resolved captcha, pages being reloaded, sending captcha's solution token to the site server along with all the cookies, including very important one - session PHP value (PHPSESSID). On server token is checked in the captcha service and if it is considered acceptable, then the PHP session is marked as valid and the next time the page is loaded, the target container is there. 

# What code do:

The code in this repository is written in JavaScript and performs the following operations:

- accesses the website for exam registration;
- solves the captcha if necessary;
- searches for the required information on the page;
- sends the results of the work in various ways (Telegram / Email);

# Usage - Option 1
Use this repo in your Nodejs app.
1. Do `npm install github:outcomer/a2-cz-lang-exam-parser#main`;
2. Create some file, that you will invoke on your own later with content:

```ts
import { Parser } from 'a2-cz-lang-exam-parser';

const config = {...};
const parcer = new Parser(config); // look below on what parser expects.

(async () => {
    // Run parsing once, wait execution and stop it.
    (await parcer.runOnce()).stop();
})();

(async () => {
    // Run cron multiple times.
    await parcer.runCron();
    await parcer.runCron();
})();
```
For better understanding on how `const config` might looks like see config example [Here](src/config-example.ts).

# Usage - Option 2
You are joining an existing telegram channel **"Trvaly pobyt language exam"** to which this App bot reports.

Use [Invite link](https://t.me/+4wvm-8Fm2Bs2MzRi) or this QR Code

[<img src="./src/views/channel-invite-code.png" width="250" />](./src/views/channel-invite-code.png)


# Life is life...

I'm not the guy who figured out how to solve captchas automatically. The [2captcha.com](https://2captcha.com) service is used for this. It's cheap, but not free.

<a href="https://www.buymeacoffee.com/773021792"><img src="https://img.buymeacoffee.com/button-api/?text=Would You mind to thank me?&emoji=🍺&slug=773021792&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
