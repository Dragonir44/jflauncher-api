import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

import { 
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
} from '../services/channel.service';

import { getVersionResponse } from '../schema/channel.schema';


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

/**
 * @openapi
 * /channels:
 *  parameters:
 *     - in: header
 *       name: token
 *       required: true
 *       schema:
 *          type: string
 *          format: uuid
 *  get:
 *   tags:
 *    - Channels
 *   summary: Get all channels
 *   parameters:
 *    - in: header
 *      name: token
 *      required: true
 *      schema:
 *       type: string
 *       format: uuid
 *   responses:
 *    200:
 *     description: Returns all channels
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/getChannelsResponse'
 *    403:
 *     description: Forbidden
 *  post:
 *   tags:
 *    - Channels
 *   summary: Create a new channel
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/postChannelRequest'
 *   responses:
 *    200:
 *     description: Returns the created channel
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/postChannelResponse'
 *    403:
 *     description: Forbidden
 *  
 */


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
            res.json(createChannel(req.body.name));
        }
        else {
            res.status(403).send('Forbidden');
        }
    })

/**
 * @openapi
 * /channels/{channel}:
 *  parameters:
 *     - in: header
 *       name: token
 *       required: true
 *       schema:
 *        type: string
 *        format: uuid
 *     - in: path
 *       name: channel
 *       required: true
 *       schema:
 *        type: string
 *        minimum: 1
 *  get:
 *   tags:
 *    - Channels
 *   summary: Get a channel
 *   responses:
 *    200:
 *     description: Returns the channel
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/getChannelResponse'
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Not Found
 * 
 *  put:
 *   tags:
 *    - Channels
 *   summary: Update a channel
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/postChannelRequest'
 *   responses:
 *    200:
 *     description: Returns the updated channel
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/postChannelResponse'
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Not Found
 * 
 *  delete:
 *   tags:
 *    - Channels
 *   summary: Delete a channel
 *   responses:
 *    200:
 *     description: Success
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Not Found
 */

router.route('/:channel')
    .get((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            try {
                res.json(getChannel(req.params.channel));
            }
            catch (e: any) {
                res.status(404).send(`Not Found : ${e.message}`);
            }
        }
        else {
            res.status(403).send('Forbidden');
        }
    })
    .put((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            try {
                updateChannel(req.params.channel, req.body.name);
                res.json(getChannel(req.params.channel));
            }
            catch (e: any) {
                res.status(404).send(`Not Found : ${e.message}`);
            }
        }
        else {
            res.status(403).send('Forbidden');
        }
    })
    .delete((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            try {
                res.json(deleteChannel(req.params.channel));
            }
            catch (e: any) {
                res.status(404).send(`Not Found : ${e.message}`);
            }
        }
        else {
            res.status(403).send('Forbidden');
        }
    })

/**
 * @openapi
 * /channels/{channel}/versions:
 *  parameters:
 *   - in: header
 *     name: token
 *     required: true
 *     schema:
 *      type: string
 *      format: uuid
 *   - in: path
 *     name: channel
 *     required: true
 *     schema:
 *      type: string
 *      minimum: 1
 *  get:
 *   tags:
 *    - Versions
 *   summary: Get all versions of a channel
 *   responses:
 *    200:
 *     description: Returns all versions of a channel
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/getVersionsResponse'
 *   403:
 *    description: Forbidden
 *   404:
 *    description: Not Found
 * 
 *  post:
 *   tags:
 *    - Versions
 *   summary: Create a new version
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/postVersionRequest'
 */

router.route('/:channel/versions')
    .get((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            try {
                res.json(getChannel(req.params.channel).versions);
            }
            catch (e: any) {
                res.status(404).send(`Not Found : ${e.message}`);
            }
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

/**
 * @openapi
 * /channels/{channel}/versions/{version}:
 *  parameters:
 *   - in: header
 *     name: token
 *     required: true
 *     schema:
 *      type: string
 *      format: uuid
 *   - in: path
 *     name: channel
 *     required: true
 *     schema:
 *      type: string
 *      minimum: 1
 *   - in: path
 *     name: version
 *     required: true
 *     schema:
 *      type: string
 *      minimum: 1
 *  get:
 *   tags:
 *    - Versions
 *   summary: Get a version
 *   responses:
 *    200:
 *     description: Returns the version
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/getVersionResponse'
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Not Found
 * 
 *  put:
 *   tags:
 *    - Versions
 *   summary: Update a version
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/putVersionRequest'
 *   responses:
 *    200:
 *     description: Returns the updated version
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/putVersionResponse'
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Not Found
 * 
 *  delete:
 *   tags:
 *    - Versions
 *   summary: Delete a version
 *   responses:
 *    200:
 *     description: Success
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/deleteVersionResponse'
 *    403:
 *     description: Forbidden
 *    404:
 *     description: Not Found
 */

router.route('/:channel/versions/:version')
    .get((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            try {
                res.json(getVersion(req.params.channel, req.params.version));
            }
            catch (e: any) {
                res.status(404).send(`Not Found : ${e.message}`);
            }
        }
        else {
            res.status(403).send('Forbidden');
        }
    })
    .put(upload.array('files', 1), async (req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            const { newName, changelog, files, forgeVersion } = req.body
            const { channel, version } = req.params

            try {
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
                    if (!new RegExp(/1\.20\.1-[0-9]{2}\.[0-9]{1}\.[0-9]{1,2}/).test(forgeVersion))
                        return res.status(400).send('Bad Request format');
                    await updateVersion(channel, version, undefined, undefined, undefined, forgeVersion)
                }
    
                res.json(getVersion(channel, version));
            }
            catch (e: any) {
                res.status(404).send(`Not Found : ${e.message}`);
            }
        }
        else {
            res.status(403).send('Forbidden');
        }
    })
    .delete((req, res) => {
        if (req.headers['token'] === process.env.TOKEN) {
            try {
                res.json(deleteVersion(req.params.channel, req.params.version));
            }
            catch (e: any) {
                res.status(404).send(`Not Found : ${e.message}`);
            }
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