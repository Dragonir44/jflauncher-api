import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

import {
    init as channel, 
    getChannels, 
    getChannel, 
    createChannel, 
    updateChannel,
    deleteChannel,
    getVersion, 
    createVersion, 
    updateVersion,
    deleteVersion,
    getDownload
} from '../models/channel';

channel()


const storage = multer.diskStorage({ // Initialise le stockage des fichiers
    destination: function (req, file, cb) { // Définit le chemin de destination des fichiers
        if (fs.existsSync('uploads/') === false) fs.mkdirSync('uploads/')
        cb(null, 'uploads/') // Définit le chemin de destination des fichiers
    },
    filename: function (req, file, cb) { // Définit le nom des fichiers
        cb(null, file.originalname) // Définit le nom des fichiers
    }
})

dotenv.config()
const upload = multer({ storage: storage });
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
    .post((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            console.log(req.body.name)
            res.json(createChannel(req.body.name));
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
    .put((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            updateChannel(req.params.channel, req.body.name);
            res.json(getChannel(req.params.channel));
        }
        else {
            res.status(403).send('Forbidden');
        }
    })
    .delete((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            res.json(deleteChannel(req.params.channel));
        }
        else {
            res.status(403).send('Forbidden');
        }
    })

router.route('/:channel/versions')
    .get((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            res.json(getChannel(req.params.channel).versions);
        }
        else {
            res.status(403).send('Forbidden');
        }
    })
    .post(upload.array('files', 1), (req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            res.json(createVersion(req.params.channel, req.body.name, req.body.changelog, req.files, req.body.forgeVersion));
        }
        else {
            res.status(403).send('Forbidden');
        }
    })

router.route('/:channel/versions/:version')
    .get((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            res.json(getVersion(req.params.channel, req.params.version));
        }
        else {
            res.status(403).send('Forbidden');
        }
    })
    .put(upload.array('files', 1), async (req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            const { newName, changelog, files, forgeVersion } = req.body
            const { channel, version } = req.params

            if (newName) {
                await updateVersion(channel, version, newName)
            }

            if (changelog) {
                await updateVersion(channel, version, undefined, changelog)
            }

            if (files) {
                await updateVersion(channel, version, undefined, undefined, files)
            }

            if (forgeVersion) {
                await updateVersion(channel, version, undefined, undefined, undefined, forgeVersion)
            }

            res.json(getVersion(channel, version));
        }
        else {
            res.status(403).send('Forbidden');
        }
    })
    .delete((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            res.json(deleteVersion(req.params.channel, req.params.version));
        }
        else {
            res.status(403).send('Forbidden');
        }
    })

router.route('/:channel/versions/:version/download')
    .get((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            res.download(path.join(getDownload(req.params.channel, req.params.version)));
        }
        else {
            res.status(403).send('Forbidden');
        }
    })

export default router;