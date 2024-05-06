import { MongoClient, Collection, Db, MongoServerError } from "mongodb";
import dotenv from "dotenv";
import News from "../models/news";
import Channel from "../models/channels";

dotenv.config();

const dbName = "jfl"

export const collections: {channel?: Collection<Channel>, news?: Collection<News>} = {};

export const connectToDb = async () => {
    try {
        const client = new MongoClient(process.env.MONGO_URI as string);

        await client.connect();

        const db = client.db(dbName);

        await applySchemaValidationForChannel(db);
        await applySchemaValidationForNews(db);

        collections.channel = db.collection<Channel>("channel");
        collections.news = db.collection<News>("news");

        console.log(
            `Successfully connected to the database : ${db.databaseName} and collections : ${Object.keys(collections).join(", ")}`
        )
    }
    catch (error) {
        console.error(`Error while connecting to the database : ${error}`);
    }
}

const applySchemaValidationForChannel = async (db: Db) => {
    const jsonSchema = {
        bsonType: ["object"],
        required: ["name", "versions"],
        properties: {
            _id: {},
            name: {
                bsonType: ["string"],
                description: "Channel name"
            },
            versions: {
                bsonType: ["array"],
                description: "List of versions",
                items: {
                    bsonType: ["object"],
                    required: ["version", "changelog", "path", "forgeVersion"],
                    properties: {
                        version: {
                            bsonType: ["string"],
                            description: "Version number"
                        },
                        changelog: {
                            bsonType: ["object"],
                            required: ["en", "fr"],
                            properties: {
                                en: {
                                    bsonType: ["string"],
                                    description: "Changelog in English"
                                },
                                fr: {
                                    bsonType: ["string"],
                                    description: "Changelog in French"
                                }
                            }
                        },
                        path: {
                            bsonType: ["string"],
                            description: "Path to the version file"
                        },
                        forgeVersion: {
                            bsonType: ["string"],
                            description: "Forge version"
                        }
                    }
                }
            }
        }
    }

    await db.command({
        collMod: "channel",
        validator: {
            $jsonSchema: jsonSchema
        }
    }).catch(async (error: MongoServerError) => {
        if (error.codeName === "NamespaceNotFound") {
            await db.createCollection("channel", {validator: {$jsonSchema: jsonSchema}})
        }
    })
}

const applySchemaValidationForNews = async (db: Db) => {
    const jsonSchema = {
        bsonType: ["object"],
        required: ["_id", "lang", "date"],
        properties: {
            _id: {},
            lang: {
                bsonType: ["object"],
                required: ["en", "fr"],
                properties: {
                    en: {
                        bsonType: ["object"],
                        required: ["title", "content"],
                        description: "Content in English",
                        properties: {
                            title: {
                                bsonType: ["string"],
                                description: "Title in English"
                            },
                            content: {
                                bsonType: ["string"],
                                description: "Content in English"
                            }
                        }
                    },
                    fr: {
                        bsonType: ["object"],
                        required: ["title", "content"],
                        description: "Content in French",
                        properties: {
                            title: {
                                bsonType: ["string"],
                                description: "Title in French"
                            },
                            content: {
                                bsonType: ["string"],
                                description: "Content in French"
                            }
                        }
                    }
                }
            },
            date: {
                bsonType: ["date"],
                description: "Date of the news"
            }
        }
    }

    await db.command({
        collMod: "news",
        validator: {
            $jsonSchema: jsonSchema
        }
    }).catch(async (error: MongoServerError) => {
        if (error.codeName === "NamespaceNotFound") {
            await db.createCollection("news", {validator: {$jsonSchema: jsonSchema}})
        }
    })
}