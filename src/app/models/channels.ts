import { ObjectId } from "mongodb";
import Version from "./versions";

export default interface Channel {
  _id: ObjectId;
  name: string;
  versions: Version[];
}