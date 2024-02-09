export class Version {
    protected version: string;
    protected changelog: string;
    
    constructor(version: string, changelog: string) {
        this.version = version;
        this.changelog = changelog;
    }

    get Version() {
        return this.version;
    }

    get Changelog() {
        return this.changelog;
    }
}