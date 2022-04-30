import 'dotenv/config';

import { Bot } from './bot';
import { Translator } from './translator';

const BOT_TOKEN = process.env.BOT_TOKEN as string;
const bot = new Bot(BOT_TOKEN);
const telegraf = bot.bot;

telegraf.on('text', async (ctx) => {
  const args = ctx.message.text;
  const mode = args.split(' ')[0];

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
