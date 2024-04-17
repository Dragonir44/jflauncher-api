import { MongoClient, Collection, Db, MongoServerError } from "mongodb";
import dotenv from "dotenv";
import News from "../models/News";
import Channel from "../models/channels";

dotenv.config();

const dbName = "jfl"

export const collections: {channel?: Collection<Channel>, news?: Collection<News>} = {};

export const connectToDb = async () => {
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
                    required: ["Version", "Changelog", "Path", "ForgeVersion"],
                    properties: {
                        Version: {
                            bsonType: ["string"],
                            description: "Version number"
                        },
                        Changelog: {
                            bsonType: ["object"],
                            required: ["En", "Fr"],
                            properties: {
                                En: {
                                    bsonType: ["string"],
                                    description: "Changelog in English"
                                },
                                Fr: {
                                    bsonType: ["string"],
                                    description: "Changelog in French"
                                }
                            }
                        },
                        Path: {
                            bsonType: ["string"],
                            description: "Path to the version file"
                        },
                        ForgeVersion: {
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
        required: ["title", "content", "date"],
        properties: {
            _id: {},
            title: {
                bsonType: ["string"],
                description: "News title"
            },
            content: {
                bsonType: ["object"],
                required: ["en", "fr"],
                properties: {
                    En: {
                        bsonType: ["string"],
                        description: "Content in English"
                    },
                    Fr: {
                        bsonType: ["string"],
                        description: "Content in French"
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