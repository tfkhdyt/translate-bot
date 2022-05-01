import 'dotenv/config';
import { ExtraEditMessageText } from 'telegraf/typings/telegram-types';

import { Bot } from './bot';
import { Translator } from './translator';

const BOT_TOKEN = process.env.BOT_TOKEN as string;
const NODE_ENV = process.env.NODE_ENV as string;
const BOT_DOMAIN = process.env.BOT_DOMAIN as string;
const PORT = Number(process.env.PORT) || 4000;

const bot = new Bot(BOT_TOKEN);
const telegraf = bot.bot;

telegraf.start((ctx) => bot.sendStartMessage(ctx));

telegraf.help((ctx) => bot.sendHelpMessage(ctx));

telegraf.command('languages', (ctx) => {
  const { languages, options } = bot.showLanguages(1);
  ctx.reply(languages, options);
});

telegraf.on('text', async (ctx) => {
  const args = ctx.message.text;
  const mode = args.split(' ')[0].toLowerCase();

  const text = args.split(' ').slice(1).join(' ');

  if (!text || text.length === 0)
    return ctx.replyWithMarkdown("*Text* shouldn't be empty");

  let _from: string | undefined;
  let to = '';

  try {
    const modes = await bot.parseMode(mode);
    _from = modes?._from;
    to = modes.to;
  } catch (err) {
    if (Array.isArray(err)) {
      const errors = err.map((value) => `- ${value}`).join('\n');
      return ctx.replyWithMarkdown(errors as string);
    }
    return ctx.replyWithMarkdown(err as string);
  }

  const translator = new Translator({ _from, to });

  try {
    const result = await translator.translate(text);
    // console.log(result);
    const fullNameFromLanguage = translator.parseLanguageName(
      result.from.language.iso
    );
    const fullNameToLanguage = translator.parseLanguageName(to);
    const isDidYouMean = result.from.text.didYouMean;
    const didYouMeanText = result.from.text.value;
    const translatedText = result.text;
    const separator = (() => {
      let length: number;

      if (text.length > translatedText.length) length = text.length;
      else length = translatedText.length;

      let line = '';

      for (let i = 0; i < length + length * 0.5; i++) {
        line += '-';
      }

      return line.slice(0, 60);
    })();
    const pronunciation = result.pronunciation;

    ctx.replyWithMarkdown(
      `*${fullNameFromLanguage}${result.from.language.didYouMean ? '?' : ''}* ${
        _from === 'auto' ? '- Detected' : ''
      }

\`${text}\` ${isDidYouMean ? `\n(Did you mean: \`${didYouMeanText}\`)` : ''} 
${separator}
*${fullNameToLanguage}*

\`${result.text}\`
${pronunciation ? `🗣️: \`${pronunciation}\`` : ''}
`
    );
  } catch (err) {
    console.error(err);
  }
});

telegraf.on('callback_query', (ctx) => {
  const query = ctx.callbackQuery?.data;
  const { languages, options } = bot.showLanguages(Number(query));
  ctx.editMessageText(languages, options as ExtraEditMessageText);
  // bot.showLanguagesPage(ctx, Number(query));
  // ctx.deleteMessage(ctx.callbackQuery.message?.message_id);
  // console.log(query);
});

// launcher
if (NODE_ENV === 'development') {
  telegraf.launch().then(() => console.log('Bot is running in development'));
} else {
  telegraf.telegram.setWebhook(`${BOT_DOMAIN}/bot${BOT_TOKEN}`);
  telegraf
    .launch({
      webhook: {
        hookPath: `/bot${BOT_TOKEN}`,
        port: PORT,
      },
    })
    .then(() => console.log('Bot is running in production'));
}

// Enable graceful stop
process.once('SIGINT', () => telegraf.stop('SIGINT'));
process.once('SIGTERM', () => telegraf.stop('SIGTERM'));
