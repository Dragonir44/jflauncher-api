import express from 'express';
import dotenv from 'dotenv';

import { deleteChannel, deleteVersion } from '../models/channel';

dotenv.config()
const router = express.Router();

router.route('/deletechannel/:channel')
    .delete((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            res.json(deleteChannel(req.params.channel));
        }
        else {
            res.status(403).send('Forbidden');
        }
    })

router.route('/deleteversion/:channel/:version')
    .delete((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            res.json(deleteVersion(req.params.channel, req.params.version));
        }
        else {
            res.status(403).send('Forbidden');
        }
    })

export default router;