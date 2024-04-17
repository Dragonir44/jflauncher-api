import Changelog from "./changelog";

export default interface Version {
    Version: string;
    Changelog: Changelog;
    Path: string;
    ForgeVersion: string;
}