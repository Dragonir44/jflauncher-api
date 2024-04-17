import { Version } from './Version';

export class Channel {
    name: string;
    versions: Version[] = [];
    
    constructor(name: string) {
        this.name = name;
        this.versions = [];
    }

    get ChannelName() {
        return this.name;
    }

    get Version(): Version[] {
        return this.versions;
    }

    set Version(version: Version) {
        this.versions.push(version);
    }
}