import express from 'express';
import dotenv from 'dotenv';

dotenv.config()
const router = express.Router();

router.route('/')
    .get((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            res.send('GET /channel');
        }
        else {
            res.status(403).send('Forbidden');
        }
    })

router.route('/:channel')
    .get((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            res.send(`GET /channel/${req.params.channel}`);
        }
        else {
            res.status(403).send('Forbidden');
        }
    })

router.route('/:channel/:version')
    .get((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            res.send(`GET /channel/${req.params.channel}/${req.params.version}`);
        }
        else {
            res.status(403).send('Forbidden');
        }
    })

router.route('/:channel/:version/download')
    .get((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            res.send(`GET /channel/${req.params.channel}/${req.params.version}/download`);
        }
        else {
            res.status(403).send('Forbidden');
        }
    })

export default router;