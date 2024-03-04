import express from 'express';

const router = express.Router();

router.route('/')
    .get((req, res) => {
        res.send(200);
    })

export default router;