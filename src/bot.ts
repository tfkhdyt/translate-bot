import { Context, Markup, Telegraf } from 'telegraf';
import { langs } from './language';
import { ParseModeOutput } from './types/bot';
import { Language } from './types/translator';

export class Bot {
  bot: Telegraf;

  constructor(token: string) {
    this.bot = new Telegraf(token);
  }

  verifyLang(lang: string) {
    const language = langs[lang as keyof Language];
    return Boolean(language);
  }

  parseMode(mode: string): Promise<ParseModeOutput> {
    return new Promise((resolve, reject) => {
      const modeArr = mode.split('->');
      let _from: string;
      let to: string;

      // if (modeArr.length !== 2) reject('*Mode* format is not valid');

      if (modeArr.length === 1) {
        if (!this.verifyLang(modeArr[0]))
          reject(`*${modeArr[0]}* is not a valid language`);

        _from = 'auto';
        to = modeArr[0];
      } else {
        const errors: string[] = [];
        if (!this.verifyLang(modeArr[0]))
          errors.push(`*${modeArr[0]}* is not a valid language`);
        if (!this.verifyLang(modeArr[1])) {
          errors.push(`*${modeArr[1]}* is not a valid language`);
          reject(errors);
        }

        _from = modeArr[0];
        to = modeArr[1];
      }

      return resolve({ _from, to });
    });
  }

  sendStartMessage(ctx: Context) {
    ctx.replyWithMarkdown(
      `Welcome to *Google Translate Bot*
This bot will translate any text that you send

Environment : Node.js
Language : TypeScript
Framework : Telegraf
Developer : @tfkhdyt
`,
      {
        ...Markup.inlineKeyboard([
          {
            text: 'Source Code',
            url: 'https://github.com/tfkhdyt',
          },
        ]),
      }
    );
  }
}
