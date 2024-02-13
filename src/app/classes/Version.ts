export class Version {
    protected version: string;
    protected changelog: string;
    protected path: string;
    
    constructor(version: string, changelog: string, path: string) {
        this.version = version;
        this.changelog = changelog;
        this.path = path;
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