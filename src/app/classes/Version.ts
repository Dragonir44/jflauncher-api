import { Changelog } from "./Changelog";

export class Version {
    protected version: string;
    protected changelog: Changelog;
    protected path: string;
    protected forgeVersion: string;
    
    constructor(version: string, changelog: Changelog, path: string, forgeVersion?: string) {
        this.version = version;
        this.changelog = changelog;
        this.path = path;
        this.forgeVersion = forgeVersion || "none";
    }

    get Version() {
        return this.version;
    }
    
    get Changelog() {
        return this.changelog;
    }

    get Path() {
        return this.path;
    }

    get ForgeVersion() {
        return this.forgeVersion;
    }
}