export class Version {
    protected version: string;
    protected changelog: string;
    protected path: string;
    protected forgeVersion: string;
    
    constructor(version: string, changelog: string, path: string, forgeVersion?: string) {
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
}