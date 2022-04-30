import translate from '@vitalets/google-translate-api';
import { langs } from './language';
import { ParseModeOutput } from './types/bot';
import { Language, TranslateResult } from './types/translator';

export class Translator {
  constructor(private options: ParseModeOutput) {}

  translate(text: string) {
    console.log(this.options);
    return new Promise<TranslateResult>(async (resolve, reject) => {
      const res = await translate(text, {
        from: this.options._from,
        to: this.options.to,
      }).catch((err) => reject(err));
      resolve(res as TranslateResult);
    });
  }

  parseLanguageName(lang: string) {
    return langs[lang as keyof Language];
  }
}
