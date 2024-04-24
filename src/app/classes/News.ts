export class NewsContent {
    title: string
    content: string

    constructor(title: string, content: string) {
        this.title = title
        this.content = content
    }
}

export class Lang {
    fr: NewsContent
    en: NewsContent

    constructor(fr: NewsContent, en: NewsContent) {
        this.fr = fr
        this.en = en
    }
}

export class News {
    lang: Lang
    date: Date

    constructor(lang: Lang, date: Date) {
        this.lang = lang
        this.date = date
    }
}