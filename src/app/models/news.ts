export default interface News {
  date: Date;
  lang: {
    en: {
      title: string;
      content: string;
    };
    fr: {
      title: string;
      content: string;
    };
  }
}