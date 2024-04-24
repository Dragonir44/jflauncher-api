import fs from "fs";
import path from "path";
import moment from "moment";

import { News, Lang, NewsContent } from "../classes/News";

const newsPath = "repo/news"
const news: News[] = []

export const initNews = async () => {

    if (!fs.existsSync(newsPath))
        fs.mkdirSync(newsPath)

    const newsFiles = fs.readdirSync(newsPath)
    newsFiles.forEach(file => {
        const newsFile = fs.readFileSync(path.join(newsPath, file), "utf-8")
        const newsData = JSON.parse(newsFile)
        const newsContent = new NewsContent(newsData.lang.fr.title, newsData.lang.fr.content)
        const newsLang = new Lang(newsContent, newsContent)
        const newsItem = new News(newsLang, new Date(newsData.date))
        news.push(newsItem)
    })
    console.log(`News loaded: ${news.length}`)
}

export const getNews = () => {
    return news
}

export const getNewsById = (id: number) => {
    return news[id]
}

export const addNews = (newsItem: News) => {
    // get date of the day in the YYYY-MM-DD format
    const date = new Date()

    const newsFile = {
        lang: {
            fr: {
                title: newsItem.lang.fr.title,
                content: newsItem.lang.fr.content
            },
            en: {
                title: newsItem.lang.en.title,
                content: newsItem.lang.en.content
            }
        },
        date: newsItem.date || moment(date).format("YYYY-MM-DD")
    }
    const newsFileName = `news-${news.length}.json`
    fs.writeFileSync(path.join(newsPath, newsFileName), JSON.stringify(newsFile))
    news.push(newsItem)
    return newsItem
}

export const deleteNews = (id: number) => {
    fs.unlinkSync(path.join(newsPath, `news-${id}.json`))
    news.splice(id, 1)
}

export const updateNews = (id: number, newsItem: News) => {
    const newsFile = {
        lang: {
            fr: {
                title: newsItem.lang.fr.title,
                content: newsItem.lang.fr.content
            },
            en: {
                title: newsItem.lang.en.title,
                content: newsItem.lang.en.content
            }
        },
        date: newsItem.date
    }
    fs.writeFileSync(path.join(newsPath, `news-${id}.json`), JSON.stringify(newsFile))
    news[id] = newsItem
}
