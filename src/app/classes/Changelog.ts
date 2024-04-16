export class Changelog implements Iterable<string> {
    protected en: string;
    protected fr: string;

    constructor(en: string, fr: string) {
        this.en = en;
        this.fr = fr;
    }

    get En() {
        return this.en;
    }

    get Fr() {
        return this.fr;
    }

    set En(en: string) {
        this.en = en;
    }

    set Fr(fr: string) {
        this.fr = fr;
    }

    *[Symbol.iterator]() {
        yield this.en;
        yield this.fr;
    }
}