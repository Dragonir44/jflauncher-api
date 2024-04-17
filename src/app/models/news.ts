import { ObjectId } from "mongodb";
import Changelog from "./changelog";

export default interface News {
  _id: ObjectId;
  title: string;
  content: Changelog;
  date: Date;
}