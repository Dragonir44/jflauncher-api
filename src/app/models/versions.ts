import Changelog from "./changelog";

export default interface Version {
    version: string;
    changelog: Changelog;
    path: string;
    forgeVersion: string;
}