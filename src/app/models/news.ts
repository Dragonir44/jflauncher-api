import { ObjectId } from "mongodb";

export default interface News {
  _id: ObjectId;
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