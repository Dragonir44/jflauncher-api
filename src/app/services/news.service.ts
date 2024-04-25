import fs from "fs";
import path from "path";
import { ObjectId } from 'mongodb';

import { News, Lang, NewsContent } from "../classes/News";
import { collections } from './db.service';

const newsPath = "repo/news"

export const initNews = async () => {
    if (!fs.existsSync(newsPath))
        fs.mkdirSync(newsPath)

    const newsFiles = fs.readdirSync(newsPath)
    let news: News[] = []

    if (newsFiles.length > 0) {
        newsFiles.forEach(async (file) => {
            const newsItem = JSON.parse(fs.readFileSync(path.join(newsPath, file), 'utf-8'))
            const news: News = {
                _id: new ObjectId(),
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
                date: new Date(newsItem.date)
            } as News
            await collections.news?.insertOne(news)
            fs.unlinkSync(path.join(newsPath, file))
        })
    }

    news = await getNews()

    console.log(`News loaded: ${news.length}`)
}

export const getNews = async () => {
    return await (collections.news?.find().toArray()) as News[]
}

export const getNewsById = async (id: string) => {
    return await (collections.news?.findOne({ _id: new ObjectId(id) })) as News
}

export const addNews = async (newsItem: News) => {
    // get date of the day in the YYYY-MM-DD format
    const date = new Date()

    newsItem.date = newsItem.date ? new Date(newsItem.date) : date
    
    await collections.news?.insertOne(newsItem)

    return newsItem
}

export const deleteNews = async (id: string) => {
    await collections.news?.deleteOne({ _id: new ObjectId(id) })
}

export const updateNews = async (id: string, newsItem: News) => {
    newsItem.date = new Date(newsItem.date)
    await collections.news?.updateOne({ _id: new ObjectId(id) }, { $set: newsItem })
    return newsItem
}
