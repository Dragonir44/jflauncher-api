import express from 'express';

const router = express.Router();

/**
 * @openapi
 * /health:
 *  get:
 *    tags:
 *      - Healthcheck
 *    description: Healthcheck endpoint
 *    responses: 
 *      200:
 *        description: App is running
 */

router.route('/')
    .get((req, res) => {
        res.sendStatus(200);
    })

export default router;