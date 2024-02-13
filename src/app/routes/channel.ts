import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

import {init as channel, getChannels, getChannel, getVersion, getDownload} from '../models/channel';

channel()

dotenv.config()
const router = express.Router();

router.route('/')
    .get((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            res.json(getChannels());
        }
        else {
            res.status(403).send('Forbidden');
        }
    })

router.route('/:channel')
    .get((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            res.json(getChannel(req.params.channel));
        }
        else {
            res.status(403).send('Forbidden');
        }
    })

router.route('/:channel/:version')
    .get((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            res.json(getVersion(req.params.channel, req.params.version));
        }
        else {
            res.status(403).send('Forbidden');
        }
    })

router.route('/:channel/:version/download')
    .get((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            res.download(path.join(getDownload(req.params.channel, req.params.version)));
        }
        else {
            res.status(403).send('Forbidden');
        }
    })

export default router;