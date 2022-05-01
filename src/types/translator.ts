export interface IOptions {
  from?: string;
  to?: string;
  tld?: string;
  autoCorrect?: boolean;
}

export interface ITranslateLanguage {
  didYouMean: boolean;
  iso: string;
}

export interface ITranslateText {
  autoCorrected: boolean;
  value: string;
  didYouMean: boolean;
}

export interface ITranslateResponse {
  text: string;
  pronunciation: string;
  from: {
    language: ITranslateLanguage;
    text: ITranslateText;
  };
  raw: string;
}

export interface Language {
  [key: string]: string;
}
