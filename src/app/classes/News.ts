import { ObjectId } from 'mongodb'

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
    _id: ObjectId
    lang: Lang
    date: Date

    constructor(_id: ObjectId, lang: Lang, date: Date) {
        this._id = _id
        this.lang = lang
        this.date = date
    }
}