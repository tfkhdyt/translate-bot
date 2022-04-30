import { Telegraf } from 'telegraf';
import { ParseModeOutput } from './types/bot';

export class Bot {
  bot: Telegraf;

  constructor(token: string) {
    this.bot = new Telegraf(token);
  }

  parseMode(mode: string): Promise<ParseModeOutput> {
    return new Promise((resolve, reject) => {
      const modeArr = mode.split('->');

      if (modeArr.length !== 2) reject('*Mode* format is not valid');

      const _from = modeArr[0];
      const to = modeArr[1];

      return resolve({ _from, to });
    });
  }
}
