import translate from '@vitalets/google-translate-api';
import { langs } from './language';
import { ParseModeOutput } from './types/bot';
import { Language, ITranslateResponse } from './types/translator';

export class Translator {
  constructor(private options?: ParseModeOutput) {}

  translate(text: string) {
    // console.log(this.options);
    return new Promise<ITranslateResponse>((resolve, reject) => {
      (async () => {
        const res = await translate(text, {
          from: this.options?._from,
          to: this.options?.to,
        }).catch((err) => reject(err));
        resolve(res as ITranslateResponse);
      })();
    });
  }

  parseLanguageName(lang: string) {
    return langs[lang as keyof Language];
  }

  verifyLang(lang: string) {
    const language = langs[lang as keyof Language];
    return Boolean(language);
  }
}
