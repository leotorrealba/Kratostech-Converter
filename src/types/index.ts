export interface Translations {
  title: string;
  selectImage: string;
  convert: string;
  converting: string;
  downloadConverted: string;
  maxFileSize: string;
  selectPdf: string;
  convertToPdf: string;
  selectWord: string;
  convertToWord: string;
}

export interface LocaleTranslations {
  en: Translations;
  es: Translations;
}

export interface CustomPageProps {
  locale: string;
  setLocale: (locale: string) => void;
}