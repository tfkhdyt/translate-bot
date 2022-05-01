import { Context, Markup, Telegraf } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { langs } from './language';
import { Translator } from './translator';
import { ParseModeOutput } from './types/bot';

export class Bot {
  bot: Telegraf;
  private translator: Translator;

  constructor(token: string) {
    this.bot = new Telegraf(token);
    this.translator = new Translator();
  }

  parseMode(mode: string): Promise<ParseModeOutput> {
    return new Promise((resolve, reject) => {
      const modeArr = mode.split('->');
      let _from: string;
      let to: string;

      // if (modeArr.length !== 2) reject('*Mode* format is not valid');

      if (modeArr.length === 1) {
        if (!this.translator.verifyLang(modeArr[0]))
          reject(`*${modeArr[0]}* is not a valid language`);

        _from = 'auto';
        to = modeArr[0];
      } else {
        const errors: string[] = [];
        if (!this.translator.verifyLang(modeArr[0]))
          errors.push(`*${modeArr[0]}* is not a valid language`);
        if (!this.translator.verifyLang(modeArr[1])) {
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

Environment: Node.js
Language: TypeScript
Framework: Telegraf
Developer: @tfkhdyt
`,
      {
        ...Markup.inlineKeyboard([
          {
            text: 'Source Code',
            url: 'https://github.com/tfkhdyt/translate-bot',
          },
        ]),
      }
    );
  }

  sendHelpMessage(ctx: Context) {
    ctx.replyWithMarkdown(
      `*Usage:*
\`<language code> <text>\`

*Example:*
*Translate text in any languages to Indonesian:*
\`id programming\`

*Translate text from Indonesian to English:*
\`id->en halo dunia\`

Type \`/languages\` to see list of available languages
`
    );
  }

  countPages(currentPage: number, numberOfPages: number) {
    const array = [];
    for (let i = 0; i < numberOfPages; i++) {
      array.push(i + 1);
    }
    return array.filter((value) => value !== currentPage);
  }

  getPagination(currentPage: number, numberOfPages: number) {
    const pages = this.countPages(currentPage, numberOfPages);

    const pagesButton = pages.map((value) => {
      const button: InlineKeyboardButton = {
        text: String(value),
        callback_data: String(value),
      };
      return button;
    });

    console.log(pagesButton);

    const prevButton: InlineKeyboardButton = {
      text: '« Prev page',
      callback_data: String(currentPage - 1),
    };
    const nextButton: InlineKeyboardButton = {
      text: 'Next page »',
      callback_data: String(currentPage + 1),
    };

    // console.log('current:', currentPage);
    // console.log('total:', numberOfPages);

    if (currentPage === 1)
      return Markup.inlineKeyboard([pagesButton, [nextButton]]);
    if (currentPage === numberOfPages)
      return Markup.inlineKeyboard([pagesButton, [prevButton]]);

    return Markup.inlineKeyboard([pagesButton, [prevButton, nextButton]]);
  }

  showLanguages(currentPage: number) {
    const numberOfLangs = Object.keys(langs).length;
    const numberOfLangPerPage = 25;
    const numberOfPages = Math.ceil(numberOfLangs / numberOfLangPerPage);

    let languages = '';
    Object.entries(langs).forEach(([key, value], index) => {
      if (
        index + 1 > (currentPage - 1) * numberOfLangPerPage &&
        index + 1 <= currentPage * numberOfLangPerPage
      ) {
        languages += `*${index + 1}*. \`${key}\`: ${value}\n`;
      }
    });
    const options: ExtraReplyMessage = {
      ...this.getPagination(currentPage, numberOfPages),
      parse_mode: 'Markdown',
    };

    return {
      languages,
      options,
    };
  }
}
