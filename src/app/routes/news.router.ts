import express from "express";
import dotenv from "dotenv";

import {
    getNews,
    getNewsById,
    addNews,
    deleteNews,
    updateNews
} from "../services/news.service";

dotenv.config();

const router = express.Router();

/**
 * @openapi
 * /news:
 *  parameters:
 *   - in: header
 *     name: token
 *     required: true
 *     schema:
 *      type: uuid
 *     description: Token to access the API
 *  get:
 *   tags:
 *    - News
 *   summary: Get all news
 *   responses:
 *    200:
 *     description: A list of news
 *     content:
 *      application/json:
 *       schema:
 *        type: array
 *        items:
 *         $ref: '#/components/schemas/getNewsResponse'
 *    401:
 *     description: Unauthorized
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         message:
 *          type: string
 *          example: Unauthorized
 *    404:
 *     description: Not found
 *      
 *  post:
 *   tags:
 *    - News
 *   summary: Add a news
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/News'
 *   responses:
 *    200:
 *     description: The news has been added
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/News'
 *    401:
 *     description: Unauthorized
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         message:
 *          type: string
 *          example: Unauthorized
 *    404:
 *     description: Not found
 */

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

/**
 * @openapi
 * /news/{id}:
 *  parameters:
 *   - in: header
 *     name: token
 *     required: true
 *     schema:
 *      type: uuid
 *      description: Token to access the API
 *   - in: path
 *     name: id
 *     required: true
 *     schema:
 *      type: integer
 *      description: News ID
 *      example: 0
 *      minimum: 0
 *  get:
 *   tags:
 *    - News
 *   summary: Get a news by ID
 *   responses:
 *    200:
 *     description: A news
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/News'
 *    401:
 *     description: Unauthorized
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         message:
 *          type: string
 *          example: Unauthorized
 *    404:
 *     description: Not found
 * 
 *  delete:
 *   tags:
 *    - News
 *   summary: Delete a news by ID
 *   responses:
 *    204:
 *     description: The news has been deleted
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         message:
 *          type: string
 *          example: News deleted
 *     401:
 *      description: Unauthorized
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          message:
 *           type: string
 *           example: Unauthorized
 *     404:
 *      description: Not found
 * 
 *  put:
 *   tags:
 *    - News
 *   summary: Update a news by ID
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/News'
 *   responses:
 *    204:
 *     description: The news has been updated
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         message:
 *          type: string
 *          example: News updated
 *    401:
 *     description: Unauthorized
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         message:
 *          type: string
 *          example: Unauthorized
 *    404:
 *     description: Not found
 * 
 */

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