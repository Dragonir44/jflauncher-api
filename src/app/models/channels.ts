import Version from "./versions";

export default interface Channel {
  name: string;
  versions: Version[];
}