import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import {
    getNews,
    getNewsById,
    addNews,
    deleteNews,
    updateNews
} from "../services/news.service";

dotenv.config();

const router = express.Router();

router.route("/")
    .get((req, res) => {
        if (req.headers['token'] == process.env.TOKEN) {
            res.json(getNews());
        }
        else {
            res.status(401).send();
        }
    })
    .post((req, res) => {
        res.json(addNews(req.body));
    });

router.route("/:id")
    .get((req, res) => {
        if (req.headers['token'] == process.env.TOKEN) {
            const news = getNewsById(Number(req.params.id));
            if (news) {
                res.json(news);
            }
            else {
                res.status(404).send();
            }
        }
        else {
            res.status(401).send();
        }
    })
    .delete((req, res) => {
        if (req.headers['token'] == process.env.TOKEN) {
            deleteNews(Number(req.params.id));
            res.status(204).send();
        }
        else {
            res.status(401).send();
        }
    })
    .put((req, res) => {
        if (req.headers['token'] == process.env.TOKEN) {
            updateNews(Number(req.params.id), req.body);
            res.status(204).send();
        }
        else {
            res.status(401).send();
        }
    });

export default router;