import 'dotenv/config';

import { Bot } from './bot';
import { Translator } from './translator';

const BOT_TOKEN = process.env.BOT_TOKEN as string;
const bot = new Bot(BOT_TOKEN);
const telegraf = bot.bot;

telegraf.on('text', async (ctx) => {
  const args = ctx.message.text;
  const mode = args.split(' ')[0].toLowerCase();

  if (!mode.includes('->'))
    return ctx.replyWithMarkdown('*Mode* is not valid!');

  const text = args.split(' ').slice(1).join(' ');
  let _from: string | undefined;
  let to: string = '';

  try {
    const modes = await bot.parseMode(mode);
    _from = modes?._from;
    to = modes.to;
  } catch (err) {
    ctx.replyWithMarkdown(err as string);
  }

  const translator = new Translator({ _from, to });

  try {
    const result = await translator.translate(text);
    console.log(result);
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

      return line;
    })();

    ctx.replyWithMarkdown(
      `*${fullNameFromLanguage}* ${_from === 'auto' ? '- Detected' : ''}

\`${text}\` ${isDidYouMean ? `\n(Did you mean: \`${didYouMeanText}\`)` : ''}
${separator}
*${fullNameToLanguage}*

\`${result.text}\`\n`
    );
  } catch (err) {
    console.error(err);
  }
});

telegraf.launch().then(() => {
  console.log('Bot is running...');
});

// Enable graceful stop
process.once('SIGINT', () => telegraf.stop('SIGINT'));
process.once('SIGTERM', () => telegraf.stop('SIGTERM'));
