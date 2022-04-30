export interface TranslateResult {
  text: string;
  from: {
    language: {
      didYouMean: boolean;
      iso: string;
    };
    text: {
      autoCorrected: boolean;
      value: string;
      didYouMean: boolean;
    };
  };
  raw: string;
}

export interface Language {
  [key: string]: string;
}
